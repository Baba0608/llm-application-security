import { createDeepAgent } from "deepagents";
import { ChatOpenAI } from "@langchain/openai";

const SYSTEM_PROMPT = "You are a helpful assistant.";

const model = new ChatOpenAI({
  model: "gpt-4.1",
  temperature: 0,
});

export const agent = createDeepAgent({
  model,
  systemPrompt: SYSTEM_PROMPT,
  tools: [],
  subagents: [],
});
