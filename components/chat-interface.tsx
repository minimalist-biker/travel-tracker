"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Message {
    role: "user" | "model";
    content: string;
}

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMessages = [...messages, { role: "user", content: input } as Message];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages }),
            });

            const data = await response.json();
            if (data.content) {
                setMessages([...newMessages, { role: "model", content: data.content }]);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader>
                <CardTitle>Research Assistant (Gemini)</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4" ref={scrollRef}>
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <p className="text-center text-slate-500">
                                Start a Research Project
                            </p>
                            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                                <Button variant="outline" onClick={() => setInput("Tell me about the history of this location")}>
                                    🏰 History
                                </Button>
                                <Button variant="outline" onClick={() => setInput("What are the best local foods to try here?")}>
                                    🌮 Local Food
                                </Button>
                                <Button variant="outline" onClick={() => setInput("What are the top fishing spots nearby?")}>
                                    🎣 Fishing
                                </Button>
                                <Button variant="outline" onClick={() => setInput("Compare this place to Santa Marta")}>
                                    ⚖️ Compare
                                </Button>
                            </div>
                        </div>
                    )}
                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-3 ${m.role === "user"
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-900"
                                    }`}
                            >
                                <p className="whitespace-pre-wrap">{m.content}</p>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-100 rounded-lg p-3">
                                <span className="animate-pulse">Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
                <form onSubmit={sendMessage} className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question..."
                        disabled={loading}
                    />
                    <Button type="submit" disabled={loading}>
                        Send
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
