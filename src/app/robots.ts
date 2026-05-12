import type { MetadataRoute } from "next";

const PRIVATE_PATHS = [
  "/dashboard",
  "/admin",
  "/student",
  "/student-login",
  "/student-register",
  "/onboarding",
  "/reset-password",
  "/create-course",
  "/create-membership",
  "/memberships",
  "/my-memberships",
  "/my-communities",
  "/subscription-required",
  "/integrations",
  "/capture",
  "/certificate",
  "/multumesc-grupa",
  "/multumesc-tutorial",
  "/membership-thank-you",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      // AI search bots — allow public content, block private paths
      {
        userAgent: ["GPTBot", "ClaudeBot", "anthropic-ai", "PerplexityBot", "Amazonbot", "Google-Extended"],
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      // AI training bots — block entirely
      {
        userAgent: ["CCBot", "omgilibot", "omgili", "FacebookBot", "Diffbot", "Bytespider", "ImagesiftBot"],
        disallow: ["/"],
      },
    ],
    sitemap: "https://docourse.ro/sitemap.xml",
  };
}
