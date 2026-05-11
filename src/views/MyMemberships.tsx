"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Crown,
  Calendar,
  CheckCircle,
  ExternalLink,
  Users,
  Edit,
  Link as LinkIcon,
  Trash2,
  Power,
  PowerOff,
  XCircle,
  Loader2,
  Mail,
  Settings,
  BookOpen,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  slug: string;
  access_token: string;
}

interface MembershipSubscription {
  id: string;
  status: string;
  started_at: string;
  trial_end_date?: string | null;
  isCreator?: boolean;
  membership_plans: {
    id: string;
    title: string;
    slug: string;
    price_info: string | null;
    benefits: string | null;
    includes_courses: string[] | null;
    stripe_checkout_url: string | null;
    price_monthly?: number | null;
  };
}

const MyMemberships = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createdMemberships, setCreatedMemberships] = useState<MembershipSubscription[]>([]);
  const [subscribedMemberships, setSubscribedMemberships] = useState<MembershipSubscription[]>([]);
  const [coursesMap, setCoursesMap] = useState<Record<string, Course>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCancellingSubscription, setIsCancellingSubscription] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      // First get the profile ID
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profileData) {
        setIsLoading(false);
        return;
      }

      // Fetch subscriptions as a student
      const { data: subsData } = await supabase
        .from("membership_subscriptions")
        .select(`
          *,
          membership_plans (
            id,
            title,
            slug,
            price_info,
            benefits,
            includes_courses,
            stripe_checkout_url,
            price_monthly
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("started_at", { ascending: false });

      // Fetch membership plans created by this user (both active and inactive)
      const { data: plansData } = await supabase
        .from("membership_plans")
        .select("*")
        .eq("creator_id", profileData.id)
        .in("status", ["active", "inactive"])
        .order("created_at", { ascending: false });

      // Separate data: created plans and subscriptions
      const createdData: MembershipSubscription[] = [];
      const subscribedData: MembershipSubscription[] = [];

      // Add actual subscriptions
      if (subsData) {
        subscribedData.push(...(subsData as unknown as MembershipSubscription[]));
      }

      // Add created plans as "owned" memberships
      if (plansData) {
        plansData.forEach(plan => {
          createdData.push({
            id: plan.id,
            status: plan.status ?? "active",
            started_at: plan.created_at ?? "",
            isCreator: true,
            membership_plans: {
              id: plan.id,
              title: plan.title,
              slug: plan.slug,
              price_info: plan.price_info,
              benefits: plan.benefits,
              includes_courses: plan.includes_courses as string[] | null,
              stripe_checkout_url: plan.stripe_checkout_url,
            }
          });
        });
      }

      setCreatedMemberships(createdData);
      setSubscribedMemberships(subscribedData);
      
      const combinedData = [...createdData, ...subscribedData];
      
      // Fetch all courses that are included in memberships
      const allCourseIds = new Set<string>();
      combinedData.forEach(sub => {
        if (sub.membership_plans?.includes_courses) {
          sub.membership_plans.includes_courses.forEach(courseId => allCourseIds.add(courseId));
        }
      });

      if (allCourseIds.size > 0) {
        const { data: coursesData } = await supabase
          .from("courses")
          .select("id, title, slug, access_token")
          .in("id", Array.from(allCourseIds));

        if (coursesData) {
          const coursesById = coursesData.reduce((acc, course) => {
            acc[course.id] = { ...course, access_token: course.access_token ?? "" };
            return acc;
          }, {} as Record<string, Course>);
          setCoursesMap(coursesById);
        }
      }
      
      setIsLoading(false);
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const handleCancelSubscription = async () => {
    if (!user?.email) return;

    setIsCancellingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke("cancel-subscription", {
        body: { email: user.email }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Abonamentul a fost anulat cu succes! Nu vei mai fi taxat.");
        // Refresh the page to show updated state
        window.location.reload();
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      const errorMessage = error instanceof Error ? error.message : "Eroare necunoscută";
      toast.error(`Eroare la anularea abonamentului: ${errorMessage}. Te rugăm să ne contactezi la contact@docourse.ro`);
    } finally {
      setIsCancellingSubscription(false);
    }
  };

  const handleCopyLink = (slug: string) => {
    const link = `${window.location.origin}/membership/${slug}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiat în clipboard!");
  };

  const handleDeleteMembership = async (planId: string) => {
    try {
      const { error } = await supabase
        .from("membership_plans")
        .delete()
        .eq("id", planId);

      if (error) throw error;
      
      setCreatedMemberships(prev => prev.filter(m => m.membership_plans.id !== planId));
      toast.success("Membership-ul a fost șters cu succes!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Eroare necunoscută";
      toast.error("Eroare la ștergere: " + message);
    }
  };

  const handleToggleMembershipStatus = async (planId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const { error } = await supabase
        .from("membership_plans")
        .update({ status: newStatus })
        .eq("id", planId);

      if (error) throw error;
      
      setCreatedMemberships(prev => prev.map(m => 
        m.membership_plans.id === planId 
          ? { ...m, status: newStatus }
          : m
      ));
      toast.success(newStatus === 'active' 
        ? "Membership-ul a fost reactivat!"
        : "Membership-ul a fost dezactivat temporar!"
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Eroare necunoscută";
      toast.error("Eroare: " + message);
    }
  };


  if (authLoading) {
    return (
      <div className="min-h-screen bg-beige/30 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

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
              {/* Future: Add action buttons if needed */}
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-8 pb-mobile-nav">
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-2 flex items-center gap-3">
                <Crown className="w-8 h-8 text-gold" />
                Memberships-urile mele
              </h1>
              <p className="text-muted-foreground">
                Vezi abonamentele tale active și beneficiile primite.
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
              </div>
            ) : createdMemberships.length === 0 && subscribedMemberships.length === 0 ? (
              <Card>
                <CardContent className="p-8 lg:p-12 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-6">
                    <Crown className="w-10 h-10 text-gold" />
                  </div>
                  <h2 className="text-2xl font-bold text-navy mb-3">
                    Nu ai niciun membership activ
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Explorează memberships-urile disponibile și alege planul care ți se potrivește.
                  </p>
                  <Link href="/memberships">
                    <Button variant="hero" size="lg">
                      Explorează memberships
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-12">
                {/* Created Memberships Section */}
                {createdMemberships.length > 0 && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-navy flex items-center gap-2">
                        <Crown className="w-6 h-6 text-gold" />
                        Membership-urile mele
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        Planuri de membership pe care le-ai creat
                      </p>
                    </div>
                    <div className="space-y-6">
                      {createdMemberships.map((subscription) => {
                        const plan = subscription.membership_plans;
                        const benefits = plan.benefits ? plan.benefits.split('\n').filter(b => b.trim()) : [];
                        const includedCourses = plan.includes_courses || [];

                        return (
                          <Card key={subscription.id} className={cn("overflow-hidden", subscription.status === 'inactive' && "opacity-70")}>
                            <CardHeader className={cn("border-b p-4 lg:p-6", subscription.status === 'active' ? "bg-gold/5 border-gold/20" : "bg-muted/50 border-border")}>
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Crown className={cn("w-5 h-5 lg:w-6 lg:h-6 shrink-0", subscription.status === 'active' ? "text-gold" : "text-muted-foreground")} />
                                  <CardTitle className="text-lg lg:text-xl">{plan.title}</CardTitle>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {subscription.status === 'active' ? (
                                    <Badge variant="secondary" className="bg-gold/20 text-gold text-xs">
                                      Activ
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                                      Dezactivat
                                    </Badge>
                                  )}
                                  {!plan.stripe_checkout_url && (
                                    <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 text-xs">
                                      Gratuit
                                    </Badge>
                                  )}
                                  {subscription.isCreator && (
                                    <Badge variant="default" className="bg-navy text-white text-xs">
                                      Creator
                                    </Badge>
                                  )}
                                </div>
                                <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm lg:text-base">
                                  {plan.price_info && (
                                    <span className="font-semibold text-gold">{plan.price_info}</span>
                                  )}
                                  <span className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="w-4 h-4 shrink-0" />
                                    <span className="text-xs lg:text-sm">Activ din {new Date(subscription.started_at).toLocaleDateString('ro-RO')}</span>
                                  </span>
                                </CardDescription>
                              </div>
                            </CardHeader>

                            <CardContent className="p-4 lg:p-6 space-y-6">
                              {/* Quick Actions for Creator */}
                              <div className="grid grid-cols-2 gap-2 lg:gap-3">
                                <Link href={`/dashboard/memberships/${plan.id}`} className="block">
                                  <Button variant="outline" size="sm" className="w-full text-xs lg:text-sm">
                                    <Edit className="mr-1 lg:mr-2 h-4 w-4 shrink-0" />
                                    <span className="truncate">Editează</span>
                                  </Button>
                                </Link>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full text-xs lg:text-sm"
                                  onClick={() => handleCopyLink(plan.slug)}
                                >
                                  <LinkIcon className="mr-1 lg:mr-2 h-4 w-4 shrink-0" />
                                  <span className="truncate">Copiază link</span>
                                </Button>
                                <Link href={`/community/${plan.id}`} className="block">
                                  <Button variant="outline" size="sm" className="w-full text-xs lg:text-sm">
                                    <Users className="mr-1 lg:mr-2 h-4 w-4 shrink-0" />
                                    <span className="truncate">Comunitate</span>
                                  </Button>
                                </Link>
                                <Link href={`/dashboard/community/${plan.id}`} className="block">
                                  <Button variant="outline" size="sm" className="w-full text-xs lg:text-sm">
                                    <Settings className="mr-1 lg:mr-2 h-4 w-4 shrink-0" />
                                    <span className="truncate">Admin</span>
                                  </Button>
                                </Link>
                                <Link href={`/dashboard/memberships/${plan.id}/members`} className="block">
                                  <Button variant="outline" size="sm" className="w-full text-xs lg:text-sm border-gold/50 text-gold hover:bg-gold/10">
                                    <Mail className="mr-1 lg:mr-2 h-4 w-4 shrink-0" />
                                    <span className="truncate">Vezi membri</span>
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={cn(
                                    "w-full text-xs lg:text-sm",
                                    subscription.status === 'active'
                                      ? "border-orange-500/50 text-orange-600 hover:bg-orange-50"
                                      : "border-green-500/50 text-green-600 hover:bg-green-50"
                                  )}
                                  onClick={() => handleToggleMembershipStatus(plan.id, subscription.status)}
                                >
                                  {subscription.status === 'active' ? (
                                    <>
                                      <PowerOff className="mr-1 lg:mr-2 h-4 w-4 shrink-0" />
                                      <span className="truncate">Dezactivează</span>
                                    </>
                                  ) : (
                                    <>
                                      <Power className="mr-1 lg:mr-2 h-4 w-4 shrink-0" />
                                      <span className="truncate">Reactivează</span>
                                    </>
                                  )}
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full text-xs lg:text-sm border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                    >
                                      <Trash2 className="mr-1 lg:mr-2 h-4 w-4 shrink-0" />
                                      <span className="truncate">Șterge</span>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Ștergi acest membership?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Această acțiune va șterge permanent membership-ul "{plan.title}" 
                                        împreună cu comunitatea și toate postările asociate. 
                                        Această acțiune nu poate fi anulată.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Anulează</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDeleteMembership(plan.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Șterge permanent
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                              
                              {/* Benefits */}
                              {benefits.length > 0 && (
                                <div>
                                  <h3 className="font-semibold text-navy mb-3 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-gold" />
                                    Beneficii incluse
                                  </h3>
                                  <ul className="space-y-2">
                                    {benefits.map((benefit, index) => (
                                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                                        <CheckCircle className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                                        <span>{benefit}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Included Courses */}
                              {includedCourses.length > 0 && (
                                <div>
                                  <h3 className="font-semibold text-navy mb-3 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-gold" />
                                    Cursuri disponibile ({[...new Set(includedCourses)].filter(id => coursesMap[id]).length})
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[...new Set(includedCourses)].map((courseId) => {
                                      const course = coursesMap[courseId];
                                      if (!course) return null;

                                      return (
                                        <a
                                          key={courseId}
                                          href={`/course/${course.slug}/${course.access_token}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-gold hover:bg-gold/5 transition-all group"
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                                              <BookOpen className="w-5 h-5 text-gold" />
                                            </div>
                                            <span className="font-medium text-navy">{course.title}</span>
                                          </div>
                                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
                                        </a>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {includedCourses.length === 0 && benefits.length === 0 && (
                                <p className="text-muted-foreground text-center py-4">
                                  Acest membership nu are beneficii sau cursuri specificate.
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Subscribed Memberships Section */}
                {subscribedMemberships.length > 0 && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-navy flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-gold" />
                        Abonamente active
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        Membership-uri la care ești abonat
                      </p>
                    </div>
                    <div className="space-y-6">
                      {subscribedMemberships.map((subscription) => {
                        const plan = subscription.membership_plans;
                        const benefits = plan.benefits ? plan.benefits.split('\n').filter(b => b.trim()) : [];
                        const includedCourses = plan.includes_courses || [];

                        // Calculate trial status
                        const isOnTrial = subscription.trial_end_date && new Date(subscription.trial_end_date) > new Date();
                        const trialDaysRemaining = isOnTrial
                          ? Math.ceil((new Date(subscription.trial_end_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                          : 0;
                        const trialEndDate = subscription.trial_end_date ? new Date(subscription.trial_end_date) : null;

                        return (
                          <Card key={subscription.id} className="overflow-hidden">
                            <CardHeader className={cn(
                              "border-b",
                              isOnTrial
                                ? "bg-amber-50 border-amber-200"
                                : "bg-gold/5 border-gold/20"
                            )}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <Crown className="w-6 h-6 text-gold" />
                                    <CardTitle className="text-xl">{plan.title}</CardTitle>
                                    {isOnTrial ? (
                                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-300">
                                        🎁 Trial gratuit - {trialDaysRemaining} {trialDaysRemaining === 1 ? 'zi' : 'zile'}
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" className="bg-gold/20 text-gold">
                                        Activ
                                      </Badge>
                                    )}
                                    {!plan.stripe_checkout_url && (
                                      <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
                                        Gratuit
                                      </Badge>
                                    )}
                                  </div>
                                  <CardDescription className="flex flex-col gap-2 text-base">
                                    <div className="flex items-center gap-4 flex-wrap">
                                      {plan.price_info && (
                                        <span className="font-semibold text-gold">{plan.price_info}</span>
                                      )}
                                      <span className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        Activ din {new Date(subscription.started_at).toLocaleDateString('ro-RO')}
                                      </span>
                                    </div>
                                    {isOnTrial && trialEndDate && (
                                      <div className="flex items-start gap-2 p-3 bg-amber-100/50 rounded-lg border border-amber-200">
                                        <div className="text-sm text-amber-800">
                                          <p className="font-medium">
                                            {trialDaysRemaining === 1
                                              ? '🚨 Ultima zi de trial!'
                                              : `⏰ Încă ${trialDaysRemaining} ${trialDaysRemaining === 1 ? 'zi' : 'zile'} de trial gratuit`}
                                          </p>
                                          <p className="text-amber-700 mt-1">
                                            Prima taxare: {trialEndDate.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            {plan.price_monthly && ` (${plan.price_monthly} RON/lună)`}
                                          </p>
                                          <p className="text-amber-600 mt-1 text-xs">
                                            Poți anula oricând fără costuri, înainte de această dată.
                                          </p>
                                          <div className="mt-3 flex flex-col sm:flex-row gap-2">
                                            <AlertDialog>
                                              <AlertDialogTrigger asChild>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                  disabled={isCancellingSubscription}
                                                >
                                                  {isCancellingSubscription ? (
                                                    <>
                                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                      Se anulează...
                                                    </>
                                                  ) : (
                                                    <>
                                                      <XCircle className="w-4 h-4 mr-2" />
                                                      Anulează abonamentul
                                                    </>
                                                  )}
                                                </Button>
                                              </AlertDialogTrigger>
                                              <AlertDialogContent>
                                                <AlertDialogHeader>
                                                  <AlertDialogTitle>Anulezi abonamentul?</AlertDialogTitle>
                                                  <AlertDialogDescription>
                                                    Ești sigur că vrei să anulezi? Vei pierde accesul la conținutul premium.
                                                    <br /><br />
                                                    <strong>Nu vei fi taxat dacă anulezi acum în perioada de trial.</strong>
                                                  </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                  <AlertDialogCancel>Păstrează abonamentul</AlertDialogCancel>
                                                  <AlertDialogAction
                                                    onClick={handleCancelSubscription}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                  >
                                                    Da, anulează acum
                                                  </AlertDialogAction>
                                                </AlertDialogFooter>
                                              </AlertDialogContent>
                                            </AlertDialog>
                                            <Link href="/dashboard/settings">
                                              <Button variant="outline" size="sm">
                                                Setări abonament
                                              </Button>
                                            </Link>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="p-6 space-y-6">
                              {/* Access Community Button */}
                              <Link href={`/community/${plan.id}`}>
                                <Button variant="hero" size="sm" className="w-full">
                                  <Users className="mr-2 h-4 w-4" />
                                  Accesează comunitatea
                                </Button>
                              </Link>
                              
                              {/* Benefits */}
                              {benefits.length > 0 && (
                                <div>
                                  <h3 className="font-semibold text-navy mb-3 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-gold" />
                                    Beneficii incluse
                                  </h3>
                                  <ul className="space-y-2">
                                    {benefits.map((benefit, index) => (
                                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                                        <CheckCircle className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                                        <span>{benefit}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Included Courses */}
                              {includedCourses.length > 0 && (
                                <div>
                                  <h3 className="font-semibold text-navy mb-3 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-gold" />
                                    Cursuri disponibile ({[...new Set(includedCourses)].filter(id => coursesMap[id]).length})
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[...new Set(includedCourses)].map((courseId) => {
                                      const course = coursesMap[courseId];
                                      if (!course) return null;

                                      return (
                                        <a
                                          key={courseId}
                                          href={`/course/${course.slug}/${course.access_token}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-gold hover:bg-gold/5 transition-all group"
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                                              <BookOpen className="w-5 h-5 text-gold" />
                                            </div>
                                            <span className="font-medium text-navy">{course.title}</span>
                                          </div>
                                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
                                        </a>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {includedCourses.length === 0 && benefits.length === 0 && (
                                <p className="text-muted-foreground text-center py-4">
                                  Acest membership nu are beneficii sau cursuri specificate.
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      <MobileBottomNav />
    </>
  );
};

export default MyMemberships;
