"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar, MapPin, Video, Link as LinkIcon, Plus, Trash2, CalendarPlus } from "lucide-react";
import { supabase } from "@/lib/supabase/browser";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;
import { toast } from "sonner";

interface CommunityEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  is_online: boolean;
  link_url: string | null;
  creator_name: string;
}

interface CommunityEventsTabProps {
  membershipPlanId: string;
  isCreator: boolean;
  currentUserId?: string;
}

const toIcalDate = (date: Date) =>
  date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

const buildGoogleCalendarUrl = (event: CommunityEvent) => {
  const start = toIcalDate(new Date(event.event_date));
  const end = toIcalDate(new Date(new Date(event.event_date).getTime() + 60 * 60 * 1000));
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    ...(event.description ? { details: event.description } : {}),
    ...(event.link_url ? { location: event.link_url } : event.location ? { location: event.location } : {}),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const buildIcsDownload = (event: CommunityEvent) => {
  const start = toIcalDate(new Date(event.event_date));
  const end = toIcalDate(new Date(new Date(event.event_date).getTime() + 60 * 60 * 1000));
  const location = event.link_url || event.location || "";
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}` : "",
    location ? `LOCATION:${location}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
};

const CommunityEventsTab = ({ membershipPlanId, isCreator, currentUserId: _currentUserId }: CommunityEventsTabProps) => {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: "",
    event_time: "",
    location: "",
    is_online: true,
    link_url: "",
  });

  const loadEvents = async () => {
    const { data } = await db.rpc("get_community_events", { _plan_id: membershipPlanId });
    setEvents((data as CommunityEvent[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { loadEvents(); }, [membershipPlanId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    if (!form.title.trim() || !form.event_date || !form.event_time) {
      toast.error("Completați titlul și data evenimentului");
      return;
    }
    setSaving(true);
    try {
      const eventDatetime = new Date(`${form.event_date}T${form.event_time}:00`).toISOString();
      const { error } = await db.rpc("create_community_event", {
        _plan_id: membershipPlanId,
        _title: form.title.trim(),
        _description: form.description.trim() || null,
        _event_date: eventDatetime,
        _location: form.location.trim() || null,
        _is_online: form.is_online,
        _link_url: form.link_url.trim() || null,
      });
      if (error) {
        console.error("create_community_event error:", error);
        throw error;
      }
      toast.success("Eveniment creat!");
      setDialogOpen(false);
      setForm({ title: "", description: "", event_date: "", event_time: "", location: "", is_online: true, link_url: "" });
      loadEvents();
    } catch (err) {
      const msg = err instanceof Error ? err.message : (err as { message?: string })?.message;
      toast.error(msg ? `Eroare: ${msg}` : "Eroare la crearea evenimentului");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    const { error } = await db.rpc("delete_community_event", { _event_id: eventId });
    if (error) { toast.error("Eroare la ștergere"); return; }
    toast.success("Eveniment șters");
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
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
      {isCreator && (
        <div className="flex justify-end">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gold hover:bg-gold/90">
                <Plus className="w-4 h-4 mr-2" />
                Adaugă eveniment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Eveniment nou</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1">
                  <Label htmlFor="ev-title">Titlu *</Label>
                  <Input id="ev-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Sesiune Q&A live" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="ev-date">Data *</Label>
                    <Input id="ev-date" type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="ev-time">Ora *</Label>
                    <Input id="ev-time" type="time" value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ev-desc">Descriere</Label>
                  <Textarea id="ev-desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detalii despre eveniment..." />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_online: true })}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${form.is_online ? "border-gold bg-gold/10 text-gold" : "border-border"}`}
                  >
                    <Video className="w-4 h-4 inline mr-1" /> Online
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_online: false })}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${!form.is_online ? "border-gold bg-gold/10 text-gold" : "border-border"}`}
                  >
                    <MapPin className="w-4 h-4 inline mr-1" /> Fizic
                  </button>
                </div>
                {form.is_online ? (
                  <div className="space-y-1">
                    <Label htmlFor="ev-link">Link întâlnire</Label>
                    <Input id="ev-link" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="https://meet.google.com/..." />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Label htmlFor="ev-location">Locație</Label>
                    <Input id="ev-location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Adresa sau locul..." />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Anulează</Button>
                <Button onClick={handleCreate} disabled={saving} className="bg-gold hover:bg-gold/90">
                  {saving ? "Se salvează..." : "Creează eveniment"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Niciun eveniment planificat.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const date = new Date(event.event_date);
            return (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Date block */}
                      <div className="shrink-0 text-center bg-gold/10 rounded-xl px-3 py-2 min-w-[56px]">
                        <p className="text-xs font-medium text-gold uppercase">
                          {date.toLocaleDateString("ro-RO", { month: "short" })}
                        </p>
                        <p className="text-2xl font-bold text-navy leading-none">{date.getDate()}</p>
                        <p className="text-xs text-muted-foreground">
                          {date.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-navy">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          {event.is_online ? (
                            <span className="flex items-center gap-1 text-xs text-sky-600">
                              <Video className="w-3 h-3" /> Online
                            </span>
                          ) : event.location ? (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" /> {event.location}
                            </span>
                          ) : null}
                          {event.link_url && (
                            <a
                              href={event.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-gold hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <LinkIcon className="w-3 h-3" /> Alătură-te
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Google Calendar */}
                      <a
                        href={buildGoogleCalendarUrl(event)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Adaugă în Google Calendar"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors"
                      >
                        <CalendarPlus className="w-4 h-4" />
                      </a>
                      {/* Apple / Outlook .ics */}
                      <a
                        href={buildIcsDownload(event)}
                        download={`${event.title.replace(/\s+/g, "-")}.ics`}
                        title="Adaugă în Apple Calendar / Outlook"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-sky hover:bg-sky/10 transition-colors text-[10px] font-bold"
                      >
                        .ics
                      </a>
                      {isCreator && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommunityEventsTab;
