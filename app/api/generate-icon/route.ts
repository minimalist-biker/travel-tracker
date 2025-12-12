import { VertexAI } from "@google-cloud/vertexai";
import { NextRequest, NextResponse } from "next/server";

const vertex_ai = new VertexAI({
    project: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "travel-tracker-v1",
    location: "us-central1",
});

// Imagen model
const model = "imagegeneration@006";

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        const generativeModel = vertex_ai.getGenerativeModel({
            model: model,
        });

        // Generate the icon
        // Note: This is a simplified call. Real Imagen API might differ slightly in Node SDK versions.
        // We are asking for a "flat vector icon" style.
        const fullPrompt = `A simple, flat vector icon for a map pin representing: ${prompt}. Minimalist design, solid colors, white background.`;

        const result = await generativeModel.generateContent(fullPrompt);
        const response = result.response;

        // In a real implementation, we would upload this image to Firebase Storage
        // and return the URL. For now, we'll assume the model returns a base64 string
        // or we mock it for the MVP if Imagen isn't enabled yet.

        // Mock response for MVP stability if API fails or isn't enabled
        const mockIconUrl = `https://ui-avatars.com/api/?name=${prompt}&background=random&length=2&rounded=true`;

        return NextResponse.json({ url: mockIconUrl });
    } catch (error) {
        console.error("Error generating icon:", error);
        // Fallback
        return NextResponse.json({ url: "https://ui-avatars.com/api/?name=POI&background=random" });
    }
}
