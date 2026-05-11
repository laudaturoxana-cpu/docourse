"use client";
import Link from "next/link";
import { useEffect, useState, lazy, Suspense } from "react";
;
import { Plus, Mail, Users, Trash2, Clock, ChevronRight, Send } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "@/hooks/use-toast";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const RichTextEditor = lazy(() => import("@/components/RichTextEditor"));

interface EmailList {
  id: string;
  name: string;
  created_at: string;
  contact_count?: number;
}

interface Campaign {
  id: string;
  subject: string;
  list_name: string | null;
  recipient_count: number;
  status: string;
  sent_at: string;
}

export default function EmailMarketing() {
  const { profile } = useAuth();

  const [lists, setLists] = useState<EmailList[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  // New list
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [savingList, setSavingList] = useState(false);

  // Delete list
  const [deletingList, setDeletingList] = useState<EmailList | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Campaign editor
  const [showCampaign, setShowCampaign] = useState(false);
  const [campaignListId, setCampaignListId] = useState("");
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignBody, setCampaignBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!profile) return;
    loadLists();
    loadCampaigns();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const loadLists = async () => {
    setLoadingLists(true);
    const { data } = await supabase
      .from("email_lists")
      .select("id, name, created_at")
      .eq("creator_id", profile!.id)
      .order("created_at", { ascending: false });

    if (data) {
      // Count contacts per list
      const withCounts = await Promise.all(
        data.map(async (l) => {
          const { count } = await supabase
            .from("email_contacts")
            .select("*", { count: "exact", head: true })
            .eq("list_id", l.id);
          return { ...l, contact_count: count || 0 };
        })
      );
      setLists(withCounts as EmailList[]);
    }
    setLoadingLists(false);
  };

  const loadCampaigns = async () => {
    setLoadingCampaigns(true);
    const { data } = await supabase
      .from("email_campaigns")
      .select("id, subject, list_name, recipient_count, status, sent_at")
      .eq("creator_id", profile!.id)
      .order("sent_at", { ascending: false })
      .limit(50);
    if (data) setCampaigns(data as Campaign[]);
    setLoadingCampaigns(false);
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || !profile) return;
    setSavingList(true);
    const { data, error } = await supabase
      .from("email_lists")
      .insert({ name: newListName.trim(), creator_id: profile.id })
      .select()
      .single();
    if (error) {
      toast({ title: "Eroare", description: error.message, variant: "destructive" });
    } else {
      setLists((prev) => [{ ...data, contact_count: 0 } as EmailList, ...prev]);
      setNewListName("");
      setShowNewList(false);
      toast({ title: "Listă creată!" });
    }
    setSavingList(false);
  };

  const handleDeleteList = async () => {
    if (!deletingList) return;
    setIsDeleting(true);
    const { error } = await supabase.from("email_lists").delete().eq("id", deletingList.id);
    if (error) {
      toast({ title: "Eroare", description: error.message, variant: "destructive" });
    } else {
      setLists((prev) => prev.filter((l) => l.id !== deletingList.id));
      toast({ title: "Listă ștearsă" });
    }
    setDeletingList(null);
    setIsDeleting(false);
  };

  const handleSendCampaign = async () => {
    if (!campaignListId || !campaignSubject.trim() || !campaignBody.trim()) {
      toast({ title: "Completează toate câmpurile", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("send-email-campaign", {
        body: { list_id: campaignListId, subject: campaignSubject, body_html: campaignBody },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw new Error(res.error.message);
      const result = res.data as { sent: number; errors: string[] };
      toast({ title: `Trimis cu succes!`, description: `${result.sent} emailuri trimise.` });
      setShowCampaign(false);
      setCampaignSubject("");
      setCampaignBody("");
      setCampaignListId("");
      loadCampaigns();
    } catch (e) {
      toast({ title: "Eroare la trimitere", description: (e as Error).message, variant: "destructive" });
    }
    setSending(false);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-beige/30">


      <header className="bg-background border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/"><Logo className="h-8 w-auto" /></Link>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-navy transition-colors">Dashboard</Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium text-navy">Email Marketing</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">

        {/* LISTE */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
              <Users className="w-5 h-5 text-gold" /> Liste de contacte
            </h2>
            <Button size="sm" onClick={() => setShowNewList(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Listă nouă
            </Button>
          </div>

          {showNewList && (
            <form onSubmit={handleCreateList} className="bg-background border border-border rounded-xl p-4 mb-4 flex gap-3 items-end">
              <div className="flex-1 space-y-1">
                <Label>Nume listă</Label>
                <Input
                  autoFocus
                  placeholder="Ex: Studenți curs AI, Newsletter..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="h-10"
                />
              </div>
              <Button type="submit" disabled={savingList || !newListName.trim()}>
                {savingList ? "Se salvează..." : "Creează"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowNewList(false); setNewListName(""); }}>
                Anulează
              </Button>
            </form>
          )}

          {loadingLists ? (
            <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-2 border-gold border-t-transparent rounded-full" /></div>
          ) : lists.length === 0 ? (
            <div className="bg-background border border-dashed border-border rounded-xl p-10 text-center text-muted-foreground">
              <Mail className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p>Nu ai nicio listă. Creează prima ta listă de contacte.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {lists.map((list) => (
                <div key={list.id} className="bg-background border border-border rounded-xl p-4 flex items-center gap-4 hover:border-gold/40 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy truncate">{list.name}</p>
                    <p className="text-xs text-muted-foreground">{list.contact_count} contacte</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gold hover:text-gold hover:bg-gold/10 gap-1 text-xs"
                      onClick={() => { setCampaignListId(list.id); setShowCampaign(true); }}
                    >
                      <Send className="w-3.5 h-3.5" /> Trimite
                    </Button>
                    <Link href={`/dashboard/email/list/${list.id}`}>
                      <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-navy gap-1 text-xs">
                        Contacte <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <button
                      onClick={() => setDeletingList(list)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CAMPANII */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
              <Clock className="w-5 h-5 text-gold" /> Campanii trimise
            </h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCampaign(true)}
              className="flex items-center gap-2"
              disabled={lists.length === 0}
            >
              <Send className="w-4 h-4" /> Campanie nouă
            </Button>
          </div>

          {loadingCampaigns ? (
            <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-2 border-gold border-t-transparent rounded-full" /></div>
          ) : campaigns.length === 0 ? (
            <div className="bg-background border border-dashed border-border rounded-xl p-10 text-center text-muted-foreground">
              <Send className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p>Nicio campanie trimisă încă.</p>
            </div>
          ) : (
            <div className="bg-background border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-beige/40 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Subiect</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Listă</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Destinatari</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Data</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {campaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-beige/20">
                      <td className="px-4 py-3 font-medium text-navy max-w-[200px] truncate">{c.subject}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.list_name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.recipient_count}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{formatDate(c.sent_at)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.status === "sent" ? "bg-green-100 text-green-700"
                          : c.status === "partial" ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                        }`}>
                          {c.status === "sent" ? "Trimis" : c.status === "partial" ? "Parțial" : "Eșuat"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Campaign Editor Dialog */}
      <Dialog open={showCampaign} onOpenChange={(o) => !sending && setShowCampaign(o)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-navy">Trimite campanie email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Listă destinatari</Label>
              <select
                className="w-full h-10 px-3 border border-input rounded-md bg-background text-sm"
                value={campaignListId}
                onChange={(e) => setCampaignListId(e.target.value)}
              >
                <option value="">Selectează lista...</option>
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>{l.name} ({l.contact_count} contacte)</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Subiect email</Label>
              <Input
                placeholder="Ex: Noutăți din cursul tău..."
                value={campaignSubject}
                onChange={(e) => setCampaignSubject(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-1">
              <Label>Conținut email</Label>
              <p className="text-xs text-muted-foreground">Poți folosi <code className="bg-muted px-1 rounded">{"{{name}}"}</code> pentru a personaliza cu numele destinatarului.</p>
              <div className="border border-input rounded-md overflow-hidden">
                <Suspense fallback={<div className="h-40 flex items-center justify-center"><div className="animate-spin w-5 h-5 border-2 border-gold border-t-transparent rounded-full" /></div>}>
                  <RichTextEditor
                    value={campaignBody}
                    onChange={setCampaignBody}
                    placeholder="Scrie conținutul emailului..."
                  />
                </Suspense>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSendCampaign}
                disabled={sending || !campaignListId || !campaignSubject.trim() || !campaignBody.trim()}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {sending ? "Se trimite..." : "Trimite campania"}
              </Button>
              <Button variant="outline" onClick={() => setShowCampaign(false)} disabled={sending}>
                Anulează
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete list confirmation */}
      <AlertDialog open={!!deletingList} onOpenChange={(o) => !o && setDeletingList(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge lista "{deletingList?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Vor fi șterse și toate contactele din această listă. Acțiunea nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteList} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
              {isDeleting ? "Se șterge..." : "Șterge"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
