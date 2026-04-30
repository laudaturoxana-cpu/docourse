import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ImageIcon, X, Send, Smile } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CreatePostFormProps {
  userName: string;
  onCreatePost: (content: string, imageUrl: string | null, tags: string[]) => void;
  onUploadImage: (file: File) => Promise<string>;
}

const CreatePostForm = ({ userName, onCreatePost, onUploadImage }: CreatePostFormProps) => {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imaginea nu poate depăși 5MB");
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Validation constants matching server-side limits
  const MAX_CONTENT_LENGTH = 10000;
  const MAX_TAGS = 10;
  const MAX_TAG_LENGTH = 50;
  const QUICK_EMOJIS = ["😀", "😅", "😍", "🤝", "👏", "🔥", "✅", "🎯", "💡", "🚀"];

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Scrie ceva înainte de a posta");
      return;
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      toast.error(`Conținutul nu poate depăși ${MAX_CONTENT_LENGTH} caractere`);
      return;
    }

    const parsedTags = tags
      .split(",")
      .map(tag => tag.trim().replace(/^#/, ""))
      .filter(tag => tag);

    if (parsedTags.length > MAX_TAGS) {
      toast.error(`Maximum ${MAX_TAGS} tag-uri permise`);
      return;
    }

    const longTag = parsedTags.find(tag => tag.length > MAX_TAG_LENGTH);
    if (longTag) {
      toast.error(`Tag-ul "${longTag.slice(0, 20)}..." depășește ${MAX_TAG_LENGTH} caractere`);
      return;
    }

    try {
      let imageUrl: string | null = null;
      
      if (selectedImage) {
        setUploading(true);
        imageUrl = await onUploadImage(selectedImage);
      }

      onCreatePost(content, imageUrl, parsedTags);

      // Reset form
      setContent("");
      setTags("");
      clearImage();
      setExpanded(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Eroare necunoscută";
      toast.error("Eroare la postare: " + message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-3 lg:p-4">
        <div className="flex gap-2 lg:gap-3">
          <Avatar className="w-8 h-8 lg:w-10 lg:h-10 shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-gold to-gold/70 text-white font-semibold text-sm lg:text-base">
              {userName?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 space-y-2 lg:space-y-3">
            <Textarea
              placeholder="Ce vrei să împărtășești cu comunitatea?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setExpanded(true)}
              rows={expanded ? 3 : 2}
              className="resize-none border-0 bg-beige/30 focus-visible:ring-1 focus-visible:ring-gold/50 transition-all text-sm lg:text-base min-h-[60px]"
            />

            {expanded && (
              <>
                {imagePreview && (
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="max-h-48 lg:max-h-64 w-full object-cover" />
                    <button
                      onClick={clearImage}
                      className="absolute top-2 right-2 p-2 bg-background/90 rounded-full hover:bg-destructive/10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Adaugă tags (virgulă)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-beige/30 rounded-lg border-0 focus:outline-none focus:ring-1 focus:ring-gold/50"
                />

                {/* Mobile-optimized actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
                  <div className="flex items-center gap-1">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        disabled={uploading}
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        type="button" 
                        disabled={uploading}
                        className="hover:bg-gold/10 hover:text-gold h-9 px-2 lg:px-3"
                        asChild
                      >
                        <span>
                          <ImageIcon className="w-4 h-4 lg:mr-2" />
                          <span className="hidden lg:inline">Imagine</span>
                        </span>
                      </Button>
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          className="hover:bg-gold/10 hover:text-gold h-9 px-2 lg:px-3"
                        >
                          <Smile className="w-4 h-4 lg:mr-2" />
                          <span className="hidden lg:inline">Emoji</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56">
                        <div className="grid grid-cols-5 gap-2">
                          {QUICK_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              className="h-8 w-8 rounded-md hover:bg-muted text-lg"
                              onClick={() => setContent((prev) => `${prev}${emoji}`)}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 text-xs lg:text-sm"
                      onClick={() => {
                        setContent("");
                        setTags("");
                        clearImage();
                        setExpanded(false);
                      }}
                    >
                      Anulează
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!content.trim() || uploading}
                      size="sm"
                      className="bg-gold hover:bg-gold/90 h-9 px-3 lg:px-4"
                    >
                      <Send className="w-4 h-4 lg:mr-2" />
                      <span className="hidden lg:inline">{uploading ? "Se încarcă..." : "Postează"}</span>
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Quick post button when not expanded */}
            {!expanded && (
              <div className="flex items-center justify-end gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handleImageSelect(e);
                      setExpanded(true);
                    }}
                    className="hidden"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    type="button"
                    className="hover:bg-gold/10 hover:text-gold h-8 w-8 p-0"
                    asChild
                  >
                    <span>
                      <ImageIcon className="w-4 h-4" />
                    </span>
                  </Button>
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      className="hover:bg-gold/10 hover:text-gold h-8 w-8 p-0"
                    >
                      <Smile className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56">
                    <div className="grid grid-cols-5 gap-2">
                      {QUICK_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className="h-8 w-8 rounded-md hover:bg-muted text-lg"
                          onClick={() => {
                            setContent((prev) => `${prev}${emoji}`);
                            setExpanded(true);
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <Button
                  onClick={() => setExpanded(true)}
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs text-muted-foreground"
                >
                  Extinde
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePostForm;
