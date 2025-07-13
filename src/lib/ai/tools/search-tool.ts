import { generateText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { searchSchema } from "@/lib/validations/search";
import { z } from "zod";

export const searchTool = tool({
  description: "Search",
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const { text, sources, ...queryqueryquery } = await generateText({
        model: openai.responses("gpt-4o-mini"),
        prompt: "What happened in San Francisco last week?",
        tools: {
          web_search_preview: openai.tools.webSearchPreview({}),
        },
      });
      console.log("queryqueryquery", text, sources, queryqueryquery);

      return {
        text: text,
        sources: sources,
      };
    } catch (error) {
      console.error("Search API error:", error);
      return null;
    }
  },
});
