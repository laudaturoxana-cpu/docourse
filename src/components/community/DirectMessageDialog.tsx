"use client";
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { supabase } from "@/lib/supabase/browser";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string | null;
  content: string;
  read: boolean;
  created_at: string;
}

interface DirectMessageDialogProps {
  open: boolean;
  onClose: () => void;
  membershipPlanId: string;
  currentUserId: string;
  recipient: { user_id: string; full_name: string };
}

const DirectMessageDialog = ({
  open,
  onClose,
  membershipPlanId,
  currentUserId,
  recipient,
}: DirectMessageDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    const { data } = await db.rpc("get_dm_conversation", {
      _plan_id: membershipPlanId,
      _other_user_id: recipient.user_id,
      _limit: 50,
      _before: new Date().toISOString(),
    });
    const msgs = ((data as Message[]) ?? []).reverse();
    setMessages(msgs);
    setLoading(false);
    // Marchează mesajele primite ca citite
    await db.rpc("mark_dms_read", {
      _plan_id: membershipPlanId,
      _sender_id: recipient.user_id,
    });
  };

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    loadMessages();
  }, [open, recipient.user_id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime subscription
  useEffect(() => {
    if (!open) return;
    const channel = supabase
      .channel(`dm-${membershipPlanId}-${recipient.user_id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "direct_messages",
        filter: `membership_plan_id=eq.${membershipPlanId}`,
      }, () => { loadMessages(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [open, membershipPlanId, recipient.user_id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const { error } = await db.rpc("send_direct_message", {
      _plan_id: membershipPlanId,
      _recipient_id: recipient.user_id,
      _content: text.trim(),
    });
    if (error) {
      toast.error("Eroare la trimiterea mesajului");
    } else {
      setText("");
      loadMessages();
    }
    setSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md h-[560px] flex flex-col p-0">
        <DialogHeader className="px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gold/20 text-gold font-semibold text-sm">
                {recipient.full_name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <DialogTitle className="text-base">{recipient.full_name}</DialogTitle>
          </div>
        </DialogHeader>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-4 border-gold border-t-transparent rounded-full" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Niciun mesaj. Trimite primul!
            </p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === currentUserId;
              return (
                <div key={msg.id} className={cn("flex gap-2", isMe && "flex-row-reverse")}>
                  {!isMe && (
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarFallback className="bg-gold/20 text-gold text-xs">
                        {msg.sender_name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn(
                    "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                    isMe
                      ? "bg-gold text-white rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  )}>
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={cn("text-[10px] mt-1", isMe ? "text-white/70" : "text-muted-foreground")}>
                      {new Date(msg.created_at).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Scrie un mesaj..."
              className="flex-1"
              maxLength={5000}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!text.trim() || sending}
              className="bg-gold hover:bg-gold/90 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DirectMessageDialog;
