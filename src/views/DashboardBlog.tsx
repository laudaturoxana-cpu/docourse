"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  FileText,
} from "lucide-react";
import Logo from "@/components/Logo";
import MobileBottomNav from "@/components/MobileBottomNav";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

const DashboardBlog = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, profile, signOut, isLoading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);

  // Check if user is admin
  const isAdmin = profile?.beta_tester || profile?.lifetime_access;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      router.push("/dashboard");
      toast.error("Nu ai acces la această secțiune.");
    }
  }, [user, authLoading, isAdmin, router]);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["adminBlogPosts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts" as never)
        .select("id, title, slug, published, published_at, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BlogPost[];
    },
    enabled: isAdmin,
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("blog_posts" as never)
        .delete()
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBlogPosts"] });
      toast.success("Articol șters cu succes.");
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    },
    onError: () => {
      toast.error("Nu s-a putut șterge articolul.");
    },
  });

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: BookOpen, label: "Cursurile mele", href: "/dashboard/courses" },
    { icon: Users, label: "Comunități", href: "/my-communities" },
    { icon: FileText, label: "Blog", href: "/dashboard/blog", active: true },
    { icon: Settings, label: "Setări profil", href: "/dashboard/settings" },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-beige/30 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      

        <meta name="robots" content="noindex, nofollow" />
      

      <div className="min-h-screen bg-beige/30 flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-64 bg-background border-r border-border shrink-0">
          <div className="p-6 border-b border-border">
            <Link href="/">
              <Logo size="md" />
            </Link>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.label}>
                  <Link href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                      item.active
                        ? "bg-gold/10 text-gold font-medium"
                        : "text-charcoal hover:bg-beige hover:text-navy"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-border">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              Deconectare
            </button>
          </div>
        </aside>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-navy/50" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-background animate-slide-in-left">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <Logo size="sm" />
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-6 h-6 text-charcoal" />
                </button>
              </div>
              <nav className="p-4">
                <ul className="space-y-1">
                  {menuItems.map((item) => (
                    <li key={item.label}>
                      <Link href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                          item.active
                            ? "bg-gold/10 text-gold font-medium"
                            : "text-charcoal hover:bg-beige hover:text-navy"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          </div>
        )}

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

            <Link href="/dashboard/blog/new">
              <Button variant="gold">
                <Plus className="w-4 h-4 mr-2" />
                Articol nou
              </Button>
            </Link>
          </header>

          <main className="flex-1 p-4 lg:p-8 overflow-y-auto pb-mobile-nav">
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-2">
                Administrare Blog
              </h1>
              <p className="text-muted-foreground">
                Gestionează articolele de blog pentru SEO.
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-navy truncate">
                            {post.title}
                          </h3>
                          <Badge variant={post.published ? "default" : "secondary"}>
                            {post.published ? "Publicat" : "Draft"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          /blog/{post.slug} • Creat pe {formatDate(post.created_at)}
                        </p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {post.published && (
                            <DropdownMenuItem asChild>
                              <Link href={`/blog/${post.slug}`} target="_blank">
                                <Eye className="w-4 h-4 mr-2" />
                                Vezi articol
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/blog/${post.id}`}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Editează
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setPostToDelete(post);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Șterge
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-navy mb-2">
                    Nu ai articole încă
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Creează primul articol pentru a îmbunătăți SEO-ul site-ului.
                  </p>
                  <Link href="/dashboard/blog/new">
                    <Button variant="gold">
                      <Plus className="w-4 h-4 mr-2" />
                      Creează primul articol
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>

      <MobileBottomNav />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ești sigur?</AlertDialogTitle>
            <AlertDialogDescription>
              Articolul "{postToDelete?.title}" va fi șters permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => postToDelete && deleteMutation.mutate(postToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DashboardBlog;
