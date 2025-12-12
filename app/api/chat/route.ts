import { VertexAI } from "@google-cloud/vertexai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Vertex AI
const vertex_ai = new VertexAI({
    project: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "travel-tracker-v1",
    location: "us-central1",
});

const model = "gemini-1.5-pro-preview-0409";

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();
        const lastMessage = messages[messages.length - 1].content;

        // Instantiate the model
        const generativeModel = vertex_ai.getGenerativeModel({
            model: model,
            generationConfig: {
                maxOutputTokens: 2048,
                temperature: 0.7,
            },
        });

        // Create a chat session
        const chat = generativeModel.startChat({
            history: messages.slice(0, -1).map((m: any) => ({
                role: m.role === "user" ? "user" : "model",
                parts: [{ text: m.content }],
            })),
        });

        const result = await chat.sendMessage(lastMessage);
        const response = result.response;
        const text = response.candidates[0].content.parts[0].text;

        return NextResponse.json({ content: text });
    } catch (error) {
        console.error("Error generating response:", error);
        return NextResponse.json(
            { error: "Failed to generate response" },
            { status: 500 }
        );
    }
}
