"use client";
import { useEffect } from "react";

export default function WebMCPProvider() {
  useEffect(() => {
    const nav = window.navigator as Navigator & {
      modelContext?: {
        provideContext: (ctx: unknown) => void;
      };
    };
    if (!nav.modelContext) return;

    nav.modelContext.provideContext({
      tools: [
        {
          name: "get_docourse_info",
          description:
            "Obține informații despre DoCourse — platforma românească de cursuri online",
          inputSchema: { type: "object", properties: {} },
          execute: async () => ({
            name: "DoCourse",
            url: "https://docourse.ro",
            description: "Platformă SaaS pentru creatori de cursuri online din România",
            features: [
              "Cursuri video, PDF, audio cu hosting inclus",
              "Comunitate online integrată",
              "Sales page generat cu AI",
              "Email marketing și funneluri de vânzare",
              "Certificat de absolvire automat",
              "Domeniu propriu (white label)",
            ],
            pricing: { starter: "9€/lună", pro: "19€/lună" },
            audience: "Creatori de cursuri din România: coachi, traineri, psihologi, profesori",
          }),
        },
        {
          name: "get_pricing",
          description: "Obține planurile și prețurile DoCourse",
          inputSchema: { type: "object", properties: {} },
          execute: async () => ({
            starter: {
              price: "9€/lună",
              features: ["Cursuri", "Comunitate", "Hosting video", "Certificat"],
            },
            pro: {
              price: "19€/lună",
              features: ["Tot Starter", "Sales page AI", "Stripe", "Email marketing", "Funneluri"],
            },
          }),
        },
      ],
    });
  }, []);

  return null;
}
