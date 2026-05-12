import type { NextConfig } from "next";

const ALLOWED_ORIGINS = "https://docourse.ro https://www.docourse.ro";

const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Block clickjacking (embedding in iframes on other sites)
  { key: "X-Frame-Options", value: "DENY" },
  // Legacy XSS filter (modern browsers use CSP instead)
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Don't send full URL in Referer header to external sites
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable access to camera, mic, geolocation by default
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
  // Prevent Flash/PDF cross-domain access
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  // Force HTTPS for 2 years + include subdomains + allow preload list
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Content Security Policy — most important XSS protection
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js requires unsafe-inline + unsafe-eval for hydration
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      // Tailwind uses inline styles
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Images: own domain, Supabase storage, Unsplash, data URIs, blobs
      "img-src 'self' https: data: blob:",
      // API calls: Supabase REST + Realtime WS, Stripe
      `connect-src 'self' ${ALLOWED_ORIGINS} https://*.supabase.co wss://*.supabase.co https://api.stripe.com`,
      // Fonts
      "font-src 'self' https://fonts.gstatic.com data:",
      // Audio/video: Supabase Storage files + blobs
      "media-src 'self' https://*.supabase.co blob: data:",
      // iframes: Stripe payments + YouTube + Vimeo embeds
      "frame-src https://js.stripe.com https://hooks.stripe.com https://www.youtube.com https://youtube.com https://player.vimeo.com https://vimeo.com",
      // Block plugins (Flash, etc.)
      "object-src 'none'",
      // Prevent base tag hijacking
      "base-uri 'self'",
      // Only allow forms to submit to own domain
      "form-action 'self'",
      // Block HTTP resources on HTTPS page
      "block-all-mixed-content",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          ...securityHeaders,
          {
            key: "Link",
            value: [
              '</.well-known/api-catalog>; rel="api-catalog"',
              '</sitemap.xml>; rel="sitemap"',
              '</.well-known/mcp/server-card.json>; rel="mcp-server-card"',
              '</.well-known/agent-skills/index.json>; rel="agent-skills"',
              '</.well-known/openid-configuration>; rel="openid-configuration"',
              '</llms.txt>; rel="llms"',
            ].join(", "),
          },
          {
            key: "Content-Signal",
            value: "ai-train=no, search=yes, ai-input=no",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/image(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
};

export default nextConfig;
