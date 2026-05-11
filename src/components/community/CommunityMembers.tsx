import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Crown, Users, UserPlus, Search, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Member {
  id: string;
  user_id: string | null;
  full_name: string | null;
  avatar_url: string | null;
  isCreator: boolean;
  joined_at: string | null;
  isActive: boolean;
}

interface CommunityMembersProps {
  membershipPlanId: string;
  creatorId: string;
}

const CommunityMembers = ({ membershipPlanId, creatorId }: CommunityMembersProps) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [foundUser, setFoundUser] = useState<{ id: string; full_name: string; email: string } | null>(null);

  const isCreator = user?.id === creatorId;

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // Fetch active subscriptions for this membership
        const { data: subscriptions, error } = await supabase
          .from("membership_subscriptions")
          .select("user_id, created_at")
          .eq("membership_plan_id", membershipPlanId)
          .eq("status", "active");

        if (error) throw error;

        const userIds = subscriptions?.map(s => s.user_id) || [];

        // Add creator if not already in list
        if (!userIds.includes(creatorId)) {
          userIds.unshift(creatorId);
        }

        // Fetch profiles
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, user_id, full_name, avatar_url, created_at")
          .in("user_id", userIds);

        // Fetch active members (posted in last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: recentPosts } = await supabase
          .from("community_posts")
          .select("author_id")
          .eq("membership_plan_id", membershipPlanId)
          .gte("created_at", sevenDaysAgo);
        const activeUserIds = new Set((recentPosts || []).map(p => p.author_id));

        const membersData: Member[] = (profiles || []).map(profile => {
          const subscription = subscriptions?.find(s => s.user_id === profile.user_id);
          return {
            id: profile.id,
            user_id: profile.user_id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            isCreator: profile.user_id === creatorId,
            joined_at: subscription?.created_at || profile.created_at,
            isActive: activeUserIds.has(profile.user_id),
          };
        });

        // Sort: creator first, then active members, then by join date
        membersData.sort((a, b) => {
          if (a.isCreator) return -1;
          if (b.isCreator) return 1;
          if (a.isActive && !b.isActive) return -1;
          if (!a.isActive && b.isActive) return 1;
          return new Date(a.joined_at ?? 0).getTime() - new Date(b.joined_at ?? 0).getTime();
        });

        setMembers(membersData);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [membershipPlanId, creatorId]);

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) {
      toast.error("Introduceți o adresă de email");
      return;
    }

    setSearchLoading(true);
    setFoundUser(null);

    try {
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id, user_id, full_name")
        .ilike("full_name", `%${searchEmail.trim()}%`)
        .limit(1)
        .single();

      if (userError || !userData) {
        toast.error("Utilizator nu a fost găsit");
        return;
      }

      const { data: existingSub } = await supabase
        .from("membership_subscriptions")
        .select("id, status")
        .eq("user_id", userData.user_id ?? "")
        .eq("membership_plan_id", membershipPlanId)
        .single();

      if (existingSub) {
        toast.error(existingSub.status === "active"
          ? "Acest utilizator este deja membru activ"
          : "Acest utilizator are deja un abonament inactiv");
        return;
      }

      setFoundUser({
        id: userData.user_id ?? "",
        full_name: userData.full_name || "User",
        email: searchEmail
      });
    } catch (error) {
      console.error("Error searching user:", error);
      toast.error("Eroare la căutarea utilizatorului");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!foundUser) return;

    try {
      const { error: insertError } = await supabase
        .from("membership_subscriptions")
        .insert({
          user_id: foundUser.id,
          membership_plan_id: membershipPlanId,
          status: "active"
        });

      if (insertError) throw insertError;

      toast.success(`${foundUser.full_name} a fost adăugat ca membru!`);

      // Refresh members list
      const { data: subscriptions } = await supabase
        .from("membership_subscriptions")
        .select("user_id, created_at")
        .eq("membership_plan_id", membershipPlanId)
        .eq("status", "active");

      const userIds = subscriptions?.map(s => s.user_id) || [];
      if (!userIds.includes(creatorId)) {
        userIds.unshift(creatorId);
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, avatar_url, created_at")
        .in("user_id", userIds);

      const membersData: Member[] = (profiles || []).map(profile => {
        const subscription = (subscriptions as { user_id: string; created_at: string }[])?.find((s) => s.user_id === profile.user_id);
        return {
          id: profile.id,
          user_id: profile.user_id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          isCreator: profile.user_id === creatorId,
          joined_at: subscription?.created_at || profile.created_at,
          isActive: false,
        };
      });

      membersData.sort((a, b) => {
        if (a.isCreator) return -1;
        if (b.isCreator) return 1;
        return new Date(a.joined_at ?? 0).getTime() - new Date(b.joined_at ?? 0).getTime();
      });

      setMembers(membersData);
      setAddMemberDialogOpen(false);
      setSearchEmail("");
      setFoundUser(null);
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Eroare la adăugarea membrului");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-5 h-5" />
          <span>{members.length} {members.length === 1 ? "membru" : "membri"}</span>
        </div>

        {isCreator && (
          <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Adaugă membru
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adaugă membru nou</DialogTitle>
                <DialogDescription>
                  Caută un utilizator după email și adaugă-l în această comunitate.
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
                        if (e.key === "Enter") {
                          handleSearchUser();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSearchUser}
                      disabled={searchLoading || !searchEmail.trim()}
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
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-gold/20 text-gold">
                            {foundUser.full_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{foundUser.full_name}</p>
                          <p className="text-sm text-muted-foreground">{foundUser.email}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                  Adaugă membru
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gold/20 text-gold font-semibold">
                      {member.full_name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {member.isActive && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" title="Activ recent" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-navy truncate">
                      {member.full_name || "User"}
                    </p>
                    {member.isCreator && (
                      <Badge variant="secondary" className="bg-gold/20 text-gold shrink-0">
                        <Crown className="w-3 h-3 mr-1" />
                        Creator
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {member.isCreator
                      ? "Admin"
                      : member.isActive
                      ? "Activ recent"
                      : `Membru din ${new Date(member.joined_at ?? 0).toLocaleDateString('ro-RO', { month: 'short', year: 'numeric' })}`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {members.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Încă nu există membri în această comunitate.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommunityMembers;
