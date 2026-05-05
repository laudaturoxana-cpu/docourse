"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  MessageSquare,
  ArrowLeft,
  Search,
  Lock,
  UserPlus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useCommunity, CommunityPost, CommunityComment } from "@/hooks/useCommunity";
import { supabase } from "@/lib/supabase/browser";

import CreatePostForm from "@/components/community/CreatePostForm";
import PostCard from "@/components/community/PostCard";
import CommunityMembers from "@/components/community/CommunityMembers";
import CommentsDialog from "@/components/community/CommentsDialog";

const Community = () => {
  const _params = useParams<{ membershipId: string }>();
  const membershipId = _params?.membershipId;
  const router = useRouter();
  const { user, profile, signOut, isLoading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [membershipPlan, setMembershipPlan] = useState<{
    title: string;
    creator_id: string;
    includes_courses?: string[] | null;
  } | null>(null);
  const [communityGroup, setCommunityGroup] = useState<{ name: string } | null>(null);
  const [linkedCourse, setLinkedCourse] = useState<{
    id: string;
    title: string;
    slug: string;
    access_token: string;
  } | null>(null);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [planError, setPlanError] = useState(false);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);

  const {
    posts,
    isLoadingPosts,
    fetchComments,
    createPost,
    togglePostLike,
    createComment,
    toggleCommentLike,
    togglePin,
    deletePost,
    deleteComment,
    uploadImage,
  } = useCommunity(membershipId);

  useEffect(() => {
    const fetchMembershipPlan = async () => {
      if (!membershipId) {
        setIsLoadingPlan(false);
        setPlanError(true);
        return;
      }

      setIsLoadingPlan(true);
      setPlanError(false);

      // Use RPC function to bypass RLS for community group
      const { data: groupData } = await supabase
        .rpc("get_community_group", { _plan_id: membershipId });

      if (groupData && groupData.length > 0) {
        setCommunityGroup({ name: groupData[0].name });
      }

      // Use RPC function to bypass RLS for membership plan
      const { data, error } = await supabase
        .rpc("get_community_plan", { _plan_id: membershipId });

      if (error || !data || data.length === 0) {
        console.error("Error fetching membership plan:", error);
        setPlanError(true);
        setIsLoadingPlan(false);
        return;
      }

      const planData = data[0];
      setMembershipPlan({
        title: planData.title,
        creator_id: planData.creator_id,
        includes_courses: planData.includes_courses as string[] | null | undefined
      });

      const userIsCreator = !!profile?.id && planData.creator_id === profile?.id;
      setIsCreator(userIsCreator);

      // Auto-create membership subscription for students accessing the community
      // This ensures they can find this community in "My Communities" later
      if (user && !userIsCreator) {
        await (supabase.rpc as any)("ensure_community_membership", { _plan_id: membershipId });
      }

      const courseId = (planData.includes_courses as string[] | null)?.[0];
      if (courseId) {
        const { data: courseData } = await supabase
          .from("courses")
          .select("id, title, slug, access_token")
          .eq("id", courseId)
          .maybeSingle();

        if (courseData) {
          setLinkedCourse({ ...courseData, access_token: courseData.access_token ?? "" });
        }
      }

      // Show welcome banner for new members (first visit)
      if (user && membershipId) {
        const key = `docourse_community_visited_${membershipId}`;
        if (!localStorage.getItem(key)) {
          setShowWelcomeBanner(true);
          localStorage.setItem(key, "1");
        }
      }

      setIsLoadingPlan(false);
    };

    fetchMembershipPlan();
  }, [membershipId, profile?.id, user?.id]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleCreatePost = (content: string, imageUrl: string | null, tags: string[]) => {
    createPost({
      content,
      image_url: imageUrl,
      tags: tags.length > 0 ? tags : undefined,
    });
  };

  const openPostComments = async (post: CommunityPost) => {
    setSelectedPost(post);
    const fetchedComments = await fetchComments(post.id);
    setComments(fetchedComments);
  };

  const handleCreateComment = (content: string, parentId: string | null) => {
    if (!selectedPost) return;
    createComment({
      post_id: selectedPost.id,
      content,
      parent_comment_id: parentId,
    });
    
    // Refresh comments
    setTimeout(async () => {
      const fetchedComments = await fetchComments(selectedPost.id);
      setComments(fetchedComments);
    }, 500);
  };

  // Different menu for creators vs students

  if (authLoading || isLoadingPlan) {
    return (
      <div className="min-h-screen bg-beige/30 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (planError || !membershipPlan) {
    return (
      <div className="min-h-screen bg-beige/30 flex items-center justify-center p-4">
        <div className="bg-background rounded-2xl border border-border p-8 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-gold" />
          </div>
          <h1 className="text-2xl font-bold text-navy mb-3">Comunitate indisponibilă</h1>
          <p className="text-muted-foreground mb-6">
            Această comunitate nu a fost găsită sau nu ai acces la ea.
          </p>
          <Link href="/">
            <Button variant="outline">
              Înapoi la pagina principală
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      


      

      <div className="min-h-screen bg-beige/30 flex">
        {user && <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-background border-b border-border px-4 lg:px-8 py-4 shrink-0">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <button
                    className="lg:hidden p-2"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                  <Link href="/my-communities">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Înapoi
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Înapoi
                  </Button>
                </Link>
              )}
            </div>
              
              {isCreator && (
                <Link href={`/dashboard/community/${membershipId}`}>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
            </div>
          </header>

          {/* Community Header */}
          <div className="bg-gradient-to-r from-navy to-navy/90 px-4 lg:px-8 py-5 lg:py-8 text-white shrink-0">
            <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-gold/20 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 lg:w-8 lg:h-8 text-gold" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg lg:text-3xl font-bold truncate">{communityGroup?.name || membershipPlan.title}</h1>
                <p className="text-white/70 text-sm lg:text-base">
                  Comunitate • {posts?.length || 0} postări
                </p>
              </div>
              {linkedCourse && (
                <a
                  href={`/course/${linkedCourse.slug}/${linkedCourse.access_token}`}
                  className="hidden md:inline-flex"
                >
                  <Button variant="outline" size="sm" className="border-white/40 text-white hover:bg-white/10">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Curs
                  </Button>
                </a>
              )}
            </div>
            {linkedCourse && (
              <div className="mt-3 md:hidden">
                <a href={`/course/${linkedCourse.slug}/${linkedCourse.access_token}`}>
                  <Button variant="outline" size="sm" className="border-white/40 text-white hover:bg-white/10 w-full">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Curs
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>

          {/* Tabs */}
          <div className="flex-1 px-3 lg:px-8 py-4 lg:py-6 overflow-auto pb-mobile-nav">
            <div className="max-w-3xl mx-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 lg:mb-6 bg-background border border-border w-full sm:w-auto">
                  <TabsTrigger value="feed" className="flex items-center gap-1.5 lg:gap-2 flex-1 sm:flex-none text-sm">
                    <MessageSquare className="w-4 h-4" />
                    Feed
                  </TabsTrigger>
                  <TabsTrigger value="course" className="flex items-center gap-1.5 lg:gap-2 flex-1 sm:flex-none text-sm">
                    <BookOpen className="w-4 h-4" />
                    Curs
                  </TabsTrigger>
                  <TabsTrigger value="members" className="flex items-center gap-1.5 lg:gap-2 flex-1 sm:flex-none text-sm">
                    <Users className="w-4 h-4" />
                    Membri
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="feed" className="space-y-4 lg:space-y-6">
                  {/* Welcome banner for new members */}
                  {showWelcomeBanner && !isCreator && (
                    <div className="flex items-start gap-3 bg-gradient-to-r from-gold/10 to-sky/10 border border-gold/30 rounded-xl px-4 py-4">
                      <div className="w-9 h-9 rounded-lg bg-gold/20 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy text-sm">Bun venit în comunitate! 👋</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Prezintă-te celorlalți membri, pune întrebări sau împărtășește ce ai învățat.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowWelcomeBanner(false)}
                        className="text-muted-foreground hover:text-navy transition-colors shrink-0 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Create Post */}
                  {user ? (
                    <CreatePostForm
                      userName={profile?.full_name || "User"}
                      onCreatePost={handleCreatePost}
                      onUploadImage={uploadImage}
                    />
                  ) : (
                    <div className="bg-gradient-to-r from-gold/10 to-sky/10 rounded-xl border border-gold/30 p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
                          <Lock className="w-6 h-6 text-gold" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-navy mb-1">
                            Vrei să participi la discuții?
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Creează un cont gratuit pentru a posta și comenta în comunitate.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Link href={`/student-register?redirect=${encodeURIComponent(`/community/${membershipId}`)}`}>
                              <Button variant="hero" size="sm" className="w-full sm:w-auto">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Creează cont gratuit
                              </Button>
                            </Link>
                            <Link href={`/student-login?redirect=${encodeURIComponent(`/community/${membershipId}`)}`}>
                              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                Am deja cont
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Caută în postări..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-background"
                    />
                  </div>

                  {/* Posts Feed */}
                  {isLoadingPosts ? (
                    <div className="flex justify-center py-8 lg:py-12">
                      <div className="animate-spin w-6 h-6 lg:w-8 lg:h-8 border-4 border-gold border-t-transparent rounded-full" />
                    </div>
                  ) : (() => {
                    const filteredPosts = posts?.filter((post) => {
                      if (!searchQuery.trim()) return true;
                      const query = searchQuery.toLowerCase();
                      return (
                        post.content.toLowerCase().includes(query) ||
                        post.profiles?.full_name?.toLowerCase().includes(query) ||
                        post.tags?.some((tag) => tag.toLowerCase().includes(query))
                      );
                    });
                    
                    return filteredPosts && filteredPosts.length > 0 ? (
                      <div className="space-y-3 lg:space-y-4">
                        {filteredPosts.map((post) => (
                          <PostCard
                            key={post.id}
                            post={post}
                            isCreator={isCreator}
                            currentUserId={user?.id}
                            onLike={(postId, isLiked) => togglePostLike({ postId, isLiked })}
                            onComment={openPostComments}
                            onPin={isCreator ? (postId, isPinned) => togglePin({ postId, isPinned }) : undefined}
                            onDelete={(isCreator || post.author_id === user?.id) ? deletePost : undefined}
                          />
                        ))}
                      </div>
                    ) : searchQuery.trim() ? (
                      <div className="text-center py-8 lg:py-12">
                        <Search className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-3 lg:mb-4 text-muted-foreground" />
                        <h3 className="font-semibold text-navy mb-1 lg:mb-2 text-sm lg:text-base">Nicio postare găsită</h3>
                        <p className="text-muted-foreground text-xs lg:text-sm">
                          Încearcă alte cuvinte cheie.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8 lg:py-12">
                        <MessageSquare className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-3 lg:mb-4 text-muted-foreground" />
                        <h3 className="font-semibold text-navy mb-1 lg:mb-2 text-sm lg:text-base">Fii primul care postează!</h3>
                        <p className="text-muted-foreground text-xs lg:text-sm">
                          Începe o conversație cu comunitatea.
                        </p>
                      </div>
                    );
                  })()}
                </TabsContent>

                <TabsContent value="course">
                  {linkedCourse ? (
                    <div className="bg-background rounded-xl border border-border p-6">
                      <h3 className="text-lg font-semibold text-navy mb-2">{linkedCourse.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Accesează cursul direct din comunitate și continuă lecțiile.
                      </p>
                      <a
                        href={`/course/${linkedCourse.slug}/${linkedCourse.access_token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="hero" size="sm">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Deschide cursul
                        </Button>
                      </a>
                    </div>
                  ) : (
                    <div className="bg-background rounded-xl border border-border p-6 text-center">
                      <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Nu există un curs asociat acestei comunități.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="members">
                  <CommunityMembers
                    membershipPlanId={membershipId!}
                    creatorId={membershipPlan.creator_id || ""}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Dialog */}
      <CommentsDialog
        post={selectedPost}
        comments={comments}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        isCreator={isCreator}
        currentUserId={user?.id}
        onCreateComment={handleCreateComment}
        onLikeComment={(commentId, isLiked) => toggleCommentLike({ commentId, isLiked })}
        onDeleteComment={deleteComment}
      />

      {user && <MobileBottomNav />}
    </>
  );
};

export default Community;
