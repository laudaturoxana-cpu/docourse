"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Save,
  Eye,
  Image as ImageIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "sonner";

interface BlogPostData {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  published: boolean;
  meta_title: string;
  meta_description: string;
  keywords: string[];
}

const EditBlogPost = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const _params = useParams<{ id: string }>();
  const id = _params?.id;
  const { user, profile, isLoading: authLoading } = useAuth();
  const isNew = id === "new";

  // Check if user is admin
  const isAdmin = profile?.beta_tester || profile?.lifetime_access;

  const [post, setPost] = useState<BlogPostData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    published: false,
    meta_title: "",
    meta_description: "",
    keywords: [],
  });
  const [keywordsInput, setKeywordsInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      router.push("/dashboard");
      toast.error("Nu ai acces la această secțiune.");
    }
  }, [user, authLoading, isAdmin, router]);

  // Fetch existing post if editing
  const { isLoading: isLoadingPost } = useQuery({
    queryKey: ["editBlogPost", id],
    queryFn: async () => {
      if (isNew) return null;

      const { data, error } = await supabase
        .from("blog_posts" as never)
        .select("*")
        .eq("id", id as never)
        .single();

      if (error) throw error;

      const d = data as any;
      setPost({
        id: d.id,
        title: d.title || "",
        slug: d.slug || "",
        excerpt: d.excerpt || "",
        content: d.content || "",
        cover_image: d.cover_image || "",
        published: d.published || false,
        meta_title: d.meta_title || "",
        meta_description: d.meta_description || "",
        keywords: d.keywords || [],
      });
      setKeywordsInput((d.keywords || []).join(", "));

      return data;
    },
    enabled: !isNew && isAdmin,
  });

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setPost((prev) => ({
      ...prev,
      title: value,
      slug: prev.slug || generateSlug(value),
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const keywords = keywordsInput
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      const postData = {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        cover_image: post.cover_image || null,
        published: post.published,
        published_at: post.published ? new Date().toISOString() : null,
        meta_title: post.meta_title || post.title,
        meta_description: post.meta_description || post.excerpt,
        keywords: keywords.length > 0 ? keywords : null,
        author_id: user?.id,
      };

      if (isNew) {
        const { data, error } = await supabase
          .from("blog_posts" as never)
          .insert(postData as never)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("blog_posts" as never)
          .update(postData as never)
          .eq("id", id as never)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["adminBlogPosts"] });
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
      toast.success(isNew ? "Articol creat cu succes!" : "Articol salvat!");

      if (isNew && (data as any)?.id) {
        router.push(`/dashboard/blog/${(data as any).id}`);
      }
    },
    onError: (error: any) => {
      if (error?.code === "23505") {
        toast.error("Un articol cu acest slug există deja.");
      } else {
        toast.error("Nu s-a putut salva articolul.");
      }
    },
  });

  const handleSave = async () => {
    if (!post.title.trim()) {
      toast.error("Titlul este obligatoriu.");
      return;
    }
    if (!post.slug.trim()) {
      toast.error("Slug-ul este obligatoriu.");
      return;
    }
    if (!post.content.trim()) {
      toast.error("Conținutul este obligatoriu.");
      return;
    }

    setIsSaving(true);
    await saveMutation.mutateAsync();
    setIsSaving(false);
  };

  if (authLoading || (!isNew && isLoadingPost)) {
    return (
      <div className="min-h-screen bg-beige/30 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      

        <meta name="robots" content="noindex, nofollow" />
      

      <div className="min-h-screen bg-beige/30">
        {/* Header */}
        <header className="bg-background border-b border-border px-4 lg:px-8 py-4 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link href="/dashboard/blog"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-navy transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Înapoi la blog
            </Link>

            <div className="flex items-center gap-3">
              {post.published && !isNew && (
                <Link href={`/blog/${post.slug}`} target="_blank">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Previzualizează
                  </Button>
                </Link>
              )}
              <Button
                variant="gold"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Se salvează..." : "Salvează"}
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conținut articol</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titlu *</Label>
                    <Input
                      id="title"
                      value={post.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Titlul articolului"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug (URL) *</Label>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-muted-foreground mr-2">/blog/</span>
                      <Input
                        id="slug"
                        value={post.slug}
                        onChange={(e) => setPost((prev) => ({ ...prev, slug: e.target.value }))}
                        placeholder="url-articol"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Rezumat</Label>
                    <Textarea
                      id="excerpt"
                      value={post.excerpt}
                      onChange={(e) => setPost((prev) => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Scurtă descriere a articolului (apare în listări)"
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Conținut (HTML) *</Label>
                    <Textarea
                      id="content"
                      value={post.content}
                      onChange={(e) => setPost((prev) => ({ ...prev, content: e.target.value }))}
                      placeholder="<h2>Subtitlu</h2><p>Conținut articol...</p>"
                      className="mt-1 font-mono text-sm"
                      rows={20}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Poți folosi HTML: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;a&gt;, &lt;strong&gt;, &lt;em&gt;
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Publicare</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="published">Publicat</Label>
                    <Switch
                      id="published"
                      checked={post.published}
                      onCheckedChange={(checked) =>
                        setPost((prev) => ({ ...prev, published: checked }))
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {post.published
                      ? "Articolul este vizibil public."
                      : "Articolul este salvat ca draft."}
                  </p>
                </CardContent>
              </Card>

              {/* Cover image */}
              <Card>
                <CardHeader>
                  <CardTitle>Imagine copertă</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="cover_image">URL imagine</Label>
                    <Input
                      id="cover_image"
                      value={post.cover_image}
                      onChange={(e) =>
                        setPost((prev) => ({ ...prev, cover_image: e.target.value }))
                      }
                      placeholder="https://..."
                      className="mt-1"
                    />
                  </div>
                  {post.cover_image && (
                    <div className="mt-3 aspect-video bg-beige/50 rounded-lg overflow-hidden">
                      <img
                        src={post.cover_image}
                        alt="Cover"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SEO settings */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      value={post.meta_title}
                      onChange={(e) =>
                        setPost((prev) => ({ ...prev, meta_title: e.target.value }))
                      }
                      placeholder={post.title || "Titlul din Google"}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(post.meta_title || post.title).length}/60 caractere
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      value={post.meta_description}
                      onChange={(e) =>
                        setPost((prev) => ({ ...prev, meta_description: e.target.value }))
                      }
                      placeholder={post.excerpt || "Descrierea din Google"}
                      className="mt-1"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(post.meta_description || post.excerpt).length}/160 caractere
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="keywords">Cuvinte cheie</Label>
                    <Input
                      id="keywords"
                      value={keywordsInput}
                      onChange={(e) => setKeywordsInput(e.target.value)}
                      placeholder="cursuri online, tutorial, ghid"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Separate prin virgulă
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default EditBlogPost;
