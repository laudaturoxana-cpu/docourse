"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  MessageSquare,
  LayoutDashboard,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  ArrowRight,
  MoreHorizontal,
  Trash2
} from "lucide-react";
import Logo from "@/components/Logo";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "sonner";

interface Community {
  id: string;
  name: string;
  description: string | null;
  membership_plan_id: string;
  membership_title: string;
  member_count: number;
  post_count: number;
  is_creator: boolean;
}

const MyCommunities = () => {
  const router = useRouter();
  const { user, profile, signOut, isLoading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if user is a creator (has active subscription)
  const isCreator = profile?.subscription_active || profile?.beta_tester || profile?.lifetime_access;
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [communityToDelete, setCommunityToDelete] = useState<Community | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchCommunities = async () => {
      if (!user?.id) return;

      try {
        // Use RPC to get all communities for this user (bypasses RLS)
        const { data: communityData, error } = await (supabase
          .rpc as any)("get_my_communities");

        if (error) {
          console.error("Error fetching communities:", error);
          toast.error("Eroare la încărcarea comunităților");
          setLoading(false);
          return;
        }

        if (communityData) {
          const formattedCommunities = communityData.map((c: {
            id: string;
            name: string;
            description: string | null;
            membership_plan_id: string;
            membership_title: string;
            member_count: number;
            post_count: number;
            is_creator: boolean;
          }) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            membership_plan_id: c.membership_plan_id,
            membership_title: c.membership_title,
            member_count: Number(c.member_count) || 0,
            post_count: Number(c.post_count) || 0,
            is_creator: c.is_creator
          }));
          setCommunities(formattedCommunities);
        } else {
          setCommunities([]);
        }
      } catch (error) {
        console.error("Error fetching communities:", error);
        toast.error("Eroare la încărcarea comunităților");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchCommunities();
    }
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const openDeleteDialog = (community: Community) => {
    setCommunityToDelete(community);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!communityToDelete) return;
    setIsDeleting(true);

    try {
      const planId = communityToDelete.membership_plan_id;
      const { data: posts } = await supabase
        .from("community_posts")
        .select("id")
        .eq("membership_plan_id", planId);

      if (posts && posts.length > 0) {
        const postIds = posts.map(post => post.id);
        await supabase.from("community_comments").delete().in("post_id", postIds);
        await (supabase as any).from("post_likes").delete().in("post_id", postIds);
        await supabase.from("community_posts").delete().eq("membership_plan_id", planId);
      }

      await supabase.from("community_groups").delete().eq("membership_plan_id", planId);
      await supabase.from("membership_subscriptions").delete().eq("membership_plan_id", planId);

      const { error } = await supabase
        .from("membership_plans")
        .delete()
        .eq("id", planId);

      if (error) throw error;

      setCommunities(prev => prev.filter(c => c.id !== communityToDelete.id));
      toast.success("Comunitatea a fost ștearsă.");
    } catch (error) {
      console.error("Error deleting community:", error);
      toast.error("Nu s-a putut șterge comunitatea.");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCommunityToDelete(null);
    }
  };

  // Different menu for creators vs students

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-beige/30 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  // Don't block access for authenticated users - they can always view this page
  // If they have no communities, they'll see a friendly message instead

  return (
    <>
      


      

      <div className="min-h-screen bg-beige/30 flex">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-background border-b border-border px-4 lg:px-8 py-4 flex items-center justify-between shrink-0">
            <button
              className="lg:hidden p-2 text-charcoal"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="hidden lg:block" />

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-semibold">
                {profile?.full_name?.charAt(0) || "C"}
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-8 overflow-y-auto pb-mobile-nav">
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-2">
                Comunitățile mele
              </h1>
              <p className="text-muted-foreground">
                Accesează comunitățile tale private și conectează-te cu ceilalți membri.
              </p>
            </div>

            {communities.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-navy mb-2">
                    {isCreator ? "Nu ai încă comunități legate de cursuri" : "Nu ai încă comunități"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {isCreator
                      ? "Creează un curs și adaugă o comunitate când ești gata."
                      : "Când te înscrii la un curs cu comunitate, aceasta va apărea aici."
                    }
                  </p>
                  {isCreator && (
                    <Link href="/dashboard/courses">
                      <Button variant="gold">
                        Vezi cursurile
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map((community) => (
                  <Card key={community.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-12 h-12 rounded-xl bg-sky/10 flex items-center justify-center">
                          <Users className="w-6 h-6 text-sky" />
                        </div>
                        {community.is_creator && (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20">
                              Creator
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openDeleteDialog(community)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Șterge
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-xl">{community.name}</CardTitle>
                      <CardDescription className="text-sm">
                        Curs: {community.membership_title.replace(/ - Comunitate$/, "")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {community.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {community.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{community.member_count} membri</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{community.post_count} postări</span>
                        </div>
                      </div>

                      <Link href={community.is_creator
                          ? `/dashboard/community/${community.membership_plan_id}`
                          : `/community/${community.membership_plan_id}`
                        }
                      >
                        <Button variant="outline" className="w-full group">
                          {community.is_creator ? "Administrează" : "Intră în comunitate"}
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <MobileBottomNav />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ești absolut sigur?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune nu poate fi anulată. Comunitatea{" "}
              <span className="font-semibold text-navy">
                "{communityToDelete?.name}"
              </span>{" "}
              va fi ștearsă permanent, împreună cu toate postările și comentariile ei.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Se șterge..." : "Șterge comunitatea"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MyCommunities;
