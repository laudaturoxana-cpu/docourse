"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, UserPlus, Upload, RefreshCw, Trash2, Search, Mail } from "lucide-react";
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

interface Contact {
  id: string;
  email: string;
  full_name: string | null;
  source: string;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
}

export default function EmailListContacts() {
  const _params = useParams<{ listId: string }>();
  const listId = _params?.listId;
  const { profile } = useAuth();

  const [listName, setListName] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Manual add
  const [showAddForm, setShowAddForm] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addName, setAddName] = useState("");
  const [adding, setAdding] = useState(false);

  // CSV import
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  // Course sync
  const [courses, setCourses] = useState<Course[]>([]);
  const [syncCourseId, setSyncCourseId] = useState("");
  const [syncing, setSyncing] = useState(false);

  // Delete
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!profile || !listId) return;
    loadList();
    loadCourses();
  }, [profile, listId]);

  const loadList = async () => {
    setLoading(true);
    const { data: listData } = await supabase
      .from("email_lists")
      .select("name")
      .eq("id", listId!)
      .eq("creator_id", profile!.id)
      .single();
    if (listData) setListName(listData.name);

    const { data } = await supabase
      .from("email_contacts")
      .select("id, email, full_name, source, created_at")
      .eq("list_id", listId!)
      .order("created_at", { ascending: false });
    if (data) setContacts(data as Contact[]);
    setLoading(false);
  };

  const loadCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("id, title")
      .eq("creator_id", profile!.id)
      .order("title");
    if (data) setCourses(data as Course[]);
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addEmail.trim()) return;
    setAdding(true);
    const { data, error } = await supabase
      .from("email_contacts")
      .insert({ list_id: listId!, email: addEmail.trim().toLowerCase(), full_name: addName.trim() || null, source: "manual" })
      .select()
      .single();
    if (error) {
      toast({ title: "Eroare", description: error.code === "23505" ? "Email-ul există deja în listă." : error.message, variant: "destructive" });
    } else {
      setContacts((prev) => [data as Contact, ...prev]);
      setAddEmail("");
      setAddName("");
      setShowAddForm(false);
      toast({ title: "Contact adăugat!" });
    }
    setAdding(false);
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);

    const text = await file.text();
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    // Skip header if first line contains "email" (case insensitive)
    const startIndex = lines[0]?.toLowerCase().includes("email") ? 1 : 0;

    const toInsert: { list_id: string; email: string; full_name: string | null; source: string }[] = [];
    for (let i = startIndex; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const email = cols[0]?.toLowerCase();
      const name = cols[1] || null;
      if (email && email.includes("@")) {
        toInsert.push({ list_id: listId!, email, full_name: name, source: "csv" });
      }
    }

    if (toInsert.length === 0) {
      toast({ title: "Niciun contact valid găsit în CSV.", variant: "destructive" });
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const { data, error } = await supabase
      .from("email_contacts")
      .upsert(toInsert, { onConflict: "list_id,email", ignoreDuplicates: true })
      .select();

    if (error) {
      toast({ title: "Eroare import", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Import reușit!`, description: `${data?.length || 0} contacte noi adăugate.` });
      loadList();
    }
    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleCourseSync = async () => {
    if (!syncCourseId) return;
    setSyncing(true);

    // Get enrolled students
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("user_id")
      .eq("course_id", syncCourseId);

    if (!enrollments || enrollments.length === 0) {
      toast({ title: "Niciun student înscris în cursul selectat.", variant: "destructive" });
      setSyncing(false);
      return;
    }

    const userIds = enrollments.map((e) => e.user_id);

    // Get profiles + emails
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", userIds);

    const { data: authUsers } = await supabase
      .from("profiles")
      .select("user_id")
      .in("user_id", userIds);

    // We need emails - get from auth.users via RPC or from a view
    // Use a direct approach: get emails from the get_course_students RPC data
    const { data: students } = await supabase.rpc("get_course_students" as never, {
      _course_id: syncCourseId,
      _creator_id: profile!.id,
    } as never) as { data: { user_id: string; email: string; full_name: string }[] | null };

    if (!students || students.length === 0) {
      toast({ title: "Nu s-au găsit studenți.", variant: "destructive" });
      setSyncing(false);
      return;
    }

    const toInsert = students.map((s) => ({
      list_id: listId!,
      email: s.email,
      full_name: s.full_name || null,
      source: "course_sync",
    }));

    const { data: inserted, error } = await supabase
      .from("email_contacts")
      .upsert(toInsert, { onConflict: "list_id,email", ignoreDuplicates: true })
      .select();

    if (error) {
      toast({ title: "Eroare sincronizare", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sincronizare reușită!", description: `${inserted?.length || 0} contacte noi adăugate.` });
      loadList();
    }
    setSyncing(false);
  };

  const handleDeleteContact = async () => {
    if (!deletingContact) return;
    setIsDeleting(true);
    const { error } = await supabase.from("email_contacts").delete().eq("id", deletingContact.id);
    if (error) {
      toast({ title: "Eroare", description: error.message, variant: "destructive" });
    } else {
      setContacts((prev) => prev.filter((c) => c.id !== deletingContact.id));
      toast({ title: "Contact șters" });
    }
    setDeletingContact(null);
    setIsDeleting(false);
  };

  const sourceLabel = (s: string) => {
    if (s === "csv") return "CSV";
    if (s === "course_sync") return "Curs";
    return "Manual";
  };

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.email.toLowerCase().includes(q) || (c.full_name || "").toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-beige/30">


      <header className="bg-background border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/"><Logo className="h-8 w-auto" /></Link>
          <Link href="/dashboard/email" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-navy transition-colors">
            <ArrowLeft className="w-4 h-4" /> Email Marketing
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium text-navy">{listName || "Listă"}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Actions bar */}
        <div className="bg-background border border-border rounded-xl p-4 flex flex-wrap gap-3 items-end">

          {/* Manual add */}
          <div>
            <Button size="sm" variant="outline" onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
              <UserPlus className="w-4 h-4" /> Adaugă manual
            </Button>
          </div>

          {/* CSV import */}
          <div>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={importing} className="gap-2">
              <Upload className="w-4 h-4" /> {importing ? "Se importă..." : "Import CSV"}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">Format: email, nume (opțional)</p>
          </div>

          {/* Course sync */}
          <div className="flex gap-2 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Sync studenți din curs</Label>
              <select
                className="h-9 px-2 border border-input rounded-md bg-background text-sm"
                value={syncCourseId}
                onChange={(e) => setSyncCourseId(e.target.value)}
              >
                <option value="">Selectează cursul...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <Button size="sm" variant="outline" onClick={handleCourseSync} disabled={!syncCourseId || syncing} className="gap-2 h-9">
              <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Se sincronizează..." : "Sincronizează"}
            </Button>
          </div>
        </div>

        {/* Manual add form */}
        {showAddForm && (
          <form onSubmit={handleAddManual} className="bg-background border border-border rounded-xl p-4 flex flex-wrap gap-3 items-end">
            <div className="space-y-1 flex-1 min-w-[180px]">
              <Label>Email *</Label>
              <Input autoFocus type="email" placeholder="contact@exemplu.ro" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} className="h-10" required />
            </div>
            <div className="space-y-1 flex-1 min-w-[180px]">
              <Label>Nume (opțional)</Label>
              <Input placeholder="Ion Popescu" value={addName} onChange={(e) => setAddName(e.target.value)} className="h-10" />
            </div>
            <Button type="submit" disabled={adding || !addEmail.trim()}>
              {adding ? "Se adaugă..." : "Adaugă"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Anulează</Button>
          </form>
        )}

        {/* Contacts table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">{contacts.length} contacte totale</p>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Caută..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-gold border-t-transparent rounded-full" /></div>
          ) : filtered.length === 0 ? (
            <div className="bg-background border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
              <Mail className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p>{contacts.length === 0 ? "Niciun contact în această listă." : "Niciun contact nu corespunde căutării."}</p>
            </div>
          ) : (
            <div className="bg-background border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-beige/40 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Nume</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Sursă</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((contact) => (
                    <tr key={contact.id} className="hover:bg-beige/20">
                      <td className="px-4 py-3 font-medium text-navy">{contact.email}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{contact.full_name || "—"}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                          {sourceLabel(contact.source)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setDeletingContact(contact)}
                          className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={!!deletingContact} onOpenChange={(o) => !o && setDeletingContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge contactul?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deletingContact?.email}</strong> va fi eliminat din această listă.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContact} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
              {isDeleting ? "Se șterge..." : "Șterge"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
