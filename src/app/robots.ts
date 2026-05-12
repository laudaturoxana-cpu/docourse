import type { MetadataRoute } from "next";

// robots.txt este servit de middleware (src/middleware.ts) pentru a putea include
// directiva Content-Signal (contentsignals.org spec). Acest fișier există doar
// pentru compatibilitate cu build-ul Next.js.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://docourse.ro/sitemap.xml",
  };
}
