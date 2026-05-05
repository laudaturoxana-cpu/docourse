import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/admin/",
          "/student/",
          "/student-login",
          "/student-register",
          "/onboarding",
          "/reset-password",
          "/my-memberships",
          "/my-communities",
          "/subscription-required",
          "/capture/*/multumesc",
          "/multumesc-grupa",
          "/multumesc-tutorial",
          "/membership-thank-you",
        ],
      },
    ],
    sitemap: "https://docourse.ro/sitemap.xml",
  };
}
