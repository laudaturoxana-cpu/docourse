"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Users, MessageSquare, BookOpen, Pin, Send, SmilePlus, Lock,
  Trash2, ArrowLeft, LayoutDashboard, GraduationCap, ChevronDown,
  ChevronUp, ImageIcon, X, Bell, BellOff, Trophy, Calendar, MessageCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase/browser";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import dynamic from "next/dynamic";

const CommunityLeaderboard = dynamic(() => import("@/components/community/CommunityLeaderboard"), { ssr: false });
const CommunityEventsTab = dynamic(() => import("@/components/community/CommunityEventsTab"), { ssr: false });
const DirectMessageDialog = dynamic(() => import("@/components/community/DirectMessageDialog"), { ssr: false });

const EMOJIS = ["👍", "❤️", "🔥", "🎉", "😂", "👏", "💪", "✅"];

interface Community {
  id: string; name: string; description: string | null;
  cover_image_url: string | null; slug: string;
  creator_id: string; creator_name: string; creator_avatar: string | null;
  is_member: boolean; member_count: number;
}
interface Post {
  id: string; content: string; image_url: string | null;
  is_pinned: boolean; created_at: string;
  author_id: string; author_name: string; author_avatar: string | null;
  reactions: Record<string, number>; my_reactions: string[]; comments_count: number;
}
interface Comment {
  id: string; post_id: string; author_id: string;
  author_name: string; author_avatar: string | null;
  content: string; created_at: string;
}
interface CourseSetting {
  course_id: string; access_type: "free" | "paid";
  title: string; slug: string; image_url: string | null;
}
interface Member { user_id: string; name: string; avatar: string | null; }

type Tab = "feed" | "cursuri" | "leaderboard" | "events" | "members";

// ── Skeleton ─────────────────────────────────────────────────────────────────
function PostSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-200 skeleton shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 w-32 rounded-full bg-gray-200 skeleton" />
          <div className="h-2.5 w-20 rounded-full bg-gray-100 skeleton" />
        </div>
      </div>
      <div className="h-3 w-full rounded-full bg-gray-100 skeleton" />
      <div className="h-3 w-4/5 rounded-full bg-gray-100 skeleton" />
      <div className="h-3 w-3/5 rounded-full bg-gray-100 skeleton" />
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 skeleton shrink-0" />
          <div className="h-3 w-28 rounded-full bg-gray-100 skeleton" />
        </div>
      ))}
    </div>
  );
}

export default function CreatorCommunityPage() {
  const _params = useParams<{ slug: string }>();
  const slug = _params?.slug;
  const router = useRouter();
  const { user } = useAuth();

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [courses, setCourses] = useState<CourseSetting[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState<Tab>("feed");
  const [newPost, setNewPost] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [posting, setPosting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Comments state
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [commentsLoading, setCommentsLoading] = useState<Set<string>>(new Set());
  const [submittingComment, setSubmittingComment] = useState<Set<string>>(new Set());

  // Track freshly added IDs for entrance animation
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());

  // DM state
  const [dmTarget, setDmTarget] = useState<{ user_id: string; full_name: string } | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (slug) loadCommunity(); }, [slug, user]);

  useEffect(() => {
    if (!community?.id) return;
    const canSee = community.is_member || (user && user.id === community.creator_id);
    if (!canSee) return;

    if (realtimeChannelRef.current) supabase.removeChannel(realtimeChannelRef.current);

    const channel = supabase
      .channel(`comm-broadcast-${community.id}`)
      .on("broadcast", { event: "new_post" }, ({ payload }) => {
        const p = payload as Post;
        setPosts((prev) => prev.find((x) => x.id === p.id) ? prev : [p, ...prev]);
        setFreshIds((s) => new Set(s).add(p.id));
      })
      .on("broadcast", { event: "delete_post" }, ({ payload }) => {
        setPosts((prev) => prev.filter((x) => x.id !== payload.id));
      })
      .on("broadcast", { event: "update_post" }, ({ payload }) => {
        setPosts((prev) => {
          const updated = prev.map((x) => x.id === payload.id ? { ...x, is_pinned: payload.is_pinned } : x);
          return [...updated].sort((a, b) => {
            if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
        });
      })
      .on("broadcast", { event: "new_comment" }, ({ payload }) => {
        const c = payload as Comment;
        setComments((prev) => {
          const existing = prev[c.post_id] || [];
          if (existing.find((x) => x.id === c.id)) return prev;
          return { ...prev, [c.post_id]: [...existing, c] };
        });
        setPosts((prev) => prev.map((p) => p.id === c.post_id ? { ...p, comments_count: p.comments_count + 1 } : p));
      })
      .on("broadcast", { event: "delete_comment" }, ({ payload }) => {
        setComments((prev) => ({
          ...prev,
          [payload.post_id]: (prev[payload.post_id] || []).filter((c) => c.id !== payload.id),
        }));
        setPosts((prev) => prev.map((p) =>
          p.id === payload.post_id ? { ...p, comments_count: Math.max(0, p.comments_count - 1) } : p
        ));
      })
      .subscribe();

    realtimeChannelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [community?.id, community?.is_member, user?.id]);

  const loadCommunity = async () => {
    const { data: rows } = await supabase.rpc("get_creator_community", { _slug: slug! });
    if (!rows || rows.length === 0) { setNotFound(true); setLoading(false); return; }
    const comm = rows[0] as Community;
    setCommunity(comm);
    if (comm.is_member || (user && user.id === comm.creator_id)) {
      await Promise.all([loadPosts(comm.id), loadMembers(comm.id)]);
    }
    await loadCourses(comm.id);
    setLoading(false);
  };

  const loadPosts = async (communityId: string) => {
    const { data: postsData } = await supabase
      .from("creator_community_posts")
      .select("id, content, image_url, is_pinned, created_at, author_id")
      .eq("community_id", communityId)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50);
    if (!postsData) return;

    const authorIds = [...new Set(postsData.map((p) => p.author_id))];
    const [{ data: profiles }, { data: reactionsData }, { data: commentCounts }] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, avatar_url").in("user_id", authorIds),
      supabase.from("creator_community_reactions").select("post_id, emoji, user_id").in("post_id", postsData.map((p) => p.id)),
      supabase.from("creator_community_comments").select("post_id").in("post_id", postsData.map((p) => p.id)),
    ]);

    const profileMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
    (profiles || []).forEach((p) => { if (p.user_id) profileMap[p.user_id] = p; });

    const reactionsMap: Record<string, Record<string, number>> = {};
    const myReactionsMap: Record<string, string[]> = {};
    (reactionsData || []).forEach((r) => {
      if (!reactionsMap[r.post_id]) reactionsMap[r.post_id] = {};
      reactionsMap[r.post_id][r.emoji] = (reactionsMap[r.post_id][r.emoji] || 0) + 1;
      if (r.user_id === user?.id) {
        if (!myReactionsMap[r.post_id]) myReactionsMap[r.post_id] = [];
        myReactionsMap[r.post_id].push(r.emoji);
      }
    });

    const countMap: Record<string, number> = {};
    (commentCounts || []).forEach((c) => { countMap[c.post_id] = (countMap[c.post_id] || 0) + 1; });

    setPosts(postsData.map((p) => ({
      ...p,
      is_pinned: p.is_pinned ?? false,
      created_at: p.created_at ?? new Date().toISOString(),
      author_name: profileMap[p.author_id]?.full_name || "Utilizator",
      author_avatar: profileMap[p.author_id]?.avatar_url || null,
      reactions: reactionsMap[p.id] || {},
      my_reactions: myReactionsMap[p.id] || [],
      comments_count: countMap[p.id] || 0,
    })) as Post[]);
  };

  const loadMembers = async (communityId: string) => {
    const { data } = await supabase
      .from("community_memberships")
      .select("user_id")
      .eq("community_id", communityId)
      .limit(8);
    if (!data || data.length === 0) return;
    const { data: profiles } = await supabase
      .from("profiles").select("user_id, full_name, avatar_url")
      .in("user_id", data.map((m) => m.user_id));
    const pm: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
    (profiles || []).forEach((p) => { if (p.user_id) pm[p.user_id] = p; });
    setMembers(data.map((m) => ({
      user_id: m.user_id,
      name: pm[m.user_id]?.full_name || "Utilizator",
      avatar: pm[m.user_id]?.avatar_url || null,
    })));
  };

  const loadCourses = async (communityId: string) => {
    const { data: settings } = await supabase
      .from("community_course_settings").select("course_id, access_type").eq("community_id", communityId);
    if (!settings || settings.length === 0) return;
    const { data: coursesData } = await supabase
      .from("courses").select("id, title, slug, image_url").in("id", settings.map((s) => s.course_id));
    const courseMap: Record<string, { id: string; title: string; slug: string; image_url: string | null }> = {};
    (coursesData || []).forEach((c) => { courseMap[c.id] = c; });
    setCourses(settings.map((s) => ({
      course_id: s.course_id, access_type: s.access_type as "free" | "paid",
      title: courseMap[s.course_id]?.title || "",
      slug: courseMap[s.course_id]?.slug || "",
      image_url: courseMap[s.course_id]?.image_url || null,
    })).filter((s) => s.title));
  };

  const loadComments = useCallback(async (postId: string) => {
    if (comments[postId]) return;
    setCommentsLoading((prev) => new Set(prev).add(postId));
    const { data } = await supabase
      .from("creator_community_comments")
      .select("id, post_id, author_id, content, created_at")
      .eq("post_id", postId).order("created_at", { ascending: true });

    if (data && data.length > 0) {
      const authorIds = [...new Set(data.map((c) => c.author_id))];
      const { data: profiles } = await supabase
        .from("profiles").select("user_id, full_name, avatar_url").in("user_id", authorIds);
      const pm: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      (profiles || []).forEach((p) => { if (p.user_id) pm[p.user_id] = p; });
      setComments((prev) => ({
        ...prev,
        [postId]: data.map((c) => ({
          ...c,
          created_at: c.created_at ?? new Date().toISOString(),
          author_name: pm[c.author_id]?.full_name || "Utilizator",
          author_avatar: pm[c.author_id]?.avatar_url || null,
        })) as Comment[],
      }));
    } else {
      setComments((prev) => ({ ...prev, [postId]: [] }));
    }
    setCommentsLoading((prev) => { const s = new Set(prev); s.delete(postId); return s; });
  }, [comments]);

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) { next.delete(postId); } else { next.add(postId); loadComments(postId); }
      return next;
    });
  };

  const submitComment = async (postId: string) => {
    const text = (commentInput[postId] || "").trim();
    if (!text || !user) return;
    setSubmittingComment((prev) => new Set(prev).add(postId));
    const { data, error } = await supabase
      .from("creator_community_comments")
      .insert({ post_id: postId, author_id: user.id, content: text })
      .select("id, post_id, author_id, content, created_at").single();
    if (error) {
      toast({ title: "Eroare", description: error.message, variant: "destructive" });
    } else if (data) {
      const { data: prof } = await supabase.from("profiles").select("full_name, avatar_url").eq("user_id", user.id).single();
      const fullComment: Comment = {
        ...data,
        created_at: data.created_at ?? new Date().toISOString(),
        author_name: prof?.full_name || "Tu",
        author_avatar: prof?.avatar_url || null,
      };
      setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), fullComment] }));
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p));
      setCommentInput((prev) => ({ ...prev, [postId]: "" }));
      realtimeChannelRef.current?.send({ type: "broadcast", event: "new_comment", payload: fullComment });
    }
    setSubmittingComment((prev) => { const s = new Set(prev); s.delete(postId); return s; });
  };

  const deleteComment = async (comment: Comment) => {
    await supabase.from("creator_community_comments").delete().eq("id", comment.id);
    setComments((prev) => ({
      ...prev,
      [comment.post_id]: (prev[comment.post_id] || []).filter((c) => c.id !== comment.id),
    }));
    setPosts((prev) => prev.map((p) =>
      p.id === comment.post_id ? { ...p, comments_count: Math.max(0, p.comments_count - 1) } : p
    ));
    realtimeChannelRef.current?.send({ type: "broadcast", event: "delete_comment", payload: { id: comment.id, post_id: comment.post_id } });
  };

  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !community) return;
    const ALLOWED_MIME = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"];
    if (!ALLOWED_MIME.includes(file.type)) { toast({ title: "Format invalid", description: "Acceptăm doar JPG, PNG, GIF, WebP sau AVIF.", variant: "destructive" }); return; }
    if (file.size > 5 * 1024 * 1024) { toast({ title: "Imaginea e prea mare", description: "Max 5MB.", variant: "destructive" }); return; }
    setUploadingImage(true);
    const ext = file.name.split(".").pop();
    const path = `${community.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("community-images").upload(path, file);
    if (error) {
      toast({ title: "Upload eșuat", description: error.message, variant: "destructive" });
    } else {
      const { data: { publicUrl } } = supabase.storage.from("community-images").getPublicUrl(path);
      setPendingImage(publicUrl);
    }
    setUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleJoin = async () => {
    if (!user) { router.push(`/student-register?redirect=${encodeURIComponent(`/community/${slug}`)}`); return; }
    if (!community) return;
    setJoining(true);
    const { error } = await supabase.from("community_memberships").insert({ community_id: community.id, user_id: user.id });
    if (error) { toast({ title: "Eroare", description: error.message, variant: "destructive" }); }
    else {
      setCommunity((c) => c ? { ...c, is_member: true, member_count: c.member_count + 1 } : c);
      await Promise.all([loadPosts(community.id), loadMembers(community.id)]);
    }
    setJoining(false);
  };

  const handlePost = async () => {
    if (!newPost.trim() || !community || !user) return;
    setPosting(true);
    const { data, error } = await supabase.from("creator_community_posts").insert({
      community_id: community.id, author_id: user.id,
      content: newPost.trim(), image_url: pendingImage,
    }).select("id, content, image_url, is_pinned, created_at, author_id").single();
    if (error) { toast({ title: "Eroare", description: error.message, variant: "destructive" }); }
    else if (data) {
      const { data: prof } = await supabase.from("profiles").select("full_name, avatar_url").eq("user_id", user.id).single();
      const fullPost: Post = {
        ...data, is_pinned: data.is_pinned ?? false,
        created_at: data.created_at ?? new Date().toISOString(),
        author_name: prof?.full_name || "Tu", author_avatar: prof?.avatar_url || null,
        reactions: {}, my_reactions: [], comments_count: 0,
      };
      setPosts((prev) => [fullPost, ...prev]);
      setFreshIds((s) => new Set(s).add(fullPost.id));
      realtimeChannelRef.current?.send({ type: "broadcast", event: "new_post", payload: fullPost });
      setNewPost(""); setPendingImage(null);
      // Send push notification to all other members
      supabase.functions.invoke("send-push-notification", {
        body: {
          community_id: community.id,
          title: community.name,
          body: `${fullPost.author_name}: ${newPost.trim().slice(0, 100)}${newPost.trim().length > 100 ? "…" : ""}`,
          url: `/community/${slug}`,
          exclude_user_id: user.id,
        },
      });
    }
    setPosting(false);
  };

  const handleReact = async (postId: string, emoji: string) => {
    if (!user) { router.push(`/student-login?redirect=${encodeURIComponent(`/community/${slug}`)}`); return; }
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    if (post.my_reactions.includes(emoji)) {
      await supabase.from("creator_community_reactions").delete().eq("post_id", postId).eq("user_id", user.id).eq("emoji", emoji);
      setPosts((prev) => prev.map((p) => p.id !== postId ? p : {
        ...p, reactions: { ...p.reactions, [emoji]: Math.max(0, (p.reactions[emoji] || 1) - 1) },
        my_reactions: p.my_reactions.filter((e) => e !== emoji),
      }));
    } else {
      await supabase.from("creator_community_reactions").insert({ post_id: postId, user_id: user.id, emoji });
      setPosts((prev) => prev.map((p) => p.id !== postId ? p : {
        ...p, reactions: { ...p.reactions, [emoji]: (p.reactions[emoji] || 0) + 1 },
        my_reactions: [...p.my_reactions, emoji],
      }));
    }
    setShowEmojiPicker(null);
  };

  const handlePin = async (postId: string, currentPinned: boolean) => {
    const newPinned = !currentPinned;
    await supabase.from("creator_community_posts").update({ is_pinned: newPinned }).eq("id", postId);
    setPosts((prev) => {
      const updated = prev.map((p) => p.id === postId ? { ...p, is_pinned: newPinned } : p);
      return [...updated].sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    });
    realtimeChannelRef.current?.send({ type: "broadcast", event: "update_post", payload: { id: postId, is_pinned: newPinned } });
  };

  const handleDelete = async (postId: string) => {
    await supabase.from("creator_community_posts").delete().eq("id", postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    realtimeChannelRef.current?.send({ type: "broadcast", event: "delete_post", payload: { id: postId } });
  };

  const handleCourseAccess = async (course: CourseSetting) => {
    const backParam = `?from=${encodeURIComponent(`/community/${slug}`)}`;
    if (course.access_type === "paid") { router.push(`/c/${course.slug}${backParam}`); return; }
    if (!user) { router.push(`/student-register?redirect=${encodeURIComponent(`/community/${slug}`)}`); return; }
    const res = await supabase.functions.invoke("submit-lead-capture", {
      body: { course_id: course.course_id, email: user.email, full_name: null },
    });
    if (res.data?.success) toast({ title: "Acces acordat!", description: "Cursul a fost adăugat în contul tău." });
    router.push(`/course/${course.slug}${backParam}`);
  };

  const isCreator = user && community && user.id === community.creator_id;
  const canSeeContent = community?.is_member || isCreator;

  const { isSupported: pushSupported, isSubscribed, isLoading: pushLoading, subscribe, unsubscribe } =
    usePushNotifications(community?.id ?? "", user?.id);

  const handleToggleNotifications = async () => {
    if (!pushSupported) {
      toast({
        title: "Activează notificările",
        description: "Pe iPhone: apasă Share → Adaugă la ecranul principal, apoi revino aici. Pe Android folosește Chrome.",
      });
      return;
    }
    if (isSubscribed) {
      await unsubscribe();
      toast({ title: "Notificări dezactivate" });
    } else {
      const ok = await subscribe();
      if (ok) toast({ title: "Notificări activate! 🔔", description: "Vei fi notificat când apar postări noi." });
      else toast({ title: "Nu s-a putut activa", description: "Permite notificările în setările browserului.", variant: "destructive" });
    }
  };

  const formatDate = (d: string) => {
    const date = new Date(d), now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "acum";
    if (diff < 3600) return `acum ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `acum ${Math.floor(diff / 3600)}h`;
    return date.toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
  };

  const renderContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) =>
      urlRegex.test(part)
        ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-amber-600 underline break-all">{part}</a>
        : <span key={i}>{part}</span>
    );
  };

  const Avatar = ({ src, name, size = "md" }: { src: string | null; name: string; size?: "sm" | "md" | "lg" }) => {
    const cls = size === "sm" ? "w-7 h-7 text-xs" : size === "lg" ? "w-11 h-11 text-base" : "w-9 h-9 text-sm";
    if (src) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={src} alt={name} className={`${cls} rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm`} />;
    }
    return <div className={`${cls} rounded-full bg-gradient-to-br from-[#0a192f] to-[#1a3a6f] flex items-center justify-center shrink-0 font-bold text-white ring-2 ring-white shadow-sm`}>{name[0]?.toUpperCase()}</div>;
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .skeleton { background: linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; }
      `}</style>
      {/* Nav placeholder */}
      <div className="h-[49px] bg-[#0a192f]" />
      {/* Hero placeholder */}
      <div className="h-40 bg-gradient-to-b from-[#0a192f] to-[#0d2444]" />
      {/* Tabs placeholder */}
      <div className="h-12 bg-white border-b border-gray-200" />
      <div className="max-w-5xl mx-auto px-4 py-6 lg:grid lg:grid-cols-[1fr_300px] lg:gap-6">
        <div className="space-y-4">
          <PostSkeleton /><PostSkeleton /><PostSkeleton />
        </div>
        <div className="hidden lg:block space-y-4 mt-0">
          <SidebarSkeleton />
        </div>
      </div>
    </div>
  );

  if (notFound || !community) return (
    <div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#0a192f] mb-2">Comunitate negăsită</h1>
        <p className="text-gray-500">Această comunitate nu există.</p>
      </div>
    </div>
  );

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f3ef] font-sans">
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .skeleton { background: linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .animate-fade-in-up { animation:fadeInUp 0.35s ease-out forwards; }
        @keyframes slideDown { from{opacity:0;max-height:0} to{opacity:1;max-height:2000px} }
        .animate-slide-down { animation:slideDown 0.3s ease-out forwards; overflow:hidden; }
      `}</style>

      {/* ── Sticky nav ─────────────────────────────────────────────────── */}
      {user && (
        <div className="bg-[#0a192f]/95 backdrop-blur-sm border-b border-white/10 px-4 py-2.5 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            {isCreator ? (
              <>
                <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Dashboard creator
                </Link>
                <Link href="/dashboard/community" className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
                  <LayoutDashboard className="w-3.5 h-3.5" /> Gestionează
                </Link>
              </>
            ) : (
              <Link href="/student" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
                <GraduationCap className="w-4 h-4" /> Dashboard cursant
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div
        className="bg-[#0a192f] text-white px-4 pt-10 pb-8 relative overflow-hidden"
        style={community.cover_image_url ? {
          backgroundImage: `linear-gradient(to bottom,rgba(10,25,47,0.82) 0%,rgba(10,25,47,0.97) 100%),url(${community.cover_image_url})`,
          backgroundSize: "cover", backgroundPosition: "center",
        } : {}}>
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-3 bg-amber-400/10 px-3 py-1 rounded-full">
            Comunitate
          </span>
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{community.name}</h1>
              {community.description && <p className="text-white/60 mt-2 text-sm leading-relaxed max-w-xl">{community.description}</p>}
            </div>
            {isCreator && (
              <Link href="/dashboard/community" className="shrink-0 text-xs border border-white/20 bg-white/5 hover:bg-white/15 px-3 py-1.5 rounded-lg transition-colors">
                Editează
              </Link>
            )}
          </div>
          <div className="flex items-center gap-5 text-sm flex-wrap">
            <div className="flex items-center gap-2.5">
              <Avatar src={community.creator_avatar} name={community.creator_name} size="md" />
              <div>
                <p className="text-white/45 text-[11px] leading-none mb-0.5">Creator</p>
                <p className="text-white font-semibold text-sm leading-none">{community.creator_name}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-white/15" />
            <div className="flex items-center gap-1.5 text-white/60">
              <Users className="w-4 h-4" />
              <span className="font-bold text-white">{community.member_count}</span>
              <span>membri</span>
            </div>
          </div>
          {!canSeeContent && (
            <Button onClick={handleJoin} disabled={joining}
              className="mt-6 bg-amber-500 hover:bg-amber-400 text-[#0a192f] font-bold shadow-lg shadow-amber-500/25">
              {joining ? "Se procesează…" : "Alătură-te comunității →"}
            </Button>
          )}
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-[49px] z-20 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center overflow-x-auto scrollbar-none">
          {([
            { key: "feed", label: "Feed", icon: <MessageSquare className="w-3.5 h-3.5" /> },
            { key: "events", label: "Evenimente", icon: <Calendar className="w-3.5 h-3.5" /> },
            { key: "leaderboard", label: "Top", icon: <Trophy className="w-3.5 h-3.5" /> },
            { key: "members", label: "Membri", icon: <Users className="w-3.5 h-3.5" /> },
            { key: "cursuri", label: "Cursuri", icon: <BookOpen className="w-3.5 h-3.5" />, badge: courses.length > 0 ? courses.length : undefined },
          ] as { key: Tab; label: string; icon: React.ReactNode; badge?: number }[]).map(({ key, label, icon, badge }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 shrink-0 px-4 py-3.5 text-sm font-semibold transition-colors border-b-2 ${
                tab === key ? "border-amber-500 text-[#0a192f]" : "border-transparent text-gray-500 hover:text-[#0a192f]"
              }`}>
              {icon}
              <span className="hidden sm:inline">{label}</span>
              {badge !== undefined && (
                <span className="ml-1 bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded-full">{badge}</span>
              )}
            </button>
          ))}

          {/* Notification toggle — always visible for members, graceful fallback on unsupported browsers */}
          {user && canSeeContent && (
            <button
              onClick={handleToggleNotifications}
              disabled={pushLoading}
              title={
                !pushSupported
                  ? "Notificările push nu sunt suportate în acest browser"
                  : isSubscribed
                    ? "Dezactivează notificările"
                    : "Activează notificările"
              }
              className={`ml-auto mr-2 shrink-0 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                isSubscribed
                  ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                  : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-[#0a192f]"
              } disabled:opacity-50`}>
              {pushLoading
                ? <span className="animate-spin w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" />
                : isSubscribed
                  ? <><BellOff className="w-3.5 h-3.5" /><span className="hidden md:inline ml-1">Notificări active</span></>
                  : <><Bell className="w-3.5 h-3.5" /><span className="hidden md:inline ml-1">Notifică-mă</span></>
              }
            </button>
          )}
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* ── FEED TAB ──────────────────────────────────────────────── */}
        {tab === "feed" && (
          <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-6 lg:items-start">

            {/* Left: feed */}
            <div className="space-y-4">
              {!canSeeContent ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-7 h-7 text-amber-500" />
                  </div>
                  <p className="font-bold text-[#0a192f] text-lg mb-1">Comunitate privată</p>
                  <p className="text-gray-500 text-sm">Alătură-te pentru a vedea postările.</p>
                </div>
              ) : (
                <>
                  {/* Compose box */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <textarea
                      ref={textareaRef}
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handlePost(); }}
                      placeholder="Scrie ceva în comunitate…"
                      className="w-full px-4 pt-4 pb-2 text-sm text-[#0a192f] bg-transparent border-none outline-none resize-none placeholder-gray-400"
                      rows={3}
                    />
                    {/* Image preview */}
                    {pendingImage && (
                      <div className="relative mx-4 mb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={pendingImage} alt="Preview" className="rounded-xl max-h-48 object-cover w-full" />
                        <button onClick={() => setPendingImage(null)}
                          className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors">
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
                      <div className="flex items-center gap-2">
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                        <button onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}
                          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-600 transition-colors disabled:opacity-50">
                          <ImageIcon className="w-4 h-4" />
                          {uploadingImage ? "Se urcă…" : "Imagine"}
                        </button>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">Ctrl+Enter pentru a trimite</span>
                      </div>
                      <button onClick={handlePost} disabled={posting || (!newPost.trim() && !pendingImage)}
                        className="flex items-center gap-2 bg-[#0a192f] hover:bg-[#0d2444] text-white text-sm font-semibold px-4 py-1.5 rounded-lg disabled:opacity-40 transition-colors">
                        <Send className="w-3.5 h-3.5" />
                        {posting ? "Se trimite…" : "Trimite"}
                      </button>
                    </div>
                  </div>

                  {posts.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <MessageSquare className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">Nicio postare încă. Fii primul!</p>
                    </div>
                  )}

                  {posts.map((post) => {
                    const isExpanded = expandedComments.has(post.id);
                    const postComments = comments[post.id] || [];
                    const isLoadingComments = commentsLoading.has(post.id);
                    const isSubmitting = submittingComment.has(post.id);
                    const isFresh = freshIds.has(post.id);

                    return (
                      <div key={post.id}
                        className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${
                          post.is_pinned ? "border-amber-300 ring-1 ring-amber-100" : "border-gray-200"
                        } ${isFresh ? "animate-fade-in-up" : ""}`}>

                        {post.is_pinned && (
                          <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold bg-amber-50 px-4 py-2 border-b border-amber-100">
                            <Pin className="w-3 h-3" /> Postare fixată
                          </div>
                        )}

                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar src={post.author_avatar} name={post.author_name} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-sm font-bold text-[#0a192f]">{post.author_name}</span>
                                {post.author_id === community.creator_id && (
                                  <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-1.5 py-0.5 rounded-md">Creator</span>
                                )}
                                <span className="text-xs text-gray-400 ml-auto">{formatDate(post.created_at)}</span>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{renderContent(post.content)}</p>
                              {post.image_url && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={post.image_url} alt="" className="mt-3 rounded-xl max-h-72 object-cover w-full" />
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100 flex-wrap">
                            {Object.entries(post.reactions).filter(([, c]) => c > 0).map(([emoji, count]) => (
                              <button key={emoji} onClick={() => handleReact(post.id, emoji)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm border transition-all ${
                                  post.my_reactions.includes(emoji)
                                    ? "bg-amber-50 border-amber-300 shadow-sm scale-105"
                                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                }`}>
                                {emoji} <span className="text-xs font-medium text-gray-600">{count}</span>
                              </button>
                            ))}
                            <div className="relative">
                              <button onClick={() => setShowEmojiPicker(showEmojiPicker === post.id ? null : post.id)}
                                className="flex items-center gap-1 px-2 py-1 rounded-full text-sm border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
                                <SmilePlus className="w-3.5 h-3.5 text-gray-500" />
                              </button>
                              {showEmojiPicker === post.id && (
                                <div className="absolute left-0 bottom-9 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 flex gap-1 z-20">
                                  {EMOJIS.map((e) => (
                                    <button key={e} onClick={() => handleReact(post.id, e)}
                                      className="text-lg hover:scale-125 transition-transform p-1">{e}</button>
                                  ))}
                                </div>
                              )}
                            </div>

                            <button onClick={() => toggleComments(post.id)}
                              className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors ml-auto">
                              <MessageSquare className="w-3.5 h-3.5" />
                              {post.comments_count > 0 ? `${post.comments_count}` : "Comentează"}
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>

                            {isCreator && (
                              <button onClick={() => handlePin(post.id, post.is_pinned)}
                                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors">
                                <Pin className="w-3 h-3" /> {post.is_pinned ? "Dezfixează" : "Fixează"}
                              </button>
                            )}
                            {(isCreator || post.author_id === user?.id) && (
                              <button onClick={() => handleDelete(post.id)}
                                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-red-200 bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Comments */}
                        {isExpanded && (
                          <div className="animate-slide-down border-t border-gray-100 bg-gray-50/60 px-4 py-3 space-y-3">
                            {isLoadingComments && (
                              <div className="flex justify-center py-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-amber-500/30 border-t-amber-500" />
                              </div>
                            )}
                            {!isLoadingComments && postComments.length === 0 && (
                              <p className="text-xs text-gray-400 text-center py-1">Fii primul care comentează.</p>
                            )}
                            {postComments.map((c) => (
                              <div key={c.id} className="flex items-start gap-2 group animate-fade-in-up">
                                <Avatar src={c.author_avatar} name={c.author_name} size="sm" />
                                <div className="flex-1 min-w-0">
                                  <div className="bg-white rounded-xl px-3 py-2 border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-xs font-bold text-[#0a192f]">{c.author_name}</span>
                                      {c.author_id === community.creator_id && (
                                        <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold px-1 py-0.5 rounded">Creator</span>
                                      )}
                                      <span className="text-[10px] text-gray-400 ml-auto">{formatDate(c.created_at)}</span>
                                    </div>
                                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{renderContent(c.content)}</p>
                                  </div>
                                </div>
                                {(isCreator || c.author_id === user?.id) && (
                                  <button onClick={() => deleteComment(c)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 mt-1 shrink-0">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                            {user && (
                              <div className="flex items-end gap-2 pt-1">
                                <Avatar src={null} name={user.email?.[0] || "?"} size="sm" />
                                <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex items-end overflow-hidden">
                                  <textarea
                                    value={commentInput[post.id] || ""}
                                    onChange={(e) => setCommentInput((prev) => ({ ...prev, [post.id]: e.target.value }))}
                                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(post.id); } }}
                                    placeholder="Scrie un comentariu… (Enter pentru a trimite)"
                                    className="flex-1 px-3 py-2 text-xs text-[#0a192f] bg-transparent border-none outline-none resize-none placeholder-gray-400"
                                    rows={1}
                                  />
                                  <button onClick={() => submitComment(post.id)}
                                    disabled={isSubmitting || !(commentInput[post.id] || "").trim()}
                                    className="p-2 text-amber-500 hover:text-amber-600 disabled:opacity-30 transition-colors">
                                    <Send className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Right: sidebar (desktop only — members/courses visible via tabs on mobile) */}
            <aside className="hidden lg:block">
              <div className="sticky top-[106px] space-y-4">

                {/* Stats card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Comunitate</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar src={community.creator_avatar} name={community.creator_name} size="md" />
                    <div>
                      <p className="text-xs text-gray-400 leading-none mb-0.5">Creator</p>
                      <p className="text-sm font-bold text-[#0a192f]">{community.creator_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-amber-500" />
                    <span><strong className="text-[#0a192f]">{community.member_count}</strong> membri</span>
                  </div>
                  {!canSeeContent && (
                    <Button onClick={handleJoin} disabled={joining} size="sm"
                      className="w-full mt-3 bg-amber-500 hover:bg-amber-400 text-[#0a192f] font-bold">
                      {joining ? "Se procesează…" : "Alătură-te →"}
                    </Button>
                  )}
                </div>

                {/* Members card */}
                {members.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Membri</h3>
                    <div className="space-y-2.5">
                      {members.map((m) => (
                        <div key={m.user_id} className="flex items-center gap-2.5">
                          <Avatar src={m.avatar} name={m.name} size="sm" />
                          <span className="text-sm text-[#0a192f] font-medium truncate">{m.name}</span>
                        </div>
                      ))}
                    </div>
                    {community.member_count > members.length && (
                      <p className="text-xs text-gray-400 mt-3">+{community.member_count - members.length} alți membri</p>
                    )}
                  </div>
                )}

                {/* Courses card */}
                {courses.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Cursuri</h3>
                    <div className="space-y-2">
                      {courses.map((c) => (
                        <button key={c.course_id} onClick={() => handleCourseAccess(c)}
                          className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-colors text-left group">
                          {c.image_url
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={c.image_url} alt={c.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                            : <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0a192f] to-[#1a3a6f] flex items-center justify-center shrink-0"><BookOpen className="w-5 h-5 text-white/50" /></div>
                          }
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#0a192f] truncate group-hover:text-amber-600 transition-colors">{c.title}</p>
                            <span className={`text-[10px] font-bold ${c.access_type === "free" ? "text-emerald-600" : "text-amber-600"}`}>
                              {c.access_type === "free" ? "✓ Gratuit" : "Cu plată"}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </aside>
          </div>
        )}

        {/* ── LEADERBOARD TAB ──────────────────────────────────────── */}
        {tab === "leaderboard" && community && (
          <CommunityLeaderboard
            membershipPlanId={community.id}
            currentUserId={user?.id}
          />
        )}

        {/* ── EVENTS TAB ───────────────────────────────────────────── */}
        {tab === "events" && community && (
          <CommunityEventsTab
            membershipPlanId={community.id}
            isCreator={!!isCreator}
            currentUserId={user?.id}
          />
        )}

        {/* ── MEMBERS TAB (mobile + all screens) ───────────────────── */}
        {tab === "members" && (
          <div className="space-y-4">
            {/* Community info */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar src={community.creator_avatar} name={community.creator_name} size="md" />
                <div>
                  <p className="text-xs text-gray-400 leading-none mb-0.5">Creator</p>
                  <p className="text-sm font-bold text-[#0a192f]">{community.creator_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4 text-amber-500" />
                <span><strong className="text-[#0a192f]">{community.member_count}</strong> membri</span>
              </div>
            </div>

            {/* Member list */}
            {members.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Membri</h3>
                <div className="space-y-3">
                  {members.map((m) => (
                    <div key={m.user_id} className="flex items-center gap-3">
                      <Avatar src={m.avatar} name={m.name} size="sm" />
                      <span className="flex-1 text-sm text-[#0a192f] font-medium truncate">{m.name}</span>
                      {user && m.user_id !== user.id && (
                        <button
                          onClick={() => setDmTarget({ user_id: m.user_id, full_name: m.name })}
                          title="Trimite mesaj"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {community.member_count > members.length && (
                  <p className="text-xs text-gray-400 mt-3">+{community.member_count - members.length} alți membri</p>
                )}
              </div>
            )}

            {/* Courses */}
            {courses.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Cursuri</h3>
                <div className="space-y-2">
                  {courses.map((c) => (
                    <button key={c.course_id} onClick={() => handleCourseAccess(c)}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-colors text-left group">
                      {c.image_url
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={c.image_url} alt={c.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        : <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0a192f] to-[#1a3a6f] flex items-center justify-center shrink-0"><BookOpen className="w-5 h-5 text-white/50" /></div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#0a192f] truncate group-hover:text-amber-600 transition-colors">{c.title}</p>
                        <span className={`text-[10px] font-bold ${c.access_type === "free" ? "text-emerald-600" : "text-amber-600"}`}>
                          {c.access_type === "free" ? "✓ Gratuit" : "Cu plată"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CURSURI TAB ───────────────────────────────────────────── */}
        {tab === "cursuri" && (
          <div>
            {courses.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">Niciun curs adăugat în comunitate.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <div key={course.course_id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group animate-fade-in-up">
                    {course.image_url ? (
                      <div className="relative overflow-hidden h-36">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={course.image_url} alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <span className={`absolute bottom-2 right-2 text-xs font-bold px-2.5 py-1 rounded-full ${
                          course.access_type === "free" ? "bg-emerald-500 text-white" : "bg-amber-500 text-[#0a192f]"
                        }`}>
                          {course.access_type === "free" ? "✓ Gratuit" : "Cu plată"}
                        </span>
                      </div>
                    ) : (
                      <div className="h-24 bg-gradient-to-br from-[#0a192f] to-[#1a3a6f] flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-white/20" />
                      </div>
                    )}
                    <div className="p-4">
                      {!course.image_url && (
                        <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2 ${
                          course.access_type === "free" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {course.access_type === "free" ? "✓ Gratuit" : "Cu plată"}
                        </span>
                      )}
                      <h3 className="font-bold text-[#0a192f] text-sm mb-3 leading-snug">{course.title}</h3>
                      {canSeeContent ? (
                        <button onClick={() => handleCourseAccess(course)}
                          className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors ${
                            course.access_type === "free"
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                              : "bg-[#0a192f] hover:bg-[#0d2444] text-white"
                          }`}>
                          {course.access_type === "free" ? "Accesează gratuit →" : "Vezi detalii →"}
                        </button>
                      ) : (
                        <button onClick={handleJoin}
                          className="w-full py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-[#0a192f] transition-colors">
                          Alătură-te pentru acces
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="text-center py-5 text-xs text-gray-400 border-t border-gray-200 mt-8">
        Comunitate pe <a href="https://www.docourse.ro" className="hover:underline text-[#0a192f]">DoCourse</a>
      </footer>

      {/* DM Dialog */}
      {dmTarget && user && community && (
        <DirectMessageDialog
          open={!!dmTarget}
          onClose={() => setDmTarget(null)}
          membershipPlanId={community.id}
          currentUserId={user.id}
          recipient={dmTarget}
        />
      )}
    </div>
  );
}
