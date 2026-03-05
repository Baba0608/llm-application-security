import { ChatOpenAI } from "@langchain/openai";
import { createDeepAgent } from "deepagents";

const model = new ChatOpenAI({
  model: "gpt-4.1",
  temperature: 0,
});

const SYSTEM_PROMPT = "You are a helpful and secure assistant.";

export const agent = createDeepAgent({
  model,
  systemPrompt: SYSTEM_PROMPT,
  tools: [],
  subagents: [],
});
