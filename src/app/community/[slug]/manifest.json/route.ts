import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const manifest = {
    name: "DoCourse — Cursuri Online România",
    short_name: "DoCourse",
    description: "Platformă română pentru creatori de cursuri online",
    start_url: `/community/${slug}`,
    scope: `/community/${slug}`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a192f",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    categories: ["education", "productivity"],
    lang: "ro",
  };

  return NextResponse.json(manifest, {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
