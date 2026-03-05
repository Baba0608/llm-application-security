import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import { createUIMessageStreamResponse, UIMessage } from "ai";
import { agent } from "@/lib/deepagent-secure";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Create the LangGraph agent
  const graph = agent;

  // Convert AI SDK UIMessages to LangChain messages
  const langchainMessages = await toBaseMessages(messages);

  // Stream from the graph using LangGraph's streaming format
  const stream = await graph.stream(
    { messages: langchainMessages },
    { streamMode: ["values", "messages"] }
  );

  // Convert the LangGraph stream to UI message stream
  return createUIMessageStreamResponse({
    stream: toUIMessageStream(stream),
  });
}
