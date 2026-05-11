"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/browser";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionRequired } from "@/components/SubscriptionRequired";

import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Pin, Trash2, Users, Image as ImageIcon, Send, Unlock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CommunityGroup {
  id: string;
  membership_plan_id: string;
  name: string;
  description: string | null;
  type: string;
  access_type: string;
  created_at: string;
  updated_at: string;
}

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  is_pinned: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author_id: string;
  profiles: {
    full_name: string;
  } | null;
}

const AdminCommunity = () => {
  const params = useParams<{ membershipId: string }>();
  const membershipId = params?.membershipId;
  const router = useRouter();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  // Check if user has active subscription
  const hasActiveSubscription = profile?.subscription_active || profile?.beta_tester || profile?.lifetime_access;

  const [newPostContent, setNewPostContent] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch community group
  const { data: communityGroup } = useQuery({
    queryKey: ["communityGroup", membershipId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_groups")
        .select("*")
        .eq("membership_plan_id", membershipId!)
        .maybeSingle();
      
      if (error) throw error;
      return data as CommunityGroup;
    },
    enabled: !!membershipId,
  });

  // Fetch membership plan (kept for side effect / query caching)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: _membership } = useQuery({
    queryKey: ["membershipPlan", membershipId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("membership_plans")
        .select("*")
        .eq("id", membershipId!)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!membershipId,
  });

  // Fetch posts
  const { data: posts, isLoading: loadingPosts } = useQuery({
    queryKey: ["communityPosts", membershipId],
    queryFn: async () => {
      // First get posts
      const { data: postsData, error: postsError } = await supabase
        .from("community_posts")
        .select("*")
        .eq("membership_plan_id", membershipId!)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      
      if (postsError) throw postsError;
      if (!postsData) return [];

      // Get unique author IDs
      const authorIds = [...new Set(postsData.map(post => post.author_id))];
      
      // Fetch profiles for authors
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", authorIds);
      
      // Create a map of user_id to profile
      const profilesMap = (profilesData || []).reduce((acc, profile) => {
        if (profile.user_id) acc[profile.user_id] = { user_id: profile.user_id, full_name: profile.full_name ?? "" };
        return acc;
      }, {} as Record<string, { user_id: string; full_name: string }>);

      // Combine posts with profiles
      const postsWithProfiles = postsData.map(post => ({
        ...post,
        profiles: post.author_id ? (profilesMap[post.author_id] || null) : null
      }));

      return postsWithProfiles as Post[];
    },
    enabled: !!membershipId,
  });

  // Fetch member count
  const { data: memberCount } = useQuery({
    queryKey: ["memberCount", membershipId],
    queryFn: async () => {
      const { count } = await supabase
        .from("membership_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("membership_plan_id", membershipId!)
        .eq("status", "active");
      
      return count || 0;
    },
    enabled: !!membershipId,
  });

  // Upload image
  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('community-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('community-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.user_id || !membershipId || !newPostContent.trim()) {
        throw new Error("Missing required data");
      }

      let imageUrl = null;
      if (imageFile) {
        setUploadingImage(true);
        imageUrl = await uploadImage(imageFile);
      }

      const { error } = await supabase
        .from("community_posts")
        .insert({
          membership_plan_id: membershipId!,
          author_id: profile.user_id,
          content: newPostContent,
          image_url: imageUrl,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts", membershipId] });
      setNewPostContent("");
      setImageFile(null);
      setImagePreview(null);
      setUploadingImage(false);
      toast.success("Post creat cu succes!");
    },
    onError: (error) => {
      setUploadingImage(false);
      toast.error("Eroare la crearea postului: " + error.message);
    },
  });

  // Toggle pin mutation
  const togglePinMutation = useMutation({
    mutationFn: async ({ postId, isPinned }: { postId: string; isPinned: boolean }) => {
      const { error } = await supabase
        .from("community_posts")
        .update({ is_pinned: !isPinned })
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts", membershipId] });
      toast.success("Post actualizat!");
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("community_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts", membershipId] });
      toast.success("Post șters!");
    },
  });

  // Update community access type
  const updateAccessTypeMutation = useMutation({
    mutationFn: async (accessType: string) => {
      if (!communityGroup) throw new Error("No community group");

      const { error } = await supabase
        .from("community_groups")
        .update({ access_type: accessType })
        .eq("id", communityGroup.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityGroup", membershipId] });
      toast.success("Setări comunitate actualizate!");
    },
    onError: (error) => {
      toast.error("Eroare: " + error.message);
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user || !profile) {
    router.push("/login");
    return null;
  }

  // Block access if no active subscription
  if (profile && !hasActiveSubscription) {
    return <SubscriptionRequired />;
  }

  return (
    <>
      

      
      
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 container mx-auto px-4 pt-8 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 mb-6 -ml-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/my-communities")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Comunități
              </Button>
            </div>

            {!communityGroup ? (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Comunitatea nu există încă</CardTitle>
                  <CardDescription>
                    Creează comunitatea din pagina cursului, apoi revino aici pentru administrare.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">{communityGroup?.name}</h1>
              <p className="text-muted-foreground">{communityGroup?.description}</p>
              <div className="flex items-center gap-4 mt-4 flex-wrap">
                <Badge variant="secondary" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {memberCount} membri activi
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Tip acces:</span>
                  <Select
                    value={communityGroup?.access_type || "free"}
                    onValueChange={(value) => updateAccessTypeMutation.mutate(value)}
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">
                        <div className="flex items-center gap-2">
                          <Unlock className="w-4 h-4 text-green-600" />
                          <span>Gratuit (fără cont, acces pe link)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            )}

            {/* Create Post Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Crează un post nou</CardTitle>
                <CardDescription>Postează ca administrator al comunității</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Ce vrei să împărtășești membrilor?"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  
                  {imagePreview && (
                    <div className="relative w-full max-w-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="Preview" className="rounded-lg w-full" />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <Button variant="outline" type="button" asChild>
                        <span>
                          <ImageIcon className="mr-2 h-4 w-4" />
                          Adaugă imagine
                        </span>
                      </Button>
                    </label>
                    
                    <Button
                      onClick={() => createPostMutation.mutate()}
                      disabled={!newPostContent.trim() || uploadingImage}
                      className="ml-auto"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {uploadingImage ? "Se încarcă..." : "Postează"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Toate postările</h2>
              
              {loadingPosts ? (
                <div className="text-center py-8 text-muted-foreground">
                  Se încarcă postările...
                </div>
              ) : posts && posts.length > 0 ? (
                posts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {post.profiles?.full_name || "Utilizator"}
                            {post.is_pinned && (
                              <Badge variant="secondary" className="text-xs">
                                <Pin className="w-3 h-3 mr-1" />
                                Fixat
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>
                            {new Date(post.created_at).toLocaleDateString('ro-RO', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePinMutation.mutate({ postId: post.id, isPinned: post.is_pinned })}
                          >
                            <Pin className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm("Sigur vrei să ștergi acest post?")) {
                                deletePostMutation.mutate(post.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap mb-4">{post.content}</p>
                      {post.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.image_url}
                          alt="Post"
                          className="rounded-lg max-w-full h-auto mb-4"
                        />
                      )}
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{post.likes_count} likes</span>
                        <span>{post.comments_count} comentarii</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground">
                      Comunitatea este goală. Crează primul post!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AdminCommunity;
