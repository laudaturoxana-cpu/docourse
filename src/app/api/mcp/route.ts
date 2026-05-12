import { NextResponse } from "next/server";

const TOOLS = [
  {
    name: "get_info",
    description: "Returnează informații despre DoCourse — platforma românească de cursuri online",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_pricing",
    description: "Returnează planurile de prețuri DoCourse",
    inputSchema: { type: "object", properties: {} },
  },
];

const TOOL_RESULTS: Record<string, unknown> = {
  get_info: {
    name: "DoCourse",
    description: "Platforma românească pentru creatori de cursuri online",
    url: "https://docourse.ro",
    features: [
      "Cursuri online cu video, PDF, audio",
      "Comunitate online integrată",
      "Hosting video inclus",
      "Sales page generat cu AI",
      "Email marketing și funneluri",
      "Certificat de absolvire automat",
      "Domeniu propriu (white label)",
    ],
    audience: "Creatori de cursuri din România — coachi, traineri, psihologi, profesori",
  },
  get_pricing: {
    plans: [
      {
        name: "Starter",
        price: "9€/lună",
        features: ["Cursuri online", "Comunitate", "Hosting video", "Certificat", "Acces controlat"],
      },
      {
        name: "Pro",
        price: "19€/lună",
        features: [
          "Tot ce include Starter",
          "Sales page generat cu AI (Gemini)",
          "Buton de plată Stripe",
          "Email marketing nelimitat",
          "Funneluri de vânzare",
          "Pagini de captură",
        ],
      },
    ],
  },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { method, params } = body;

    if (method === "initialize") {
      return NextResponse.json({
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "DoCourse", version: "1.0.0" },
      });
    }

    if (method === "tools/list") {
      return NextResponse.json({ tools: TOOLS });
    }

    if (method === "tools/call") {
      const toolName = params?.name as string;
      const result = TOOL_RESULTS[toolName];
      if (!result) {
        return NextResponse.json({ error: "Tool not found" }, { status: 404 });
      }
      return NextResponse.json({
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      });
    }

    return NextResponse.json({ error: "Unknown method" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: "DoCourse MCP Server",
    version: "1.0.0",
    tools: TOOLS.map((t) => t.name),
  });
}
