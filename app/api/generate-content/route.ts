import { VertexAI } from "@google-cloud/vertexai";
import { NextRequest, NextResponse } from "next/server";

const vertex_ai = new VertexAI({
    project: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "travel-tracker-v1",
    location: "us-central1",
});

const model = "gemini-1.5-pro-preview-0409";

export async function POST(req: NextRequest) {
    try {
        const { chatHistory, locationContext, photoContext } = await req.json();

        const generativeModel = vertex_ai.getGenerativeModel({
            model: model,
            generationConfig: {
                maxOutputTokens: 4096,
                temperature: 0.7,
                responseMimeType: "application/json",
            },
        });

        const prompt = `
      You are a travel writer assistant. 
      Context: The user is at ${locationContext || "unknown location"}.
      Photo Context: ${photoContext || "User uploaded photos"}.
      Chat History: ${JSON.stringify(chatHistory)}

      Task: Generate 4 distinct versions of a travel post based on this context.
      
      Output JSON format:
      {
        "privateNote": "Detailed factual notes, logistics, costs, private thoughts.",
        "blogPost": "Engaging, storytelling style for a travel blog. 3-4 paragraphs.",
        "instagramCaption": "Short, punchy, visual-focused caption with 10 relevant hashtags.",
        "facebookPost": "Friendly, update-style post for friends and family. Balanced tone."
      }
    `;

        const result = await generativeModel.generateContent(prompt);
        const response = result.response;

        if (!response.candidates || !response.candidates[0] || !response.candidates[0].content.parts[0].text) {
            throw new Error("No content generated");
        }

        const text = response.candidates[0].content.parts[0].text;

        // Clean up markdown code blocks if present
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const content = JSON.parse(jsonString);

        return NextResponse.json(content);
    } catch (error) {
        console.error("Error generating content:", error);
        return NextResponse.json(
            { error: "Failed to generate content" },
            { status: 500 }
        );
    }
}
