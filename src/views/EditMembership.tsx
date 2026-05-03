"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionRequired } from "@/components/SubscriptionRequired";
import { useMembership } from "@/hooks/useMembership";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  Settings,
  Users,
  BookOpen,
  MessageSquare,
  Crown,
  Calendar,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  UserPlus,
  Search
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
}

interface Member {
  id: string;
  user_id: string;
  full_name: string;
  started_at: string;
  status: string;
}

const EditMembership = () => {
  const _params = useParams<{ membershipId: string }>();
  const id = _params?.membershipId;
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { updatePlan } = useMembership();

  // Check if user has active subscription
  const hasActiveSubscription = profile?.subscription_active || profile?.beta_tester || profile?.lifetime_access;

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState("settings");

  // Add member dialog state
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [foundUser, setFoundUser] = useState<{ id: string; full_name: string; email: string; isNew?: boolean } | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    short_description: "",
    description: "",
    price_info: "",
    stripe_checkout_url: "",
    benefits: "",
    includes_resources: "",
    status: "active",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !profile?.id) return;

      try {
        // Fetch membership plan
        const { data: membershipData, error: membershipError } = await supabase
          .from("membership_plans")
          .select("*")
          .eq("id", id)
          .eq("creator_id", profile.id)
          .single();

        if (membershipError) throw membershipError;

        if (membershipData) {
          setFormData({
            title: membershipData.title || "",
            slug: membershipData.slug || "",
            short_description: membershipData.short_description || "",
            description: membershipData.description || "",
            price_info: membershipData.price_info || "",
            stripe_checkout_url: membershipData.stripe_checkout_url || "",
            benefits: membershipData.benefits || "",
            includes_resources: membershipData.includes_resources || "",
            status: membershipData.status || "active",
          });
          
          if (membershipData.includes_courses && Array.isArray(membershipData.includes_courses)) {
            setSelectedCourses(membershipData.includes_courses as string[]);
          }
        }

        // Fetch courses
        const { data: coursesData } = await supabase
          .from("courses")
          .select("id, title")
          .eq("creator_id", profile.id)
          .order("created_at", { ascending: false });

        if (coursesData) {
          setCourses(coursesData);
        }

        // Fetch members
        const { data: subscriptionsData } = await supabase
          .from("membership_subscriptions")
          .select("user_id, created_at, status")
          .eq("membership_plan_id", id);

        if (subscriptionsData && subscriptionsData.length > 0) {
          const userIds = subscriptionsData.map(s => s.user_id);
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, user_id, full_name")
            .in("user_id", userIds);

          const membersWithProfiles = subscriptionsData.map(sub => {
            const profile = profilesData?.find(p => p.user_id === sub.user_id);
            return {
              id: profile?.id || sub.user_id,
              user_id: sub.user_id,
              full_name: profile?.full_name || "User",
              started_at: sub.created_at || "",
              status: sub.status
            };
          });

          setMembers(membersWithProfiles as Member[]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Nu s-a putut încărca membership-ul");
        router.push("/my-memberships");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, profile?.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    updatePlan({
      id,
      ...formData,
      includes_courses: selectedCourses.length > 0 ? selectedCourses : null,
    });
    
    toast.success("Membership actualizat cu succes!");
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(cid => cid !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) {
      toast.error("Introduceți o adresă de email");
      return;
    }

    setSearchLoading(true);
    setFoundUser(null);

    try {
      // Search for user by email
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id, user_id, full_name")
        .ilike("full_name", `%${searchEmail.trim()}%`)
        .limit(1)
        .single();

      if (userError || !userData) {
        // User doesn't exist - allow adding them anyway
        setFoundUser({
          id: "",
          full_name: searchEmail.split("@")[0],
          email: searchEmail.trim().toLowerCase(),
          isNew: true
        });
        return;
      }

      // Check if user is already a member
      const { data: existingSub } = await supabase
        .from("membership_subscriptions")
        .select("id, status")
        .eq("user_id", userData.user_id ?? "")
        .eq("membership_plan_id", id ?? "")
        .single();

      if (existingSub) {
        if (existingSub.status === "active") {
          toast.error("Acest utilizator este deja membru activ");
        } else {
          toast.error("Acest utilizator are deja un abonament (inactiv). Contactați suportul pentru reactivare.");
        }
        return;
      }

      setFoundUser({
        id: userData.user_id ?? "",
        full_name: userData.full_name || "User",
        email: searchEmail,
        isNew: false
      });
    } catch (error) {
      console.error("Error searching user:", error);
      toast.error("Eroare la căutarea utilizatorului");
    } finally {
      setSearchLoading(false);
    }
  };

  const sendWelcomeEmail = async (email: string, userName: string, membershipId: string) => {
    try {
      // Get course titles for this membership
      const courseTitles: string[] = [];
      if (selectedCourses.length > 0) {
        const coursesInMembership = courses.filter(c => selectedCourses.includes(c.id));
        courseTitles.push(...coursesInMembership.map(c => c.title));
      }

      // Call Supabase Edge Function to send email
      const { error } = await supabase.functions.invoke("send-membership-email", {
        body: {
          to: email,
          userName: userName,
          membershipTitle: formData.title,
          membershipId: membershipId,
          courseTitles: courseTitles,
          type: "manual_add"
        }
      });

      if (error) {
        console.error("Email function error:", error);
      } else {
        console.log("Welcome email sent successfully to:", email);
      }
    } catch (error) {
      console.error("Error sending welcome email:", error);
    }
  };

  const handleAddMember = async () => {
    if (!foundUser || !id) return;

    try {
      const userId = foundUser.id;

      // If user is new, create via Edge Function (to avoid logging out current user)
      if (foundUser.isNew) {
        const { data, error } = await supabase.functions.invoke("create-member-account", {
          body: {
            email: foundUser.email,
            fullName: foundUser.full_name,
            membershipPlanId: id
          }
        });

        if (error || !data?.userId) {
          toast.error("Eroare la crearea contului. Verifică dacă utilizatorul există deja.");
          console.error("Create account error:", error);
          return;
        }

        toast.success(`Cont creat! ${foundUser.email} va primi un email pentru a-și seta parola.`);
      } else {
        // Create membership subscription for existing user
        const { error: insertError } = await supabase
          .from("membership_subscriptions")
          .insert({
            user_id: userId,
            membership_plan_id: id,
            status: "active",
          });

        if (insertError) throw insertError;

        toast.success(`${foundUser.full_name} a fost adăugat ca membru activ!`);
      }

      // Send welcome email in background (don't wait for it)
      sendWelcomeEmail(foundUser.email, foundUser.full_name, id).catch(err => {
        console.error("Failed to send welcome email:", err);
        // Don't show error to user - email is not critical
      });

      // Refresh members list
      const { data: subscriptionsData } = await supabase
        .from("membership_subscriptions")
        .select("user_id, created_at, status")
        .eq("membership_plan_id", id);

      if (subscriptionsData && subscriptionsData.length > 0) {
        const userIds = subscriptionsData.map(s => s.user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, user_id, full_name")
          .in("user_id", userIds);

        const membersWithProfiles = subscriptionsData.map(sub => {
          const profile = profilesData?.find(p => p.user_id === sub.user_id);
          return {
            id: profile?.id || sub.user_id,
            user_id: sub.user_id,
            full_name: profile?.full_name || "User",
            started_at: sub.created_at || "",
            status: sub.status
          };
        });

        setMembers(membersWithProfiles as Member[]);
      }

      // Reset dialog
      setAddMemberDialogOpen(false);
      setSearchEmail("");
      setFoundUser(null);
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Eroare la adăugarea membrului");
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: BookOpen, label: "Cursurile mele", href: "/dashboard/courses" },
    { icon: Crown, label: "Memberships", href: "/my-memberships" },
    { icon: Settings, label: "Setări profil", href: "/dashboard/settings" },
  ];

  if (!user || !profile) {
    if (!user) router.push("/login");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-beige/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  // Block access if no active subscription
  if (profile && !hasActiveSubscription) {
    return <SubscriptionRequired />;
  }

  return (
    <>
      


      
      
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
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-charcoal hover:bg-beige hover:text-navy transition-all duration-200"
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
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-background">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <Logo size="sm" />
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="p-4">
                <ul className="space-y-1">
                  {menuItems.map((item) => (
                    <li key={item.label}>
                      <Link href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-charcoal hover:bg-beige transition-all"
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
          <header className="bg-background border-b border-border px-4 lg:px-8 py-4 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden p-2"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-6 h-6" />
                </button>
                <Link href="/my-memberships">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Înapoi la Memberships
                  </Button>
                </Link>
              </div>
              
              <Link href={`/community/${id}`}>
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Vezi comunitatea
                </Button>
              </Link>
            </div>
          </header>

          {/* Page Header */}
          <div className="bg-gradient-to-r from-navy to-navy/90 px-4 lg:px-8 py-8 text-white shrink-0">
            <div className="max-w-4xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-gold" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold">{formData.title}</h1>
                  <p className="text-white/70">
                    {members.filter(m => m.status === 'active').length} membri activi • {formData.status === 'active' ? 'Activ' : 'Inactiv'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Content */}
          <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
            <div className="max-w-4xl">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6 bg-background border border-border">
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Setări
                  </TabsTrigger>
                  <TabsTrigger value="courses" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Cursuri
                  </TabsTrigger>
                  <TabsTrigger value="members" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Membri ({members.length})
                  </TabsTrigger>
                </TabsList>

                {/* Settings Tab */}
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Setări Membership</CardTitle>
                      <CardDescription>
                        Configurează detaliile planului tău de membership
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="title">Titlu *</Label>
                            <Input
                              id="title"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              placeholder="ex: Premium Membership"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="slug">URL Slug *</Label>
                            <Input
                              id="slug"
                              value={formData.slug}
                              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                              placeholder="ex: premium-membership"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="price_info">Preț *</Label>
                            <Input
                              id="price_info"
                              value={formData.price_info}
                              onChange={(e) => setFormData({ ...formData, price_info: e.target.value })}
                              placeholder="ex: 29€/lună"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="status">Status *</Label>
                            <Select
                              value={formData.status}
                              onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selectează status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Activ</SelectItem>
                                <SelectItem value="inactive">Inactiv</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="short_description">Descriere scurtă</Label>
                          <Input
                            id="short_description"
                            value={formData.short_description}
                            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                            placeholder="Tagline pentru membership"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Descriere completă</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Descriere detaliată a beneficiilor"
                            rows={4}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="stripe_checkout_url">
                            Stripe Checkout URL (opțional)
                          </Label>
                          <Input
                            id="stripe_checkout_url"
                            value={formData.stripe_checkout_url}
                            onChange={(e) => setFormData({ ...formData, stripe_checkout_url: e.target.value })}
                            placeholder="https://buy.stripe.com/..."
                          />
                          <p className="text-sm text-muted-foreground">
                            Lasă gol pentru membership gratuit. Pentru plăți, obține link-ul din Stripe Dashboard → Payment Links
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="benefits">Beneficii (unul pe linie)</Label>
                          <Textarea
                            id="benefits"
                            value={formData.benefits}
                            onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                            placeholder="Acces la toate cursurile&#10;Sesiuni live lunare&#10;Comunitate privată"
                            rows={4}
                          />
                        </div>

                        <Button type="submit" size="lg" className="w-full md:w-auto">
                          Salvează modificările
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Courses Tab */}
                <TabsContent value="courses">
                  <Card>
                    <CardHeader>
                      <CardTitle>Cursuri incluse</CardTitle>
                      <CardDescription>
                        Selectează cursurile care vor fi accesibile membrilor acestui plan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {courses.length === 0 ? (
                        <div className="text-center py-12">
                          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground mb-4">
                            Nu ai cursuri create încă.
                          </p>
                          <Link href="/dashboard/courses/new">
                            <Button>Creează primul curs</Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {courses.map((course) => (
                            <div 
                              key={course.id} 
                              className={cn(
                                "flex items-center gap-4 p-4 rounded-xl border transition-colors cursor-pointer",
                                selectedCourses.includes(course.id) 
                                  ? "border-gold bg-gold/5" 
                                  : "border-border hover:border-gold/50"
                              )}
                              onClick={() => toggleCourse(course.id)}
                            >
                              <Checkbox
                                id={`course-${course.id}`}
                                checked={selectedCourses.includes(course.id)}
                                onCheckedChange={() => toggleCourse(course.id)}
                              />
                              <div className="flex-1">
                                <Label
                                  htmlFor={`course-${course.id}`}
                                  className="text-base font-medium cursor-pointer"
                                >
                                  {course.title}
                                </Label>
                              </div>
                              {selectedCourses.includes(course.id) && (
                                <Badge className="bg-gold/20 text-gold">Inclus</Badge>
                              )}
                            </div>
                          ))}
                          
                          <div className="pt-4">
                            <Button 
                              onClick={handleSubmit}
                              disabled={selectedCourses.length === 0}
                            >
                              Salvează cursurile selectate ({selectedCourses.length})
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Members Tab */}
                <TabsContent value="members">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Membri</CardTitle>
                          <CardDescription>
                            {members.length} {members.length === 1 ? 'membru' : 'membri'} în total
                          </CardDescription>
                        </div>
                        <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
                          <DialogTrigger asChild>
                            <Button>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Adaugă membru
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Adaugă membru manual</DialogTitle>
                              <DialogDescription>
                                Caută un utilizator după email și adaugă-l direct ca membru activ.
                                Utilizatorul trebuie să aibă deja un cont pe platformă.
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="email">Email utilizator</Label>
                                <div className="flex gap-2">
                                  <Input
                                    id="email"
                                    type="email"
                                    placeholder="exemplu@email.com"
                                    value={searchEmail}
                                    onChange={(e) => setSearchEmail(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleSearchUser();
                                      }
                                    }}
                                  />
                                  <Button
                                    onClick={handleSearchUser}
                                    disabled={searchLoading}
                                  >
                                    {searchLoading ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Search className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                              {foundUser && (
                                <div className="p-4 rounded-lg border border-green-200 bg-green-50">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10">
                                      <AvatarFallback className="bg-gold/20 text-gold font-semibold">
                                        {foundUser.full_name?.charAt(0).toUpperCase() || "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium text-navy">
                                        {foundUser.full_name}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {foundUser.email}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setAddMemberDialogOpen(false);
                                  setSearchEmail("");
                                  setFoundUser(null);
                                }}
                              >
                                Anulează
                              </Button>
                              <Button
                                onClick={handleAddMember}
                                disabled={!foundUser}
                              >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Adaugă membru
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {members.length === 0 ? (
                        <div className="text-center py-12">
                          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground mb-4">
                            Încă nu există membri în acest membership.
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Utilizează butonul "Adaugă membru" pentru a adăuga manual utilizatori care au plătit direct.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {members.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center gap-4 p-4 rounded-xl border border-border"
                            >
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-gold/20 text-gold font-semibold">
                                  {member.full_name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-navy truncate">
                                  {member.full_name}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Calendar className="w-3 h-3" />
                                  Membru din {new Date(member.started_at).toLocaleDateString('ro-RO', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                              <Badge
                                variant={member.status === 'active' ? 'default' : 'secondary'}
                                className={member.status === 'active' ? 'bg-green-500' : ''}
                              >
                                {member.status === 'active' ? 'Activ' : 'Inactiv'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default EditMembership;
