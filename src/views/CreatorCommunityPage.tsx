"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, MessageSquare, BookOpen, Pin, Send, SmilePlus, Lock, Trash2, ArrowLeft, LayoutDashboard, GraduationCap } from "lucide-react";
import { supabase } from "@/lib/supabase/browser";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const EMOJIS = ["👍", "❤️", "🔥", "🎉", "😂", "👏", "💪", "✅"];

interface Community {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  slug: string;
  creator_id: string;
  creator_name: string;
  creator_avatar: string | null;
  is_member: boolean;
  member_count: number;
}

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  is_pinned: boolean;
  created_at: string;
  author_id: string;
  author_name: string;
  author_avatar: string | null;
  reactions: Record<string, number>;
  my_reactions: string[];
  comments_count: number;
}

interface CourseSetting {
  course_id: string;
  access_type: "free" | "paid";
  title: string;
  slug: string;
  image_url: string | null;
}

type Tab = "feed" | "cursuri";

export default function CreatorCommunityPage() {
  const _params = useParams<{ slug: string }>();
  const slug = _params?.slug;
  const router = useRouter();
  const { user } = useAuth();

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [courses, setCourses] = useState<CourseSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState<Tab>("feed");
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!slug) return;
    loadCommunity();
  }, [slug, user]);

  // Real-time via Broadcast — avoids RLS filtering that blocks postgres_changes
  useEffect(() => {
    if (!community?.id) return;
    const canSee = community.is_member || (user && user.id === community.creator_id);
    if (!canSee) return;

    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
    }

    const channel = supabase
      .channel(`comm-broadcast-${community.id}`)
      .on("broadcast", { event: "new_post" }, ({ payload }) => {
        const p = payload as Post;
        setPosts((prev) => prev.find((x) => x.id === p.id) ? prev : [p, ...prev]);
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
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => { supabase.removeChannel(channel); };
  }, [community?.id, community?.is_member, user?.id]);

  const loadCommunity = async () => {
    const { data: rows } = await supabase.rpc("get_creator_community", { _slug: slug! });
    if (!rows || rows.length === 0) { setNotFound(true); setLoading(false); return; }
    const comm = rows[0] as Community;
    setCommunity(comm);

    if (comm.is_member || (user && user.id === comm.creator_id)) {
      await loadPosts(comm.id);
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
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url")
      .in("user_id", authorIds);

    const profileMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
    (profiles || []).forEach((p) => { if (p.user_id) profileMap[p.user_id] = p; });

    const { data: reactionsData } = await supabase
      .from("creator_community_reactions")
      .select("post_id, emoji, user_id")
      .in("post_id", postsData.map((p) => p.id));

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

    setPosts(postsData.map((p) => ({
      ...p,
      is_pinned: p.is_pinned ?? false,
      created_at: p.created_at ?? new Date().toISOString(),
      author_name: (p.author_id ? profileMap[p.author_id]?.full_name : null) || "Utilizator",
      author_avatar: (p.author_id ? profileMap[p.author_id]?.avatar_url : null) || null,
      reactions: reactionsMap[p.id] || {},
      my_reactions: myReactionsMap[p.id] || [],
      comments_count: 0,
    })) as Post[]);
  };

  const loadCourses = async (communityId: string) => {
    const { data: settings } = await supabase
      .from("community_course_settings")
      .select("course_id, access_type")
      .eq("community_id", communityId);

    if (!settings || settings.length === 0) return;

    const courseIds = settings.map((s) => s.course_id);
    const { data: coursesData } = await supabase
      .from("courses")
      .select("id, title, slug, image_url")
      .in("id", courseIds);

    const courseMap: Record<string, any> = {};
    (coursesData || []).forEach((c) => { courseMap[c.id] = c; });

    setCourses(settings.map((s) => ({
      course_id: s.course_id,
      access_type: s.access_type as "free" | "paid",
      title: courseMap[s.course_id]?.title || "",
      slug: courseMap[s.course_id]?.slug || "",
      image_url: courseMap[s.course_id]?.image_url || null,
    })).filter((s) => s.title));
  };

  const handleJoin = async () => {
    if (!user) { router.push(`/student-register?redirect=${encodeURIComponent(`/community/${slug}`)}`); return; }
    if (!community) return;
    setJoining(true);
    const { error } = await supabase.from("community_memberships").insert({
      community_id: community.id,
      user_id: user.id,
    });
    if (error) {
      toast({ title: "Eroare", description: error.message, variant: "destructive" });
    } else {
      setCommunity((c) => c ? { ...c, is_member: true, member_count: c.member_count + 1 } : c);
      await loadPosts(community.id);
    }
    setJoining(false);
  };

  const handlePost = async () => {
    if (!newPost.trim() || !community || !user) return;
    setPosting(true);
    const { data, error } = await supabase.from("creator_community_posts").insert({
      community_id: community.id,
      author_id: user.id,
      content: newPost.trim(),
    }).select("id, content, image_url, is_pinned, created_at, author_id").single();

    if (error) {
      toast({ title: "Eroare", description: error.message, variant: "destructive" });
    } else if (data) {
      const { data: prof } = await supabase.from("profiles").select("full_name, avatar_url").eq("user_id", user.id).single();
      const fullPost: Post = {
        ...data,
        is_pinned: data.is_pinned ?? false,
        created_at: data.created_at ?? new Date().toISOString(),
        author_name: prof?.full_name || "Tu",
        author_avatar: prof?.avatar_url || null,
        reactions: {},
        my_reactions: [],
        comments_count: 0,
      };
      setPosts((prev) => [fullPost, ...prev]);
      // Broadcast to all other members in real-time
      realtimeChannelRef.current?.send({ type: "broadcast", event: "new_post", payload: fullPost });
      setNewPost("");
    }
    setPosting(false);
  };

  const handleReact = async (postId: string, emoji: string) => {
    if (!user) { router.push(`/student-login?redirect=${encodeURIComponent(`/community/${slug}`)}`); return; }
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    if (post.my_reactions.includes(emoji)) {
      await supabase.from("creator_community_reactions").delete()
        .eq("post_id", postId).eq("user_id", user.id).eq("emoji", emoji);
      setPosts((prev) => prev.map((p) => p.id !== postId ? p : {
        ...p,
        reactions: { ...p.reactions, [emoji]: Math.max(0, (p.reactions[emoji] || 1) - 1) },
        my_reactions: p.my_reactions.filter((e) => e !== emoji),
      }));
    } else {
      await supabase.from("creator_community_reactions").insert({ post_id: postId, user_id: user.id, emoji });
      setPosts((prev) => prev.map((p) => p.id !== postId ? p : {
        ...p,
        reactions: { ...p.reactions, [emoji]: (p.reactions[emoji] || 0) + 1 },
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
    if (course.access_type === "paid") {
      router.push(`/c/${course.slug}${backParam}`);
      return;
    }
    if (!user) { router.push(`/student-register?redirect=${encodeURIComponent(`/community/${slug}`)}`); return; }
    const res = await supabase.functions.invoke("submit-lead-capture", {
      body: { course_id: course.course_id, email: user.email, full_name: null },
    });
    if (res.data?.success) {
      toast({ title: "Acces acordat!", description: "Cursul a fost adăugat în contul tău." });
    }
    // Always use relative path (res.data.course_url is absolute and breaks router.push())
    router.push(`/course/${course.slug}${backParam}`);
  };

  const isCreator = user && community && user.id === community.creator_id;
  const canSeeContent = community?.is_member || isCreator;

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "acum";
    if (diff < 3600) return `acum ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `acum ${Math.floor(diff / 3600)}h`;
    return date.toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
  };

  const renderContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) =>
      urlRegex.test(part)
        ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-gold underline break-all">{part}</a>
        : <span key={i}>{part}</span>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4a017]" />
    </div>
  );

  if (notFound || !community) return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#0a192f] mb-2">Comunitate negăsită</h1>
        <p className="text-[#5a6a7a]">Această comunitate nu există.</p>
      </div>
    </div>
  );

  return (
    <>
      


      

      <div className="min-h-screen bg-[#fafaf8] font-sans">
        {/* Back nav */}
        {user && (
          <div className="bg-[#0a192f] border-b border-white/10 px-4 py-3">
            <div className="max-w-2xl mx-auto flex items-center gap-3">
              {isCreator ? (
                <>
                  <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Dashboard creator
                  </Link>
                  <Link href="/dashboard/community" className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Gestionează comunitatea
                  </Link>
                </>
              ) : (
                <Link href="/student" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
                  <GraduationCap className="w-4 h-4" />
                  Dashboard cursant
                </Link>
              )}
            </div>
          </div>
        )}
        {/* Header */}
        <div className="bg-[#0a192f] text-white px-4 pt-10 pb-6"
          style={community.cover_image_url ? {
            backgroundImage: `linear-gradient(rgba(10,25,47,0.88),rgba(10,25,47,0.94)),url(${community.cover_image_url})`,
            backgroundSize: "cover", backgroundPosition: "center",
          } : {}}>
          <div className="max-w-2xl mx-auto">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d4a017] mb-2">Comunitate</p>
                <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow">{community.name}</h1>
                {community.description && <p className="text-white/80 mt-2 text-sm">{community.description}</p>}
              </div>
              {isCreator && (
                <Link href="/dashboard/community" className="shrink-0 text-xs border border-white/30 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  Editează
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-white/70">
              {community.creator_avatar && (
                <img src={community.creator_avatar} alt={community.creator_name}
                  className="w-8 h-8 rounded-full border border-[#d4a017] object-cover" />
              )}
              <span>Creat de <strong className="text-white">{community.creator_name}</strong></span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {community.member_count} membri</span>
            </div>

            {!canSeeContent && (
              <Button onClick={handleJoin} disabled={joining}
                className="mt-5 bg-[#d4a017] hover:bg-[#c4911a] text-[#0a192f] font-bold">
                {joining ? "Se procesează..." : "Alătură-te comunității"}
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#e8e4dc] bg-white sticky top-0 z-10">
          <div className="max-w-2xl mx-auto flex">
            {(["feed", "cursuri"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-6 py-3 text-sm font-semibold capitalize transition-colors border-b-2 ${tab === t ? "border-[#d4a017] text-[#0a192f]" : "border-transparent text-[#5a6a7a] hover:text-[#0a192f]"}`}>
                {t === "feed" ? "Feed" : "Cursuri"}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6">

          {/* ─── FEED TAB ─── */}
          {tab === "feed" && (
            <div className="space-y-4">
              {!canSeeContent ? (
                <div className="text-center py-16 text-[#5a6a7a]">
                  <Lock className="w-10 h-10 mx-auto mb-3 text-[#d4a017]" />
                  <p className="font-semibold text-[#0a192f] mb-1">Comunitate privată</p>
                  <p className="text-sm">Alătură-te ca să vezi postările.</p>
                </div>
              ) : (
                <>
                  {/* New post input */}
                  <div className="bg-white rounded-2xl border border-[#e8e4dc] p-4">
                    <textarea
                      ref={textareaRef}
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handlePost(); }}
                      placeholder="Scrie ceva în comunitate... (Ctrl+Enter pentru a trimite)"
                      className="w-full text-sm text-[#0a192f] bg-transparent border-none outline-none resize-none placeholder-[#9ca3af]"
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <button onClick={handlePost} disabled={posting || !newPost.trim()}
                        className="flex items-center gap-2 bg-[#0a192f] hover:bg-[#0a192f]/90 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50 transition-colors">
                        <Send className="w-3.5 h-3.5" />
                        {posting ? "Se trimite..." : "Trimite"}
                      </button>
                    </div>
                  </div>

                  {/* Posts */}
                  {posts.length === 0 && (
                    <div className="text-center py-12 text-[#5a6a7a]">
                      <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>Nicio postare încă. Fii primul!</p>
                    </div>
                  )}

                  {posts.map((post) => (
                    <div key={post.id} className={`bg-white rounded-2xl border p-4 ${post.is_pinned ? "border-[#d4a017]/50 bg-[#d4a017]/5" : "border-[#e8e4dc]"}`}>
                      {post.is_pinned && (
                        <div className="flex items-center gap-1 text-xs text-[#d4a017] font-semibold mb-2">
                          <Pin className="w-3 h-3" /> Fixat
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        {post.author_avatar
                          ? <img src={post.author_avatar} alt={post.author_name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                          : <div className="w-9 h-9 rounded-full bg-[#0a192f]/10 flex items-center justify-center shrink-0 text-sm font-bold text-[#0a192f]">{post.author_name[0]}</div>
                        }
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-[#0a192f]">{post.author_name}</span>
                            {post.author_id === community.creator_id && (
                              <span className="text-xs bg-[#d4a017]/20 text-[#d4a017] font-semibold px-1.5 py-0.5 rounded">Creator</span>
                            )}
                            <span className="text-xs text-[#9ca3af] ml-auto">{formatDate(post.created_at)}</span>
                          </div>
                          <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">{renderContent(post.content)}</p>
                          {post.image_url && (
                            <img src={post.image_url} alt="" className="mt-3 rounded-xl max-h-64 object-cover w-full" />
                          )}

                          {/* Reactions */}
                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            {Object.entries(post.reactions).filter(([, count]) => count > 0).map(([emoji, count]) => (
                              <button key={emoji} onClick={() => handleReact(post.id, emoji)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm border transition-colors ${post.my_reactions.includes(emoji) ? "bg-[#d4a017]/20 border-[#d4a017]/40" : "bg-[#f3f1ec] border-[#e8e4dc] hover:bg-[#ede9e0]"}`}>
                                {emoji} <span className="text-xs font-medium text-[#5a6a7a]">{count}</span>
                              </button>
                            ))}
                            <div className="relative">
                              <button onClick={() => setShowEmojiPicker(showEmojiPicker === post.id ? null : post.id)}
                                className="flex items-center gap-1 px-2 py-1 rounded-full text-sm border border-[#e8e4dc] bg-[#f3f1ec] hover:bg-[#ede9e0] transition-colors">
                                <SmilePlus className="w-3.5 h-3.5 text-[#5a6a7a]" />
                              </button>
                              {showEmojiPicker === post.id && (
                                <div className="absolute left-0 bottom-8 bg-white border border-[#e8e4dc] rounded-xl shadow-lg p-2 flex gap-1 z-20">
                                  {EMOJIS.map((e) => (
                                    <button key={e} onClick={() => handleReact(post.id, e)}
                                      className="text-lg hover:scale-125 transition-transform p-1">{e}</button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Creator actions */}
                            {isCreator && (
                              <>
                                <button onClick={() => handlePin(post.id, post.is_pinned)}
                                  className="flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-[#e8e4dc] bg-[#f3f1ec] hover:bg-[#ede9e0] text-[#5a6a7a] transition-colors">
                                  <Pin className="w-3 h-3" /> {post.is_pinned ? "Dezfixează" : "Fixează"}
                                </button>
                                <button onClick={() => handleDelete(post.id)}
                                  className="flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-red-200 bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </>
                            )}
                            {!isCreator && post.author_id === user?.id && (
                              <button onClick={() => handleDelete(post.id)}
                                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-red-200 bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* ─── CURSURI TAB ─── */}
          {tab === "cursuri" && (
            <div>
              {courses.length === 0 ? (
                <div className="text-center py-16 text-[#5a6a7a]">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Niciun curs adăugat în comunitate.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {courses.map((course) => (
                    <div key={course.course_id} className="bg-white rounded-2xl border border-[#e8e4dc] overflow-hidden hover:shadow-md transition-shadow">
                      {course.image_url && (
                        <div className="relative">
                          <img src={course.image_url} alt={course.title} className="w-full h-36 object-cover" />
                          {/* Badge */}
                          <div className={`absolute bottom-2 right-2 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                            course.access_type === "free"
                              ? "bg-emerald-500 text-white"
                              : "bg-[#d4a017] text-[#0a192f]"
                          }`}>
                            {course.access_type === "free" ? "✓ Gratuit" : "Cu plată"}
                          </div>
                        </div>
                      )}
                      <div className="p-4">
                        {!course.image_url && (
                          <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full mb-2 ${
                            course.access_type === "free" ? "bg-emerald-100 text-emerald-700" : "bg-[#d4a017]/20 text-[#d4a017]"
                          }`}>
                            {course.access_type === "free" ? "✓ Gratuit" : "Cu plată"}
                          </div>
                        )}
                        <h3 className="font-semibold text-[#0a192f] text-sm mb-3">{course.title}</h3>
                        {canSeeContent ? (
                          <button onClick={() => handleCourseAccess(course)}
                            className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                              course.access_type === "free"
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                : "bg-[#0a192f] hover:bg-[#0a192f]/90 text-white"
                            }`}>
                            {course.access_type === "free" ? "Accesează gratuit" : "Vezi detalii & cumpără"}
                          </button>
                        ) : (
                          <button onClick={handleJoin}
                            className="w-full py-2 rounded-lg text-sm font-semibold bg-[#d4a017] hover:bg-[#c4911a] text-[#0a192f] transition-colors">
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

        <footer className="text-center py-5 text-xs text-[#5a6a7a] border-t border-[#e8e4dc] bg-[#fafaf8] mt-8">
          Comunitate pe <a href="https://www.docourse.ro" className="hover:underline text-[#0a192f]">DoCourse</a>
        </footer>
      </div>
    </>
  );
}
