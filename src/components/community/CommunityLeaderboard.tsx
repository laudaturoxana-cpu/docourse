"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, Gift, Pencil, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  points: number;
  level: number;
  level_name: string;
}

interface MyStats {
  points: number;
  level: number;
  level_name: string;
  rank: number;
}

const LEVEL_COLORS: Record<number, string> = {
  1: "bg-gray-100 text-gray-600",
  2: "bg-sky/20 text-sky-700",
  3: "bg-purple-100 text-purple-700",
  4: "bg-gold/20 text-amber-700",
  5: "bg-gradient-to-r from-gold/30 to-orange-200 text-amber-800",
};

const RANK_MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

const TOP3_STYLES: Record<number, string> = {
  1: "border-amber-400 bg-amber-50 shadow-md",
  2: "border-slate-300 bg-slate-50",
  3: "border-orange-300 bg-orange-50",
};

interface CommunityLeaderboardProps {
  membershipPlanId: string;
  currentUserId?: string;
  isCreator?: boolean;
}

const CommunityLeaderboard = ({ membershipPlanId, currentUserId, isCreator }: CommunityLeaderboardProps) => {
  const [tab, setTab] = useState<"monthly" | "alltime">("monthly");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [reward, setReward] = useState<string | null>(null);
  const [editingReward, setEditingReward] = useState(false);
  const [rewardDraft, setRewardDraft] = useState("");
  const [savingReward, setSavingReward] = useState(false);

  const currentMonth = new Date().toLocaleDateString("ro-RO", { month: "long", year: "numeric" });

  const load = async (mode: "monthly" | "alltime") => {
    setLoading(true);
    const rpcName = mode === "monthly" ? "get_monthly_leaderboard" : "get_community_leaderboard";
    const [{ data: board }, { data: me }, { data: rewardData }] = await Promise.all([
      db.rpc(rpcName, { _plan_id: membershipPlanId, _limit: 20 }),
      currentUserId
        ? db.rpc("get_my_community_points", { _plan_id: membershipPlanId })
        : Promise.resolve({ data: null }),
      db.rpc("get_community_monthly_reward", { _plan_id: membershipPlanId }),
    ]);
    setEntries((board as LeaderboardEntry[]) ?? []);
    if (me && (me as MyStats[])[0]) setMyStats((me as MyStats[])[0]);
    setReward(rewardData as string | null);
    setLoading(false);
  };

  useEffect(() => { load(tab); }, [membershipPlanId, tab, currentUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveReward = async () => {
    if (!rewardDraft.trim()) return;
    setSavingReward(true);
    try {
      const { error } = await db.rpc("set_community_monthly_reward", {
        _plan_id: membershipPlanId,
        _reward_text: rewardDraft.trim(),
      });
      if (error) throw error;
      setReward(rewardDraft.trim());
      setEditingReward(false);
      toast.success("Premiul lunii salvat!");
    } catch {
      toast.error("Eroare la salvare");
    } finally {
      setSavingReward(false);
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

      {/* Monthly reward banner */}
      {tab === "monthly" && (
        <Card className="border-gold/40 bg-gradient-to-r from-gold/10 to-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                <Gift className="w-4 h-4 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gold uppercase tracking-wide mb-1">
                  Premiul lunii — {currentMonth}
                </p>
                {editingReward ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={rewardDraft}
                      onChange={(e) => setRewardDraft(e.target.value)}
                      placeholder="Ex: 30 min consultanță 1-on-1 gratuită"
                      className="flex-1 text-sm border border-gold/40 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold/30"
                      maxLength={500}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveReward(); if (e.key === "Escape") setEditingReward(false); }}
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleSaveReward} disabled={savingReward}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => setEditingReward(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {reward ? (
                      <p className="text-sm font-medium text-navy flex-1">
                        🎁 Top 3 câștigă: <span className="text-gold">{reward}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground flex-1 italic">
                        {isCreator ? "Setează premiul lunii pentru top 3 membri activi" : "Niciun premiu setat pentru luna aceasta"}
                      </p>
                    )}
                    {isCreator && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-gold shrink-0"
                        onClick={() => { setRewardDraft(reward ?? ""); setEditingReward(true); }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab toggle */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab("monthly")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "monthly" ? "bg-white shadow text-navy" : "text-muted-foreground hover:text-foreground"}`}
        >
          Luna aceasta
        </button>
        <button
          onClick={() => setTab("alltime")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "alltime" ? "bg-white shadow text-navy" : "text-muted-foreground hover:text-foreground"}`}
        >
          Toate timpurile
        </button>
      </div>

      {/* My stats */}
      {myStats && tab === "alltime" && (
        <Card className="border-gold/30 bg-gold/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Poziția ta</p>
                <p className="text-2xl font-bold text-navy">#{myStats.rank}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Puncte</p>
                <p className="text-2xl font-bold text-gold">{myStats.points}</p>
              </div>
              <Badge className={LEVEL_COLORS[myStats.level]}>
                Nivel {myStats.level} · {myStats.level_name}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      {entries.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground font-medium">
            {tab === "monthly" ? "Nicio activitate luna aceasta. Fii primul!" : "Fii primul care postează și câștigă puncte!"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Postare = 10 pct · Comentariu = 5 pct</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, idx) => {
            const rank = idx + 1;
            const isMe = entry.user_id === currentUserId;
            const isTop3 = rank <= 3 && tab === "monthly";
            return (
              <Card
                key={entry.user_id}
                className={`border-2 transition-shadow ${isTop3 ? TOP3_STYLES[rank] : isMe ? "border-gold" : "border-transparent hover:border-border"}`}
              >
                <CardContent className="p-3 lg:p-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-center font-bold text-lg shrink-0">
                      {RANK_MEDALS[rank] ?? `#${rank}`}
                    </span>
                    <Avatar className="w-9 h-9 shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-gold to-gold/70 text-white font-semibold text-sm">
                        {entry.full_name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy truncate">
                        {entry.full_name || "User"}
                        {isMe && <span className="text-gold text-xs ml-2">(tu)</span>}
                        {isTop3 && tab === "monthly" && <span className="ml-2 text-xs font-bold text-gold">★ Top {rank}</span>}
                      </p>
                      <Badge className={`text-xs mt-0.5 ${LEVEL_COLORS[entry.level]}`}>
                        {entry.level_name}
                      </Badge>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-navy">{entry.points}</p>
                      <p className="text-xs text-muted-foreground">puncte</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-xs text-center text-muted-foreground pt-2">
        Postare = 10 pct · Comentariu = 5 pct
      </p>
    </div>
  );
};

export default CommunityLeaderboard;
