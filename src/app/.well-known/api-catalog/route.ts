import { NextResponse } from "next/server";

export async function GET() {
  const catalog = {
    linkset: [
      {
        anchor: "https://docourse.ro",
        "service-doc": [
          { href: "https://docourse.ro/blog", type: "text/html" }
        ],
        describedby: [
          {
            href: "https://docourse.ro/.well-known/mcp/server-card.json",
            type: "application/json"
          }
        ],
        "agent-skills": [
          {
            href: "https://docourse.ro/.well-known/agent-skills/index.json",
            type: "application/json"
          }
        ]
      }
    ]
  };

  return new NextResponse(JSON.stringify(catalog, null, 2), {
    headers: {
      "Content-Type": "application/linkset+json",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
