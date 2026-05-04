"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Mail,
  Calendar,
  Download,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  UserMinus
} from "lucide-react";

import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "sonner";

interface Member {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  status: string;
  started_at: string;
  trial_end_date: string | null;
}

const MembershipMembers = () => {
  const _params = useParams<{ membershipId: string }>();
  const membershipId = _params?.membershipId;
  const router = useRouter();
  const { user, profile } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [membership, setMembership] = useState<{ title: string; creator_id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [removingMember, setRemovingMember] = useState<Member | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Fetch membership and verify ownership
  useEffect(() => {
    const fetchMembership = async () => {
      if (!membershipId) return;

      const { data, error } = await supabase
        .from("membership_plans")
        .select("title, creator_id")
        .eq("id", membershipId)
        .single();

      if (error || !data) {
        toast.error("Membership-ul nu a fost găsit");
        router.push("/my-memberships");
        return;
      }

      setMembership({ title: data.title, creator_id: data.creator_id ?? "" });
    };

    fetchMembership();
  }, [membershipId, router]);

  // Check if user is the creator
  useEffect(() => {
    if (membership && profile && membership.creator_id !== profile.id) {
      toast.error("Nu ai permisiunea să vezi această pagină");
      router.push("/my-memberships");
    }
  }, [membership, profile, router]);

  // Fetch members using Edge Function (to get emails from auth.users)
  useEffect(() => {
    const fetchMembers = async () => {
      if (!membershipId || !membership || !user) return;

      try {
        const { data, error } = await supabase.functions.invoke("get-membership-members", {
          body: {
            membershipId,
            creatorUserId: user.id
          }
        });

        if (error) throw error;

        if (data?.members) {
          setMembers(data.members);
          setFilteredMembers(data.members);
        } else {
          setMembers([]);
          setFilteredMembers([]);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
        toast.error("Eroare la încărcarea membrilor");
      } finally {
        setLoading(false);
      }
    };

    if (membership && user) {
      fetchMembers();
    }
  }, [membershipId, membership, user]);

  // Filter members based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMembers(members);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = members.filter(
      m =>
        m.full_name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query)
    );
    setFilteredMembers(filtered);
  }, [searchQuery, members]);

  // Export to CSV
  const handleExportCSV = () => {
    if (members.length === 0) {
      toast.error("Nu există membri de exportat");
      return;
    }

    setIsExporting(true);

    try {
      const headers = ["Nume", "Email", "Status", "Data înscrierii", "Sfârșit trial"];
      const rows = members.map(m => [
        m.full_name,
        m.email,
        m.status === "active" ? "Activ" : m.status === "trialing" ? "Trial" : "Anulat",
        new Date(m.started_at).toLocaleDateString("ro-RO"),
        m.trial_end_date ? new Date(m.trial_end_date).toLocaleDateString("ro-RO") : "-"
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `membri-${membership?.title || "membership"}-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Lista a fost exportată cu succes!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Eroare la exportul listei");
    } finally {
      setIsExporting(false);
    }
  };

  // Remove member from membership
  const handleRemoveMember = async () => {
    if (!removingMember || !membershipId) return;
    setIsRemoving(true);
    try {
      const { error } = await supabase
        .from("membership_subscriptions")
        .update({ status: "cancelled" })
        .eq("user_id", removingMember.user_id)
        .eq("membership_plan_id", membershipId);

      if (error) throw error;

      setMembers((prev) =>
        prev.map((m) =>
          m.user_id === removingMember.user_id ? { ...m, status: "cancelled" } : m
        )
      );
      toast.success(`${removingMember.full_name} a fost scos din membership.`);
    } catch (err) {
      console.error(err);
      toast.error("Eroare la scoaterea membrului.");
    } finally {
      setIsRemoving(false);
      setRemovingMember(null);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string, trialEndDate: string | null) => {
    const isOnTrial = status === "active" && trialEndDate && new Date(trialEndDate) > new Date();

    if (isOnTrial) {
      const daysLeft = Math.ceil(
        (new Date(trialEndDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-300">
          <Clock className="w-3 h-3 mr-1" />
          Trial ({daysLeft} zile)
        </Badge>
      );
    }

    if (status === "active") {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Activ
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-300">
        <XCircle className="w-3 h-3 mr-1" />
        Anulat
      </Badge>
    );
  };

  if (!user || !profile) {
    router.push("/login");
    return null;
  }

  return (
    <>
      


      

      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 container mx-auto px-4 pt-8 pb-8">
          <div className="max-w-6xl mx-auto">
            {/* Back button */}
            <div className="flex gap-2 mb-6 -ml-2">
              <Link href="/my-memberships">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Înapoi la Memberships
                </Button>
              </Link>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-navy flex items-center gap-3">
                  <Users className="w-8 h-8 text-gold" />
                  Membri
                </h1>
                <p className="text-muted-foreground mt-1">
                  {membership?.title} • {members.length} {members.length === 1 ? "membru" : "membri"} total
                </p>
              </div>

              <Button
                onClick={handleExportCSV}
                disabled={isExporting || members.length === 0}
                className="shrink-0"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Se exportă...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Exportă CSV
                  </>
                )}
              </Button>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-navy">
                      {members.filter(m => m.status === "active" && (!m.trial_end_date || new Date(m.trial_end_date) <= new Date())).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Membri activi</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-navy">
                      {members.filter(m => m.status === "active" && m.trial_end_date && new Date(m.trial_end_date) > new Date()).length}
                    </p>
                    <p className="text-sm text-muted-foreground">În trial</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-navy">
                      {members.filter(m => m.status === "cancelled").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Anulați</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Caută după nume sau email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Members table */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-xl font-semibold text-navy mb-2">
                    {searchQuery ? "Niciun rezultat" : "Nu există membri încă"}
                  </h2>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "Încearcă să cauți după alt nume sau email."
                      : "Când cineva se înscrie la acest membership, va apărea aici."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Lista de membri</CardTitle>
                  <CardDescription>
                    {filteredMembers.length} {filteredMembers.length === 1 ? "membru" : "membri"}
                    {searchQuery && ` pentru "${searchQuery}"`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nume</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data înscrierii</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMembers.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-semibold">
                                  {member.full_name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium">{member.full_name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <a
                                href={`mailto:${member.email}`}
                                className="flex items-center gap-2 text-muted-foreground hover:text-navy transition-colors"
                              >
                                <Mail className="w-4 h-4" />
                                {member.email}
                              </a>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(member.status, member.trial_end_date)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                {new Date(member.started_at).toLocaleDateString("ro-RO", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric"
                                })}
                              </div>
                            </TableCell>
                            <TableCell>
                              {member.status !== "cancelled" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => setRemovingMember(member)}
                                >
                                  <UserMinus className="w-4 h-4 mr-1" />
                                  Scoate
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        <Footer />
      </div>

      <AlertDialog open={!!removingMember} onOpenChange={(open) => !open && setRemovingMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Scoți membrul din membership?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{removingMember?.full_name}</strong> ({removingMember?.email}) va pierde accesul imediat. Această acțiune nu poate fi anulată automat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRemoving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Se procesează...</> : "Da, scoate membrul"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MembershipMembers;
