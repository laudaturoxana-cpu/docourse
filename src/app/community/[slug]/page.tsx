export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import CreatorCommunityPage from "@/views/CreatorCommunityPage";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  return {
    manifest: `/community/${slug}/manifest.json`,
  };
}

export default function Page() { return <CreatorCommunityPage />; }
