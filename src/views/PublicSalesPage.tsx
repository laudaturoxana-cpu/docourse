"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DOMPurify from "dompurify";
import { supabase } from "@/lib/supabase/browser";

interface BrandColors {
  primary: string;
  primary_light: string;
  accent: string;
  accent_text: string;
  body_bg: string;
  section_alt_bg: string;
  text_primary: string;
  text_muted: string;
}

const DEFAULT_COLORS: BrandColors = {
  primary: "#0a192f",
  primary_light: "#1B3A6B",
  accent: "#d4a017",
  accent_text: "#0a192f",
  body_bg: "#fafaf8",
  section_alt_bg: "#f3f1ec",
  text_primary: "#1a2332",
  text_muted: "#5a6a7a",
};

interface Testimonial {
  name: string;
  role: string;
  text: string;
}

interface SalesPage {
  slug: string;
  headline: string | null;
  subheadline: string | null;
  body_html: string | null;
  cta_type: "stripe" | "calendly" | "whatsapp";
  cta_url: string | null;
  cta_label: string | null;
  price_text: string | null;
  course_image_url: string | null;
  creator_avatar_url: string | null;
  creator_name: string | null;
  is_published: boolean;
  brand_colors: BrandColors | null;
  font_style: string | null;
  avatar_summary: string | null;
  testimonials: Testimonial[] | null;
  courses: { title: string } | null;
}

function buildCtaHref(type: string, url: string | null): string {
  if (!url) return "#";
  if (type === "whatsapp") {
    const num = url.replace(/\D/g, "");
    return `https://wa.me/${num}`;
  }
  return url;
}

const GENERIC_STYLES = ["professional", "elegant", "bold", "warm"];

function getFontClass(fontStyle: string | null): string {
  switch (fontStyle) {
    case "elegant": return "font-serif";
    case "bold": return "font-sans font-black tracking-tight";
    case "warm": return "font-sans";
    default: return "font-sans";
  }
}

// Returns Google Fonts URL for a font name, or null if it's a generic style
function getGoogleFontUrl(fontStyle: string | null): string | null {
  if (!fontStyle || GENERIC_STYLES.includes(fontStyle)) return null;
  const encoded = fontStyle.replace(/ /g, "+");
  return `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;600;700;800&display=swap`;
}

// CSS font-family value for inline styles when using a Google Font
function getFontFamily(fontStyle: string | null): string | null {
  if (!fontStyle || GENERIC_STYLES.includes(fontStyle)) return null;
  return `'${fontStyle}', sans-serif`;
}

export default function PublicSalesPage() {
  const _params = useParams<{ slug: string }>();
  const slug = _params?.slug;
  const [page, setPage] = useState<SalesPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("sales_pages")
      .select("*, courses(title)")
      .eq("slug", slug)
      .eq("is_published", true)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setPage(data as SalesPage);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#d4a017]" />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0a192f] mb-2">Pagina nu a fost găsită</h1>
          <p className="text-[#5a6a7a]">Această pagină de vânzări nu există sau nu este publicată.</p>
        </div>
      </div>
    );
  }

  // Clean any AI-generated color values that may contain extra text after the hex code
  const cleanColors = (raw: Record<string, string>): Partial<BrandColors> => {
    const result: Partial<BrandColors> = {};
    for (const [key, val] of Object.entries(raw)) {
      if (typeof val === "string") {
        const match = val.match(/#[0-9a-fA-F]{3,8}/);
        (result as Record<string, string>)[key] = match ? match[0] : val;
      }
    }
    return result;
  };

  let rawColors: Record<string, unknown> = {};
  try {
    rawColors = typeof page.brand_colors === "string"
      ? JSON.parse(page.brand_colors)
      : (page.brand_colors || {});
  } catch {
    rawColors = {};
  }
  const cleaned = cleanColors(rawColors as Record<string, string>);

  // Calculăm luminozitatea unui hex (#rrggbb) — 0 întunecat, 1 deschis
  const luminance = (hex: string): number => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const isDark = (hex: string) => hex.length === 7 && luminance(hex) < 0.35;
  const isLight = (hex: string) => hex.length === 7 && luminance(hex) > 0.65;

  // Fundal pagină trebuie să fie deschis — altfel text devine invizibil
  const bodyBg = cleaned.body_bg && isLight(cleaned.body_bg) ? cleaned.body_bg : DEFAULT_COLORS.body_bg;
  const sectionAltBg = cleaned.section_alt_bg && isLight(cleaned.section_alt_bg) ? cleaned.section_alt_bg : DEFAULT_COLORS.section_alt_bg;

  // Text trebuie să fie întunecat pe fundal deschis
  const textPrimary = cleaned.text_primary && isDark(cleaned.text_primary) ? cleaned.text_primary : DEFAULT_COLORS.text_primary;
  const textMuted = cleaned.text_muted && isDark(cleaned.text_muted) ? cleaned.text_muted : DEFAULT_COLORS.text_muted;

  // Accent text — alb pe accent întunecat, negru pe accent deschis
  const accentColor = cleaned.accent || DEFAULT_COLORS.accent;
  const accentText = isDark(accentColor) ? "#ffffff" : "#1a1a1a";

  const colors: BrandColors = {
    ...DEFAULT_COLORS,
    ...cleaned,
    body_bg: bodyBg,
    section_alt_bg: sectionAltBg,
    text_primary: textPrimary,
    text_muted: textMuted,
    accent: accentColor,
    accent_text: accentText,
  };
  const ctaHref = buildCtaHref(page.cta_type, page.cta_url);
  const ctaLabel = page.cta_label || "Înscrie-te acum";
  const courseTitle = page.courses?.title || "";
  const isExternal = page.cta_type !== "whatsapp";
  const fontClass = getFontClass(page.font_style);
  const googleFontUrl = getGoogleFontUrl(page.font_style);
  const fontFamily = getFontFamily(page.font_style);

  const heroStyle: React.CSSProperties = page.course_image_url
    ? {
        backgroundImage: `linear-gradient(135deg, ${colors.primary}ee 0%, ${colors.primary_light}dd 100%), url(${page.course_image_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary_light} 100%)`,
      };

  return (
    <>
      


        {googleFontUrl && <link rel="stylesheet" href={googleFontUrl} />}
      

      <div
        className={`min-h-screen ${googleFontUrl ? "" : fontClass}`}
        style={{
          backgroundColor: colors.body_bg,
          color: colors.text_primary,
          ...(fontFamily ? { fontFamily } : {}),
        }}
      >

        {/* ── HERO ── */}
        <section style={heroStyle} className="relative px-4 py-28 text-center overflow-hidden">
          {/* subtle texture overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

          <div className="max-w-3xl mx-auto relative z-10">
            {courseTitle && (
              <p className="text-sm font-semibold uppercase tracking-[0.2em] mb-5" style={{ color: colors.accent }}>
                {courseTitle}
              </p>
            )}
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] mb-6"
              style={{ color: "#ffffff", textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
            >
              {page.headline}
            </h1>
            {page.subheadline && (
              <p
                className="text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto"
                style={{ color: "rgba(255,255,255,0.88)" }}
              >
                {page.subheadline}
              </p>
            )}

            <div className="flex flex-col items-center gap-4">
              {page.price_text && (
                <div
                  className="rounded-2xl px-8 py-4 border"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" }}
                >
                  <p className="text-3xl font-bold" style={{ color: colors.accent }}>{page.price_text}</p>
                </div>
              )}
              {page.cta_url && (
                <a
                  href={ctaHref}
                  target={isExternal ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="inline-block font-bold text-lg px-12 py-5 rounded-xl transition-all shadow-xl hover:scale-105 hover:shadow-2xl"
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.accent_text,
                  }}
                >
                  {ctaLabel}
                </a>
              )}
              {page.price_text && (
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Plată securizată • Acces imediat
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── BODY — textul generat de AI ── */}
        {page.body_html && (
          <section style={{ backgroundColor: colors.body_bg }} className="py-16 px-4">
            <div className="max-w-3xl mx-auto">
              <style>{`
                .sp-body {
                  ${fontFamily ? `font-family: ${fontFamily};` : ""}
                }
                .sp-body h1, .sp-body h2, .sp-body h3, .sp-body h4 {
                  color: ${colors.primary};
                  font-weight: 700;
                  margin-top: 2.5rem;
                  margin-bottom: 1rem;
                  line-height: 1.3;
                  ${fontFamily ? `font-family: ${fontFamily};` : ""}
                }
                .sp-body h2 { font-size: 1.65rem; border-left: 4px solid ${colors.accent}; padding-left: 1rem; }
                .sp-body h3 { font-size: 1.3rem; }
                .sp-body p {
                  color: ${colors.text_primary};
                  line-height: 1.85;
                  margin-bottom: 1.25rem;
                  font-size: 1.05rem;
                }
                .sp-body strong { color: ${colors.primary}; font-weight: 700; }
                .sp-body ul, .sp-body ol {
                  margin: 1.25rem 0 1.5rem 0;
                  padding-left: 1.5rem;
                }
                .sp-body li {
                  color: ${colors.text_primary};
                  line-height: 1.75;
                  margin-bottom: 0.6rem;
                  font-size: 1.05rem;
                }
                .sp-body ul li::marker { color: ${colors.accent}; font-size: 1.2em; }
                .sp-body blockquote {
                  border-left: 4px solid ${colors.accent};
                  margin: 2rem 0;
                  padding: 1rem 1.5rem;
                  background: ${colors.section_alt_bg};
                  border-radius: 0 12px 12px 0;
                  font-style: italic;
                  color: ${colors.text_muted};
                }
                .sp-body hr {
                  border: none;
                  border-top: 2px solid ${colors.section_alt_bg};
                  margin: 3rem 0;
                }
              `}</style>
              <div
                className="sp-body"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.body_html, { USE_PROFILES: { html: true } }) }}
              />
            </div>
          </section>
        )}

        {/* ── INSTRUCTOR ── */}
        {(page.creator_name || page.creator_avatar_url) && (
          <section
            className="px-4 py-16 border-t"
            style={{ backgroundColor: colors.section_alt_bg, borderColor: `${colors.primary}15` }}
          >
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {page.creator_avatar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={page.creator_avatar_url}
                  alt={page.creator_name || "Instructor"}
                  className="w-24 h-24 rounded-full object-cover shrink-0 shadow-lg"
                  style={{ border: `3px solid ${colors.accent}` }}
                />
              )}
              <div className="text-center sm:text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: colors.accent }}>
                  Instructorul tău
                </p>
                <h3 className="text-xl font-bold mb-2" style={{ color: colors.primary }}>
                  {page.creator_name}
                </h3>
              </div>
            </div>
          </section>
        )}

        {/* ── TESTIMONIALE REALE ── */}
        {page.testimonials && page.testimonials.length > 0 && (
          <section className="px-4 py-16" style={{ backgroundColor: colors.section_alt_bg }}>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-10" style={{ color: colors.primary }}>
                Ce spun cursanții
              </h2>
              <div className={
                page.testimonials.length === 1
                  ? "flex justify-center"
                  : page.testimonials.length === 2
                  ? "grid md:grid-cols-2 gap-6"
                  : "grid md:grid-cols-3 gap-6"
              }>
                {page.testimonials.map((t, i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-6 shadow-sm flex flex-col justify-between"
                    style={{
                      backgroundColor: colors.body_bg,
                      borderLeft: `4px solid ${colors.accent}`,
                      maxWidth: page.testimonials!.length === 1 ? "480px" : undefined,
                      width: "100%",
                    }}
                  >
                    <p className="text-base leading-relaxed mb-4 italic" style={{ color: colors.text_primary }}>
                      "{t.text}"
                    </p>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: colors.primary }}>{t.name}</p>
                      {t.role && <p className="text-xs mt-0.5" style={{ color: colors.text_muted }}>{t.role}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── BOTTOM CTA ── */}
        {page.cta_url && (
          <section
            className="px-4 py-24 text-center"
            style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary_light} 100%)` }}
          >
            <div className="max-w-xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#ffffff" }}>
                Ești gata să începi?
              </h2>
              <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.75)" }}>
                Fă primul pas spre schimbare astăzi.
              </p>
              {page.price_text && (
                <p className="text-2xl font-bold mb-6" style={{ color: colors.accent }}>
                  {page.price_text}
                </p>
              )}
              <a
                href={ctaHref}
                target={isExternal ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="inline-block font-bold text-lg px-12 py-5 rounded-xl transition-all hover:scale-105 shadow-xl"
                style={{ backgroundColor: colors.accent, color: colors.accent_text }}
              >
                {ctaLabel}
              </a>
            </div>
          </section>
        )}

        <footer
          className="text-center py-6 text-xs border-t"
          style={{ color: colors.text_muted, borderColor: `${colors.primary}15`, backgroundColor: colors.body_bg }}
        >
          Pagină creată cu{" "}
          <a href="https://www.docourse.ro" className="hover:underline" style={{ color: colors.primary }}>
            DoCourse
          </a>
        </footer>
      </div>
    </>
  );
}
