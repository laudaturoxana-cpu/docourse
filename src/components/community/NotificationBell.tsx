"use client";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase/browser";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  from_user_name: string;
  from_user_avatar: string | null;
  post_id: string | null;
  comment_id: string | null;
  read: boolean;
  created_at: string;
}

const NOTIF_LABELS: Record<string, string> = {
  comment_on_post: "a comentat la postarea ta",
  reply_to_comment: "a răspuns la comentariul tău",
  post_liked: "a apreciat postarea ta",
  mentioned: "te-a menționat",
  new_post_in_community: "a publicat o postare nouă",
};

interface NotificationBellProps {
  membershipPlanId: string;
  onOpenPost?: (postId: string) => void;
}

const NotificationBell = ({ membershipPlanId, onOpenPost }: NotificationBellProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data } = await db.rpc("get_my_notifications", {
      _plan_id: membershipPlanId,
      _limit: 20,
    });
    if (data) {
      setNotifications(data as Notification[]);
      setUnreadCount((data as Notification[]).filter((n) => !n.read).length);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membershipPlanId]);

  // Subscribe to realtime new notifications
  useEffect(() => {
    const channel = supabase
      .channel(`notifs-${membershipPlanId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "community_notifications",
        filter: `membership_plan_id=eq.${membershipPlanId}`,
      }, () => {
        load();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membershipPlanId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = async () => {
    setOpen((v) => !v);
    if (!open && unreadCount > 0) {
      await db.rpc("mark_notifications_read", { _plan_id: membershipPlanId });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const handleClickNotif = (notif: Notification) => {
    if (notif.post_id && onOpenPost) {
      onOpenPost(notif.post_id);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <Button variant="ghost" size="icon" onClick={handleOpen} className="relative h-9 w-9">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 bg-background border border-border rounded-xl shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="font-semibold text-sm">Notificări</p>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                Nicio notificare.
              </p>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left",
                    !notif.read && "bg-gold/5"
                  )}
                  onClick={() => handleClickNotif(notif)}
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-gold/20 text-gold text-xs font-semibold">
                      {notif.from_user_name?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{notif.from_user_name}</span>{" "}
                      <span className="text-muted-foreground">
                        {NOTIF_LABELS[notif.type] ?? notif.type}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(notif.created_at).toLocaleString("ro-RO", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 bg-gold rounded-full shrink-0 mt-1.5" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
