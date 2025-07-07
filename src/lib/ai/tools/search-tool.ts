import { generateText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { searchSchema } from "@/lib/validations/search";

export const searchTool = tool({
  description: "Search ",
  parameters: searchSchema,
  execute: async () => {
    try {
      const { text, sources } = await generateText({
        model: openai.responses("gpt-4o-mini"),
        prompt: "What happened in San Francisco last week?",
        tools: {
          web_search_preview: openai.tools.webSearchPreview({}),
        },
      });
      console.log("queryqueryquery", text, sources);

      return {
        text: text,
        sources: sources,
      };
    } catch (error) {
      console.error("Video Search API error:", error);
      return null;
    }
  },
});
