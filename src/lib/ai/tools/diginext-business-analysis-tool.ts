import { tool, generateText } from "ai";
import { z } from "zod";
import { getDiginextSnapshot } from "@/db/queries/diginext";
import { openai } from "@ai-sdk/openai";

export const diginextBusinessAnalysisTool = tool({
  description:
    "تحلیل جامع بیزینسی از داده‌های فروش، فاکتورها، مشتریان و محصولات Diginext. خروجی را به فارسی و عملیاتی ارائه بده.",
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
      "تو یک مشاور ارشد رشد و داده‌محور برای فروشگاه‌های کالامحور هستی. با نگاهی عملیاتی، واضح و بدون حاشیه، بینش‌های قابل اقدام بده. از اغراق پرهیز کن و مبتنی بر داده صحبت کن.";
    const systemEn =
      "You are a senior, data-driven growth consultant for retail/ecommerce. Provide actionable, pragmatic insights grounded in the provided data. Avoid fluff.";

    const promptFa = `
این تصویر لحظه‌ای از فروشگاه است (store, products, customers, invoices). با توجه به آن:

- یک تحلیل مدیریتی کوتاه اما عمیق ارائه بده.
- به فرصت‌های فصلی، ترکیب سبد خرید (Cross-sell/Bundle)، مشتریان کلیدی (80/20)، محصولات پرفروش اما کم‌حاشیه سود، چرخه وصول و وضعیت نقدینگی اشاره کن.
- برای هر مورد، «اقدام پیشنهادی» مشخص و قابل اجرا بده (همراه با بازه زمانی/اولویت).
- اگر داده ناکافی است، شفاف بگو چه داده‌ای لازم است.
${focus ? `- تمرکز ویژه: ${focus}` : ""}

نمونه‌ی لحن و خروجی مورد انتظار:
• «تابستان فصل طلایی فروش کولرهای شماست؛ اگر امسال تبلیغات را دو ماه زودتر شروع کنید، فروشتان ۳۰٪ بیشتر می‌شود.»
• «این محصول با وجود فروش بالا، سود کمی دارد؛ مشتری جذب می‌کند اما سود اصلی را نمی‌آورد.»
• «۸۰٪ سود شما از ۲۰٪ مشتریان خاص می‌آید؛ مراقب ریزش‌شان باشید.»
• «چرا محصول X را با Y بسته‌بندی نمی‌کنید؟ خریداران X اغلب Y هم می‌خواهند.»

داده:
${JSON.stringify(snapshot, null, 2)}
`;

    const promptEn = `
Here is a shop snapshot (store, products, customers, invoices).
Provide concise, deeply insightful, and actionable business analysis covering:
- Seasonal opportunities, cross-sell/bundling, 80/20 customer concentration, high-volume low-margin items, payment/collection cycle.
- For each point include a concrete recommended action with priority/timeframe.
- If data is insufficient, state what else is needed.
${focus ? `- Extra focus: ${focus}` : ""}

Data:
${JSON.stringify(snapshot, null, 2)}
`;

    const { text } = await generateText({
      model: openai("gpt-5-mini"),
      system: language === "fa" ? systemFa : systemEn,
      prompt: language === "fa" ? promptFa : promptEn,
    });

    return { analysis: text };
  },
});
