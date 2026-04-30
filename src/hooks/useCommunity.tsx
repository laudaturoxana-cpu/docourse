import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/browser";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface CommunityPost {
  id: string;
  membership_plan_id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  tags: string[] | null;
  is_pinned: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string;
  } | null;
  user_liked: boolean;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  parent_comment_id: string | null;
  content: string;
  mentions: string[] | null;
  likes_count: number;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
  user_liked: boolean;
  replies?: CommunityComment[];
}

export const useCommunity = (membershipPlanId: string | undefined) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isInitialMount = useRef(true);

  // Subscribe to realtime updates for posts and comments
  useEffect(() => {
    if (!membershipPlanId) return;

    // Mark initial mount as complete after a short delay
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 2000);

    // Subscribe to new posts
    const postsChannel = supabase
      .channel(`community-posts-${membershipPlanId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_posts',
          filter: `membership_plan_id=eq.${membershipPlanId}`
        },
        async (payload) => {
          // Don't show notification for own posts or on initial mount
          if (payload.new.author_id === user?.id || isInitialMount.current) return;
          
          // Fetch author name
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', payload.new.author_id)
            .single();
          
          const authorName = profile?.full_name || 'Cineva';
          toast.info(`${authorName} a publicat o postare nouă`, {
            description: payload.new.content?.substring(0, 50) + (payload.new.content?.length > 50 ? '...' : ''),
            duration: 5000,
          });
          
          // Refresh posts
          queryClient.invalidateQueries({ queryKey: ["communityPosts", membershipPlanId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'community_posts',
          filter: `membership_plan_id=eq.${membershipPlanId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["communityPosts", membershipPlanId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'community_posts',
          filter: `membership_plan_id=eq.${membershipPlanId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["communityPosts", membershipPlanId] });
        }
      )
      .subscribe();

    // Subscribe to new comments
    const commentsChannel = supabase
      .channel(`community-comments-${membershipPlanId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_comments'
        },
        async (payload) => {
          // Don't show notification for own comments or on initial mount
          if (payload.new.author_id === user?.id || isInitialMount.current) return;
          
          // Fetch author name
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', payload.new.author_id)
            .single();
          
          const authorName = profile?.full_name || 'Cineva';
          toast.info(`${authorName} a adăugat un comentariu`, {
            description: payload.new.content?.substring(0, 50) + (payload.new.content?.length > 50 ? '...' : ''),
            duration: 4000,
          });
          
          // Refresh posts to update comment counts
          queryClient.invalidateQueries({ queryKey: ["communityPosts", membershipPlanId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'community_comments'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["communityPosts", membershipPlanId] });
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [membershipPlanId, user?.id, queryClient]);

  // Fetch posts for a membership plan using RPC
  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["communityPosts", membershipPlanId],
    queryFn: async () => {
      if (!membershipPlanId) return [];

      // Use RPC to bypass RLS
      const { data: postsData, error } = await supabase
        .rpc("get_community_posts", { _plan_id: membershipPlanId });

      if (error) {
        console.error("Error fetching posts:", error);
        throw error;
      }
      if (!postsData) return [];

      // Fetch author profiles
      const authorIds = [...new Set(postsData.map((p: { author_id: string }) => p.author_id))].filter(Boolean);
      const profiles = authorIds.length > 0
        ? (await supabase
            .from("profiles")
            .select("user_id, full_name")
            .in("user_id", authorIds)).data
        : [];

      const profilesMap = (profiles || []).reduce((acc, profile) => {
        if (profile.user_id) acc[profile.user_id] = { user_id: profile.user_id, full_name: profile.full_name ?? "" };
        return acc;
      }, {} as Record<string, { user_id: string; full_name: string }>);

      // Check if user liked each post using RPC
      let likedPostIds = new Set<string>();
      if (user) {
        const postIds = postsData.map((p: { id: string }) => p.id);
        if (postIds.length > 0) {
          const { data: likedIds } = await supabase
            .rpc("get_user_post_likes", { _post_ids: postIds });

          likedPostIds = new Set(likedIds || []);
        }
      }

      return postsData.map((post: { id: string; author_id: string }) => ({
        ...post,
        profiles: profilesMap[post.author_id] || null,
        user_liked: likedPostIds.has(post.id)
      })) as unknown as CommunityPost[];
    },
    enabled: !!membershipPlanId,
  });

  // Fetch comments for a post using RPC
  const fetchComments = async (postId: string) => {
    const { data: commentsData, error } = await supabase
      .rpc("get_post_comments", { _post_id: postId });

    if (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
    if (!commentsData) return [];

    // Fetch author profiles
    const authorIds = [...new Set(commentsData.map((c: { author_id: string }) => c.author_id))].filter(Boolean);
    const profiles = authorIds.length > 0
      ? (await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", authorIds)).data
      : [];

    const profilesMap = (profiles || []).reduce((acc, profile) => {
      if (profile.user_id) acc[profile.user_id] = { user_id: profile.user_id, full_name: profile.full_name ?? "" };
      return acc;
    }, {} as Record<string, { user_id: string; full_name: string }>);

    // Check if user liked each comment using RPC
    let userLikes: Set<string> = new Set();
    if (user) {
      const commentIds = commentsData.map((c: { id: string }) => c.id);
      if (commentIds.length > 0) {
        const { data: likedIds } = await supabase
          .rpc("get_user_comment_likes", { _comment_ids: commentIds });

        userLikes = new Set(likedIds || []);
      }
    }

    // Build comment tree
    const commentsWithLikes = commentsData.map((comment: { id: string; author_id: string }) => ({
      ...comment,
      profiles: profilesMap[comment.author_id] || null,
      user_liked: userLikes.has(comment.id),
      replies: []
    })) as unknown as CommunityComment[];

    const commentMap = new Map<string, CommunityComment>();
    const rootComments: CommunityComment[] = [];

    commentsWithLikes.forEach(comment => {
      commentMap.set(comment.id, comment);
    });

    commentsWithLikes.forEach(comment => {
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  };

  // Create post using RPC
  const createPostMutation = useMutation({
    mutationFn: async (postData: {
      content: string;
      image_url?: string | null;
      tags?: string[];
    }) => {
      if (!user || !membershipPlanId) throw new Error("Not authenticated or no membership plan");

      const { data, error } = await supabase
        .rpc("create_community_post", {
          _plan_id: membershipPlanId,
          _content: postData.content,
          _image_url: postData.image_url ?? undefined,
          _tags: postData.tags ?? undefined
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      toast.success("Postare creată cu succes!");
    },
    onError: (error) => {
      toast.error("Eroare la crearea postării: " + error.message);
    },
  });

  // Toggle post like using RPC
  const togglePostLikeMutation = useMutation({
    mutationFn: async ({ postId }: { postId: string; isLiked: boolean }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .rpc("toggle_post_like", { _post_id: postId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
    },
  });

  // Create comment using RPC
  const createCommentMutation = useMutation({
    mutationFn: async (commentData: {
      post_id: string;
      content: string;
      parent_comment_id?: string | null;
      mentions?: string[];
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .rpc("create_community_comment", {
          _post_id: commentData.post_id,
          _content: commentData.content,
          _parent_comment_id: commentData.parent_comment_id ?? undefined,
          _mentions: commentData.mentions ?? undefined
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      toast.success("Comentariu adăugat!");
    },
    onError: (error) => {
      toast.error("Eroare la adăugarea comentariului: " + error.message);
    },
  });

  // Toggle comment like using RPC
  const toggleCommentLikeMutation = useMutation({
    mutationFn: async ({ commentId }: { commentId: string; isLiked: boolean }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .rpc("toggle_comment_like", { _comment_id: commentId });

      if (error) throw error;
    },
  });

  // Pin/unpin post (creator only)
  const togglePinMutation = useMutation({
    mutationFn: async ({ postId, isPinned }: { postId: string; isPinned: boolean }) => {
      const { error } = await supabase
        .from("community_posts")
        .update({ is_pinned: !isPinned })
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      toast.success("Post updated!");
    },
  });

  // Delete post
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("community_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      toast.success("Post deleted!");
    },
  });

  // Delete comment
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("community_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      toast.success("Comment deleted!");
    },
  });

  // Upload image to storage
  const uploadImage = async (file: File): Promise<string> => {
    if (!user) throw new Error("Not authenticated");

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('community-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('community-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  return {
    posts,
    isLoadingPosts,
    fetchComments,
    createPost: createPostMutation.mutate,
    togglePostLike: togglePostLikeMutation.mutate,
    createComment: createCommentMutation.mutate,
    toggleCommentLike: toggleCommentLikeMutation.mutate,
    togglePin: togglePinMutation.mutate,
    deletePost: deletePostMutation.mutate,
    deleteComment: deleteCommentMutation.mutate,
    uploadImage,
  };
};
