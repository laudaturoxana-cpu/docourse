"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase/browser";

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

interface CommunityLeaderboardProps {
  membershipPlanId: string;
  currentUserId?: string;
}

const CommunityLeaderboard = ({ membershipPlanId, currentUserId }: CommunityLeaderboardProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: board }, { data: me }] = await Promise.all([
        db.rpc("get_community_leaderboard", { _plan_id: membershipPlanId, _limit: 20 }),
        currentUserId
          ? db.rpc("get_my_community_points", { _plan_id: membershipPlanId })
          : Promise.resolve({ data: null }),
      ]);
      setEntries((board as LeaderboardEntry[]) ?? []);
      if (me && (me as MyStats[])[0]) setMyStats((me as MyStats[])[0]);
      setLoading(false);
    };
    load();
  }, [membershipPlanId, currentUserId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Fii primul care postează și câștigă puncte!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* My stats card */}
      {myStats && (
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

      {/* Leaderboard list */}
      <div className="space-y-2">
        {entries.map((entry, idx) => {
          const rank = idx + 1;
          const isMe = entry.user_id === currentUserId;
          return (
            <Card
              key={entry.user_id}
              className={isMe ? "border-gold border-2" : ""}
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

      <p className="text-xs text-center text-muted-foreground pt-2">
        Postare = 10 pct · Comentariu = 5 pct
      </p>
    </div>
  );
};

export default CommunityLeaderboard;
