"use client";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { SmilePlus } from "lucide-react";
import { supabase } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const EMOJIS = ["❤️", "🔥", "👏", "😂", "🙌", "💡", "🎉", "😮"] as const;

interface Reaction {
  post_id: string;
  emoji: string;
  count: number;
  user_reacted: boolean;
}

interface ReactionPickerProps {
  postId: string;
  isAuthenticated: boolean;
}

const ReactionPicker = ({ postId, isAuthenticated }: ReactionPickerProps) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await db.rpc("get_post_reactions", { _post_ids: [postId] });
      setReactions((data as Reaction[]) ?? []);
    };
    load();
  }, [postId]);

  const handleToggle = async (emoji: string) => {
    if (!isAuthenticated) return;
    setLoading(true);
    const { error } = await db.rpc("toggle_post_reaction", {
      _post_id: postId,
      _emoji: emoji,
    });
    if (!error) {
      const { data } = await db.rpc("get_post_reactions", { _post_ids: [postId] });
      setReactions((data as Reaction[]) ?? []);
    }
    setLoading(false);
  };

  const activeReactions = reactions.filter((r) => r.count > 0);

  return (
    <div className="flex items-center flex-wrap gap-1">
      {/* Existing reactions */}
      {activeReactions.map((r) => (
        <button
          key={r.emoji}
          disabled={loading || !isAuthenticated}
          onClick={() => handleToggle(r.emoji)}
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium transition-all",
            r.user_reacted
              ? "border-gold bg-gold/10 text-gold"
              : "border-border bg-muted/40 hover:bg-muted"
          )}
        >
          {r.emoji} <span>{r.count}</span>
        </button>
      ))}

      {/* Add reaction button */}
      {isAuthenticated && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-gold">
              <SmilePlus className="w-3.5 h-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-2">
            <div className="grid grid-cols-4 gap-1">
              {EMOJIS.map((emoji) => {
                const existing = reactions.find((r) => r.emoji === emoji);
                return (
                  <button
                    key={emoji}
                    disabled={loading}
                    onClick={() => handleToggle(emoji)}
                    className={cn(
                      "h-9 w-full rounded-lg text-xl hover:bg-muted transition-colors flex items-center justify-center",
                      existing?.user_reacted && "bg-gold/10"
                    )}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default ReactionPicker;
