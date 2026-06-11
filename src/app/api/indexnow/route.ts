import { NextResponse } from "next/server";

export const runtime = "nodejs";

const INDEXNOW_KEY = "65BAE6956AC6F2846C305A73112D054F";
const HOST = "docourse.ro";

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const expectedToken = process.env.INDEXNOW_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let urls: string[];
  try {
    const body = await request.json();
    urls = Array.isArray(body.urls) ? body.urls : [body.url].filter(Boolean);
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!urls.length) {
    return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });

    return NextResponse.json({ submitted: urls.length, status: res.status });
  } catch (err) {
    console.error("[IndexNow] Submit failed:", err);
    return NextResponse.json({ error: "IndexNow submit failed" }, { status: 500 });
  }
}
