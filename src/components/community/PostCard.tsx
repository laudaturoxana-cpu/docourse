import { CommunityPost } from "@/hooks/useCommunity";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Pin, Trash2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import dynamic from "next/dynamic";

const ReactionPicker = dynamic(() => import("./ReactionPicker"), { ssr: false });

interface PostCardProps {
  post: CommunityPost;
  isCreator: boolean;
  currentUserId?: string;
  onLike: (postId: string, isLiked: boolean) => void;
  onComment: (post: CommunityPost) => void;
  onPin?: (postId: string, isPinned: boolean) => void;
  onDelete?: (postId: string) => void;
}

const PostCard = ({
  post,
  isCreator,
  currentUserId,
  onLike,
  onComment,
  onPin,
  onDelete,
}: PostCardProps) => {
  const canModerate = isCreator || post.author_id === currentUserId;
  const isAuthenticated = !!currentUserId;

  return (
    <Card className={cn(
      "bg-white border-border/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
      post.is_pinned && "border-gold/60 border-2 bg-gold/[0.03]"
    )}>
      <CardContent className="p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 lg:mb-4">
          <div className="flex gap-2 lg:gap-3 min-w-0 flex-1">
            <Avatar className="w-8 h-8 lg:w-10 lg:h-10 ring-2 ring-background shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-gold to-gold/70 text-white font-semibold text-xs lg:text-sm">
                {post.profiles?.full_name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-navy text-sm lg:text-base truncate">{post.profiles?.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString("ro-RO", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {canModerate && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background">
                {isCreator && onPin && (
                  <DropdownMenuItem onClick={() => onPin(post.id, post.is_pinned)}>
                    <Pin className={cn("w-4 h-4 mr-2", post.is_pinned && "fill-current")} />
                    {post.is_pinned ? "Anulează fixarea" : "Fixează"}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(post.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Șterge
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Pinned Badge */}
        {post.is_pinned && (
          <Badge variant="secondary" className="bg-gold/20 text-gold mb-3 text-xs">
            <Pin className="w-3 h-3 mr-1 fill-current" />
            Fixat
          </Badge>
        )}

        {/* Content */}
        <div className="space-y-3 lg:space-y-4">
          <p className="text-charcoal whitespace-pre-wrap leading-relaxed text-sm lg:text-base">{post.content}</p>

          {/* Image */}
          {post.image_url && (
            <div className="rounded-xl overflow-hidden -mx-1 lg:mx-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.image_url}
                alt="Post"
                className="w-full max-h-[300px] lg:max-h-[500px] object-cover hover:scale-[1.02] transition-transform cursor-pointer"
              />
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 lg:gap-2">
              {post.tags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs px-2 py-0.5">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Reactions */}
        <div className="mt-3 lg:mt-4">
          <ReactionPicker postId={post.id} isAuthenticated={isAuthenticated} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id, post.user_liked)}
            className={cn(
              "flex items-center gap-1.5 lg:gap-2 hover:bg-destructive/10 hover:text-destructive h-9 px-3",
              post.user_liked && "text-destructive"
            )}
          >
            <Heart className={cn("w-4 h-4", post.user_liked && "fill-current")} />
            <span className="text-sm">{post.likes_count || 0}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onComment(post)}
            className="flex items-center gap-1.5 lg:gap-2 hover:bg-sky/10 hover:text-sky h-9 px-3"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{post.comments_count || 0}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
