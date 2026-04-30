import { useState } from "react";
import { CommunityPost, CommunityComment } from "@/hooks/useCommunity";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, Send, Reply, Trash2, Pin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface CommentsDialogProps {
  post: CommunityPost | null;
  comments: CommunityComment[];
  isOpen: boolean;
  onClose: () => void;
  isCreator: boolean;
  currentUserId?: string;
  onCreateComment: (content: string, parentId: string | null) => void;
  onLikeComment: (commentId: string, isLiked: boolean) => void;
  onDeleteComment: (commentId: string) => void;
}

const CommentsDialog = ({
  post,
  comments,
  isOpen,
  onClose,
  isCreator,
  currentUserId,
  onCreateComment,
  onLikeComment,
  onDeleteComment,
}: CommentsDialogProps) => {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Validation constant matching server-side limit
  const MAX_COMMENT_LENGTH = 5000;

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    if (newComment.length > MAX_COMMENT_LENGTH) {
      return; // Silently prevent - textarea shows character count
    }
    onCreateComment(newComment, replyingTo);
    setNewComment("");
    setReplyingTo(null);
  };

  const renderComment = (comment: CommunityComment, depth = 0) => {
    const canDelete = isCreator || comment.author_id === currentUserId;

    return (
      <div key={comment.id} className={cn("space-y-2 lg:space-y-3", depth > 0 && "ml-6 lg:ml-8 pl-3 lg:pl-4 border-l-2 border-border")}>
        <div className="flex gap-2 lg:gap-3">
          <Avatar className="w-7 h-7 lg:w-8 lg:h-8 shrink-0">
            <AvatarFallback className="bg-gold/20 text-gold text-xs font-semibold">
              {comment.profiles?.full_name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="bg-beige/50 rounded-xl p-2.5 lg:p-3">
              <p className="font-semibold text-navy text-xs lg:text-sm mb-0.5 lg:mb-1">
                {comment.profiles?.full_name || "User"}
              </p>
              <p className="text-charcoal text-xs lg:text-sm whitespace-pre-wrap break-words">{comment.content}</p>
            </div>
            <div className="flex items-center gap-3 lg:gap-4 mt-1.5 lg:mt-2 text-xs text-muted-foreground">
              <button
                onClick={() => onLikeComment(comment.id, comment.user_liked)}
                className={cn(
                  "flex items-center gap-1 hover:text-destructive transition-colors touch-manipulation",
                  comment.user_liked && "text-destructive"
                )}
              >
                <Heart className={cn("w-3 h-3", comment.user_liked && "fill-current")} />
                {comment.likes_count > 0 && comment.likes_count}
              </button>
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="flex items-center gap-1 hover:text-gold transition-colors touch-manipulation"
              >
                <Reply className="w-3 h-3" />
                <span className="hidden sm:inline">Răspunde</span>
              </button>
              {canDelete && (
                <button
                  onClick={() => onDeleteComment(comment.id)}
                  className="hover:text-destructive transition-colors touch-manipulation"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
              <span className="text-[10px] lg:text-xs">
                {new Date(comment.created_at).toLocaleDateString('ro-RO', {
                  day: 'numeric',
                  month: 'short'
                })}
              </span>
            </div>
          </div>
        </div>
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-2 lg:space-y-3">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!post) return null;

  const content = (
    <>
      {/* Original Post - Compact on mobile */}
      <div className="border-b border-border pb-3 lg:pb-4 mb-3 lg:mb-4 shrink-0">
        <div className="flex gap-2 lg:gap-3">
          <Avatar className="w-8 h-8 lg:w-10 lg:h-10 shrink-0">
            <AvatarFallback className="bg-gold/20 text-gold font-semibold text-xs lg:text-sm">
              {post.profiles?.full_name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 lg:mb-1 flex-wrap">
              <p className="font-semibold text-navy text-sm lg:text-base">{post.profiles?.full_name || "User"}</p>
              {post.is_pinned && (
                <Badge variant="secondary" className="bg-gold/20 text-gold text-[10px] lg:text-xs px-1.5 py-0">
                  <Pin className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-0.5" />
                  Fixat
                </Badge>
              )}
            </div>
            <p className="text-xs lg:text-sm text-muted-foreground mb-1.5 lg:mb-2">
              {new Date(post.created_at).toLocaleDateString('ro-RO')}
            </p>
            <p className="text-charcoal whitespace-pre-wrap text-sm lg:text-base line-clamp-3 lg:line-clamp-none">{post.content}</p>
            {post.image_url && (
              <img src={post.image_url} alt="Post" className="rounded-xl mt-2 lg:mt-3 max-h-32 lg:max-h-48 object-cover" />
            )}
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto space-y-3 lg:space-y-4 pr-1 lg:pr-2 -mr-1 lg:-mr-2">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-6 lg:py-8 text-sm">
            Fii primul care comentează!
          </p>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="flex items-center gap-2 bg-beige/50 rounded-lg px-2.5 lg:px-3 py-1.5 lg:py-2 mt-3 lg:mt-4 shrink-0">
          <Reply className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-muted-foreground shrink-0" />
          <span className="text-xs lg:text-sm text-muted-foreground truncate">Răspunzi la comentariu</span>
          <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="ml-auto h-7 px-2 text-xs">
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Add Comment - Fixed at bottom on mobile */}
      <div className="flex gap-2 lg:gap-3 mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-border shrink-0">
        <div className="flex-1 relative">
          <Textarea
            placeholder="Scrie un comentariu..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
            rows={1}
            className="resize-none text-sm min-h-[40px] max-h-[80px] pr-12"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          />
          {newComment.length > MAX_COMMENT_LENGTH * 0.9 && (
            <span className={cn(
              "absolute bottom-1 right-2 text-[10px]",
              newComment.length >= MAX_COMMENT_LENGTH ? "text-destructive" : "text-muted-foreground"
            )}>
              {newComment.length}/{MAX_COMMENT_LENGTH}
            </span>
          )}
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!newComment.trim()}
          size="icon"
          className="shrink-0 bg-gold hover:bg-gold/90 h-10 w-10"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </>
  );

  // Use Drawer on mobile, Dialog on desktop
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh] flex flex-col px-4 pb-6">
          <DrawerHeader className="px-0 py-3">
            <DrawerTitle className="text-base">Comentarii</DrawerTitle>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Comentarii</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default CommentsDialog;