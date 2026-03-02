import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageCircle, X, Send } from "lucide-react";
import { streamChat } from "../api/client";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());

  const sendMessage = async () => {
    if (!input.trim()) return;

    const conversationId = crypto.randomUUID();

    const newConversation = {
      id: conversationId,
      userMessage: input,
      steps: [],
    };

    setConversations((prev) => [...prev, newConversation]);
    setInput("");

    await streamChat(input, sessionId, (chunk) => {
      try {
        const data = JSON.parse(chunk);

        const toolName =
          data.content?.find((c) => c.type === "tool_call")?.name || null;

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  steps: [
                    ...conv.steps,
                    {
                      id: crypto.randomUUID(),
                      step: data.step,
                      content: data.content || [],
                      toolName,
                    },
                  ],
                }
              : conv
          )
        );
      } catch {
        // ignore partial chunks
      }
    });

    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  /* ---------------- MODEL STEP ---------------- */

  function ModelStep({ event }) {
    const textBlock = event.content?.find((c) => c.type === "text");
    const toolCall = event.content?.find((c) => c.type === "tool_call");

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-xs font-semibold text-blue-600 mb-1">
          🧠 step: model
        </div>

        {toolCall ? (
          <div className="italic text-gray-500">
            thinking… (calling <b>{toolCall.name}</b>)
          </div>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {textBlock?.text || "_thinking…_"}
          </ReactMarkdown>
        )}
      </div>
    );
  }

  /* ---------------- TOOL STEP ---------------- */

  function ToolStep({ event }) {
    const toolOutput = event.content?.find((c) => c.type === "text")?.text;

    return (
      <div className="bg-gray-100 border rounded-lg p-3">
        <div className="text-xs font-semibold text-gray-700 mb-2">
          🛠 step: tools
        </div>

        <details>
          <summary className="cursor-pointer font-medium">
            ▶ {event.toolName || "Tool execution"}
          </summary>

          <pre className="mt-3 text-xs bg-black text-green-400 p-3 rounded overflow-x-auto">
            {toolOutput}
          </pre>
        </details>
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 rounded-full shadow-xl hover:scale-105 transition"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/30 flex items-center justify-center">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col h-[80vh]">

            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="font-semibold text-lg text-blue-600">
                🛍️ AI Shopping Assistant
              </h2>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setConversations([]);
                    setSessionId(crypto.randomUUID());
                  }}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  New Chat
                </button>

                <button onClick={() => setOpen(false)}>
                  <X />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {conversations.map((conv) => (
                <div key={conv.id} className="space-y-3">
                  <div className="bg-blue-600 text-white ml-auto max-w-[80%] rounded-xl px-4 py-2">
                    {conv.userMessage}
                  </div>

                  <div className="bg-gray-50 border rounded-xl p-4 space-y-3">
                    {conv.steps.map((event) => {
                      if (event.step === "model") {
                        return <ModelStep key={event.id} event={event} />;
                      }
                      if (event.step === "tools") {
                        return <ToolStep key={event.id} event={event} />;
                      }
                      return null;
                    })}
                  </div>
                </div>
              ))}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}