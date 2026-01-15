import { useState } from "react";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    type: "contact" | "bien" | "mandat" | "lead" | "document";
    id: string;
    title: string;
  };
}

export function AssistantPanel({ isOpen, onClose, context }: AssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (placeholder)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Je comprends votre demande. Cette fonctionnalité sera bientôt disponible avec l'intégration de l'API ChatGPT.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const quickActions = [
    "Rédiger un message de prospection",
    "Générer une fiche bien",
    "Créer un rappel de relance",
    "Résumer les dernières activités",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-card border-l border-border shadow-xl z-50 flex flex-col animate-slide-in-left">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-border bg-primary/5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <span className="font-semibold">Assistant IA</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Context indicator */}
      {context && (
        <div className="px-4 py-2 bg-muted/50 border-b border-border">
          <div className="text-xs text-muted-foreground">
            Contexte: <span className="font-medium text-foreground">{context.title}</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-3 py-2 text-sm flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>En train de réfléchir...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="px-4 py-2 border-t border-border">
        <div className="text-xs text-muted-foreground mb-2">Actions rapides</div>
        <div className="flex flex-wrap gap-1.5">
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => setInput(action)}
              className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question..."
            className="flex-1 px-3 py-2 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
