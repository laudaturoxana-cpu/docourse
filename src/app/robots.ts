import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
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
        ],
      },
    ],
    sitemap: "https://docourse.ro/sitemap.xml",
  };
}
