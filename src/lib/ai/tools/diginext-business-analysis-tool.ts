import { tool, generateText } from "ai";
import { z } from "zod";
import { getDiginextSnapshot } from "@/db/queries/diginext";
import { openai } from "@ai-sdk/openai";

export const diginextBusinessAnalysisTool = tool({
  description:
    "تحلیل کوتاه و سریع بیزینسی از داده‌های فروش Diginext. خروجی مختصر و عملیاتی ارائه بده.",
  inputSchema: z.object({
    focus: z
      .string()
      .optional()
      .describe(
        "تمرکز دلخواه تحلیل مثل: فصل پیک، سودآوری، ریزش مشتری، بسته‌بندی مکمل، کمپین‌ها"
      ),
    language: z.enum(["fa", "en"]).default("fa").describe("زبان خروجی تحلیل"),
  }),
  execute: async ({ focus, language }) => {
    const snapshot = await getDiginextSnapshot();

    const systemFa =
      "مشاور داده‌محور فروشگاه. تحلیل کوتاه و عملیاتی ارائه بده.";
    const systemEn =
      "Data-driven retail consultant. Provide concise, actionable analysis.";

    const promptFa = `
تحلیل کوتاه فروشگاه (حداکثر ۵ نکته کلیدی):
- فرصت‌های اصلی و اقدامات پیشنهادی
- مشتریان/محصولات کلیدی
- ریسک‌ها و بهبودها
${focus ? `تمرکز: ${focus}` : ""}

داده: ${JSON.stringify(snapshot, null, 2)}
`;

    const promptEn = `
Brief shop analysis (max 5 key points):
- Main opportunities & actions
- Key customers/products  
- Risks & improvements
${focus ? `Focus: ${focus}` : ""}

Data: ${JSON.stringify(snapshot, null, 2)}
`;

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: language === "fa" ? systemFa : systemEn,
      prompt: language === "fa" ? promptFa : promptEn,
      temperature: 0.3,
    });

    return { analysis: text };
  },
});
