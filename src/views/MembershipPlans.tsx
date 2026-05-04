"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useMembership } from "@/hooks/useMembership";

import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, ExternalLink, Copy, Users, Calendar, Mail, Lock, Unlock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browser";

interface MemberData {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
}

interface CommunityInfo {
  access_type: string;
}

const MembershipPlans = () => {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { membershipPlans, isLoadingPlans, deletePlan } = useMembership();
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [communityInfo, setCommunityInfo] = useState<Record<string, CommunityInfo>>({});
  const [selectedPlanMembers, setSelectedPlanMembers] = useState<MemberData[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    const fetchMemberCounts = async () => {
      if (!membershipPlans) return;

      const counts: Record<string, number> = {};
      const communities: Record<string, CommunityInfo> = {};
      
      for (const plan of membershipPlans) {
        const { count } = await supabase
          .from("membership_subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("membership_plan_id", plan.id)
          .eq("status", "active");

        counts[plan.id] = count || 0;

        // Fetch community info
        const { data: communityData } = await supabase
          .from("community_groups")
          .select("access_type")
          .eq("membership_plan_id", plan.id)
          .single();

        if (communityData) {
          communities[plan.id] = { access_type: communityData.access_type ?? "free" } as CommunityInfo;
        }
      }

      setMemberCounts(counts);
      setCommunityInfo(communities);
    };

    fetchMemberCounts();
  }, [membershipPlans]);

  const loadPlanMembers = async (planId: string) => {
    setLoadingMembers(true);
    
    // First get subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from("membership_subscriptions")
      .select("id, user_id, status, created_at")
      .eq("membership_plan_id", planId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (subsError || !subscriptions) {
      setLoadingMembers(false);
      return;
    }

    // Get user IDs
    const userIds = subscriptions.map(sub => sub.user_id);

    // Fetch profiles for these users
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", userIds);

    // Map profiles to subscriptions
    const profilesMap = (profiles || []).reduce((acc, profile) => {
      if (profile.user_id) acc[profile.user_id] = { user_id: profile.user_id, full_name: profile.full_name ?? "" };
      return acc;
    }, {} as Record<string, { user_id: string; full_name: string }>);

    const membersWithProfiles = subscriptions.map(sub => ({
      ...sub,
      profiles: sub.user_id ? (profilesMap[sub.user_id] || null) : null
    }));

    setSelectedPlanMembers(membersWithProfiles as MemberData[]);
    setLoadingMembers(false);
  };

  const copyPublicLink = (slug: string) => {
    const url = `${window.location.origin}/membership/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  if (!user || !profile) {
    if (!user) router.push("/login");
    return null;
  }

  return (
    <>
      


      
      
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 container mx-auto px-4 pt-8 pb-8">
          <div className="max-w-6xl mx-auto">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mb-6 -ml-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Înapoi la Dashboard
              </Button>
            </Link>
            
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2">Membership Plans</h1>
                <p className="text-muted-foreground">
                  Create and manage recurring memberships
                </p>
              </div>
              <Button onClick={() => router.push("/dashboard/memberships/new")}>
                <Plus className="mr-2 h-4 w-4" />
                New Membership
              </Button>
            </div>

            {isLoadingPlans ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading membership plans...</p>
              </div>
            ) : membershipPlans && membershipPlans.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {membershipPlans.map((plan) => (
                  <Card key={plan.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{plan.title}</CardTitle>
                        <Badge variant={plan.status === "active" ? "default" : "secondary"}>
                          {plan.status}
                        </Badge>
                      </div>
                      {plan.short_description && (
                        <CardDescription>{plan.short_description}</CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <div className="space-y-2 mb-4">
                        {plan.price_info && (
                          <p className="text-2xl font-bold text-primary">{plan.price_info}</p>
                        )}
                        
                        {/* Members count */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-beige/50 rounded-lg px-3 py-2">
                          <Users className="w-4 h-4 text-gold" />
                          <span className="font-semibold text-navy">
                            {memberCounts[plan.id] || 0}
                          </span>
                          <span>
                            {memberCounts[plan.id] === 1 ? "membru activ" : "membri activi"}
                          </span>
                        </div>
                        
                        {plan.benefits && (
                          <div className="text-sm text-muted-foreground">
                            {plan.benefits.split('\n').slice(0, 3).map((benefit, idx) => (
                              <div key={idx}>• {benefit}</div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        {/* Community Button */}
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full bg-gold hover:bg-gold/90"
                          onClick={() => router.push(`/dashboard/community/${plan.id}`)}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Administrare Community
                        </Button>
                        
                        {/* Community Access Type Badge */}
                        {communityInfo[plan.id] && (
                          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-background/50 rounded-lg px-3 py-2 border">
                            {communityInfo[plan.id].access_type === 'free' ? (
                              <>
                                <Unlock className="w-3 h-3 text-green-600" />
                                <span>Community gratuită</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3 text-gold" />
                                <span>Community premium</span>
                              </>
                            )}
                          </div>
                        )}
                        
                        {/* View Members Button */}
                        {memberCounts[plan.id] > 0 && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => loadPlanMembers(plan.id)}
                              >
                                <Users className="mr-2 h-4 w-4" />
                                Vezi membri ({memberCounts[plan.id]})
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Users className="w-5 h-5 text-gold" />
                                  Membri activi - {plan.title}
                                </DialogTitle>
                              </DialogHeader>
                              
                              {loadingMembers ? (
                                <div className="flex items-center justify-center py-8">
                                  <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
                                </div>
                              ) : selectedPlanMembers.length > 0 ? (
                                <div className="space-y-3">
                                  {selectedPlanMembers.map((member) => (
                                    <div
                                      key={member.id}
                                      className="p-4 rounded-xl border border-border bg-beige/30 space-y-2"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                                            <span className="text-gold font-semibold text-sm">
                                              {member.profiles?.full_name?.charAt(0).toUpperCase() || "U"}
                                            </span>
                                          </div>
                                          <div>
                                            <p className="font-medium text-navy">
                                              {member.profiles?.full_name || "Utilizator"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              ID: {member.user_id.slice(0, 8)}...
                                            </p>
                                          </div>
                                        </div>
                                        <Badge variant="secondary" className="bg-gold/20 text-gold">
                                          {member.status}
                                        </Badge>
                                      </div>
                                      
                                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border">
                                        <div className="flex items-center gap-2">
                                          <Calendar className="w-4 h-4" />
                                          <span>
                                            Înscris: {new Date(member.created_at).toLocaleDateString('ro-RO')}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-center text-muted-foreground py-8">
                                  Nu există membri activi pentru acest plan.
                                </p>
                              )}
                            </DialogContent>
                          </Dialog>
                        )}
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/membership/${plan.slug}`)}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Previzualizare
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyPublicLink(plan.slug)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/dashboard/memberships/${plan.id}`)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editează
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm("Sigur vrei să ștergi acest membership?")) {
                                deletePlan(plan.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    You haven't created any membership plans yet.
                  </p>
                  <Button onClick={() => router.push("/dashboard/memberships/new")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Membership
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default MembershipPlans;
