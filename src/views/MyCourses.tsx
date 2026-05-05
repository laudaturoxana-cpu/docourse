"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Settings,
  LogOut,
  Menu,
  X,
  ArrowRight,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Search,
  Filter,
  Users
} from "lucide-react";
import Logo from "@/components/Logo";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionRequired } from "@/components/SubscriptionRequired";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface Course {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  access_token: string;
  is_published: boolean;
  created_at: string;
  image_url: string | null;
}

const MyCourses = () => {
  const router = useRouter();
  const { user, profile, signOut, isLoading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if user has active subscription
  const hasActiveSubscription = profile?.subscription_active || profile?.beta_tester || profile?.lifetime_access;
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!profile?.id) return;

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("creator_id", profile.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setCourses(data as unknown as Course[]);
      }
      setIsLoading(false);
    };

    if (profile?.id) {
      fetchCourses();
    }
  }, [profile?.id]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const copyLink = (course: Course) => {
    const url = `${window.location.origin}/course/${course.slug}/${course.access_token}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "✓ Link copiat cu succes!",
      description: `Link-ul pentru "${course.title}" a fost copiat în clipboard.`,
      duration: 3000,
    });
  };

  const openDeleteDialog = (course: Course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseToDelete.id);

    if (!error) {
      setCourses(courses.filter(c => c.id !== courseToDelete.id));
      toast({
        title: "Curs șters",
        description: "Cursul a fost șters cu succes.",
      });
    } else {
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge cursul. Te rugăm să încerci din nou.",
        variant: "destructive",
      });
    }

    setDeleteDialogOpen(false);
    setCourseToDelete(null);
  };

  // Filter courses based on search and status
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "published" && course.is_published) ||
      (statusFilter === "draft" && !course.is_published);

    return matchesSearch && matchesStatus;
  });


  if (authLoading) {
    return (
      <div className="min-h-screen bg-beige/30 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  // Block access if no active subscription
  if (!authLoading && profile && !hasActiveSubscription) {
    return <SubscriptionRequired />;
  }

  return (
    <>
      


      

      <div className="min-h-screen bg-beige/30 flex">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <header className="bg-background border-b border-border px-4 lg:px-8 py-4 flex items-center justify-between">
            <button
              className="lg:hidden p-2 text-charcoal"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden lg:block" />
            
            <div className="flex items-center gap-4">
              <Link href="/dashboard/courses/new">
                <Button variant="gold" size="sm">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Curs nou
                </Button>
              </Link>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-8 pb-mobile-nav">
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-2">
                Cursurile mele
              </h1>
              <p className="text-muted-foreground mb-4">
                Gestionează și editează cursurile tale.
              </p>

              {/* Quick Stats */}
              {courses.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <div className="bg-background rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground mb-1">Total</p>
                    <p className="text-2xl font-bold text-navy">{courses.length}</p>
                  </div>
                  <div className="bg-background rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground mb-1">Publicate</p>
                    <p className="text-2xl font-bold text-gold">
                      {courses.filter(c => c.is_published).length}
                    </p>
                  </div>
                  <div className="bg-background rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground mb-1">Draft-uri</p>
                    <p className="text-2xl font-bold text-muted-foreground">
                      {courses.filter(c => !c.is_published).length}
                    </p>
                  </div>
                  <div className="bg-background rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground mb-1">Filtrate</p>
                    <p className="text-2xl font-bold text-sky">
                      {filteredCourses.length}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Search and Filter Bar */}
            {courses.length > 0 && (
              <>
                <div className="mb-4 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Caută după titlu sau descriere..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(value: "all" | "published" | "draft") => setStatusFilter(value)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filtrează" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toate cursurile</SelectItem>
                      <SelectItem value="published">Publicate</SelectItem>
                      <SelectItem value="draft">Draft-uri</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Results count */}
                {(searchQuery || statusFilter !== "all") && (
                  <div className="mb-4 text-sm text-muted-foreground">
                    {filteredCourses.length === 0 ? (
                      "Niciun rezultat găsit"
                    ) : filteredCourses.length === 1 ? (
                      "1 curs găsit"
                    ) : (
                      `${filteredCourses.length} cursuri găsite`
                    )}
                    {filteredCourses.length < courses.length && (
                      <span> din {courses.length} total</span>
                    )}
                  </div>
                )}
              </>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-background rounded-2xl border border-border p-8 lg:p-12 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-gold" />
                </div>
                <h2 className="text-2xl font-bold text-navy mb-3">
                  Nu ai niciun curs încă
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Creează primul tău curs în 3 pași simpli:
                </p>

                <div className="max-w-lg mx-auto mb-8 text-left">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-beige/50">
                      <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-white font-bold shrink-0">1</div>
                      <div>
                        <h3 className="font-semibold text-navy mb-1">Adaugă detalii de bază</h3>
                        <p className="text-sm text-muted-foreground">Titlu, descriere și imagine (opțional)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-beige/50">
                      <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-white font-bold shrink-0">2</div>
                      <div>
                        <h3 className="font-semibold text-navy mb-1">Organizează în module</h3>
                        <p className="text-sm text-muted-foreground">Grupează lecțiile pe teme (ex: Modulul 1, 2, 3)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-beige/50">
                      <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-white font-bold shrink-0">3</div>
                      <div>
                        <h3 className="font-semibold text-navy mb-1">Adaugă lecții</h3>
                        <p className="text-sm text-muted-foreground">Video, text sau resurse descărcabile</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Link href="/dashboard/courses/new">
                  <Button variant="hero" size="lg" className="group">
                    Creează primul curs
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="bg-background rounded-2xl border border-border p-8 lg:p-12 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-gold" />
                </div>
                <h2 className="text-2xl font-bold text-navy mb-3">
                  Niciun curs găsit
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Nu am găsit cursuri care să corespundă criteriilor de căutare. Încearcă să modifici filtrele sau termenii de căutare.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                >
                  Resetează filtrele
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-background rounded-2xl border border-border overflow-hidden hover:shadow-medium transition-shadow"
                  >
                    <div className="aspect-video bg-beige relative">
                      {course.image_url ? (
                        <img
                          src={course.image_url}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className={cn(
                        "absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium",
                        course.is_published
                          ? "bg-gold/20 text-gold"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {course.is_published ? "Publicat" : "Draft"}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-semibold text-navy text-lg mb-2 line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {course.description || "Fără descriere"}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Link href={`/dashboard/courses/${course.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Editează
                          </Button>
                        </Link>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => copyLink(course)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copiază link
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a
                                href={`/course/${course.slug}/${course.access_token}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Vizualizează
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(course)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Șterge
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <MobileBottomNav />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ești absolut sigur?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune nu poate fi anulată. Cursul <span className="font-semibold text-navy">"{courseToDelete?.title}"</span> va fi șters permanent, împreună cu toate modulele și lecțiile sale.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Șterge cursul
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MyCourses;
