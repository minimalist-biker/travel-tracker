"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadFile } from "@/lib/storage-utils";
import { extractExifData } from "@/lib/exif-utils";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface Message {
    role: "user" | "model";
    content: string;
}

export function AdvancedCaptureForm() {
    const { user } = useAuth();
    const [step, setStep] = useState<"upload" | "chat" | "review">("upload");
    const [files, setFiles] = useState<File[]>([]);
    const [location, setLocation] = useState<{ lat: number; lng: number; name?: string } | null>(null);
    const [loading, setLoading] = useState(false);

    // Chat State
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatInput, setChatInput] = useState("");

    // Generated Content State
    const [drafts, setDrafts] = useState({
        privateNote: "",
        blogPost: "",
        instagramCaption: "",
        facebookPost: ""
    });

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);
            setFiles(selectedFiles);

            // Extract EXIF from the first file
            const exif = await extractExifData(selectedFiles[0]);
            if (exif.latitude && exif.longitude) {
                setLocation({ lat: exif.latitude, lng: exif.longitude });
                // In a real app, we'd reverse geocode here to get the city name
            }
            setStep("chat");
        }
    };

    const sendChatMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        const newMsg = { role: "user", content: chatInput } as Message;
        setMessages([...messages, newMsg]);
        setChatInput("");

        // Mock chat response for now, or connect to /api/chat
        // For this workflow, we just collect context.
    };

    const generateDrafts = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/generate-content", {
                method: "POST",
                body: JSON.stringify({
                    chatHistory: messages,
                    locationContext: location ? `${location.lat}, ${location.lng}` : "Unknown",
                    photoContext: `${files.length} photos uploaded`,
                }),
            });
            const data = await res.json();
            setDrafts(data);
            setStep("review");
        } catch (e) {
            console.error(e);
            alert("Failed to generate drafts");
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // 1. Upload Photos
            const mediaUrls = await Promise.all(files.map(f =>
                uploadFile(f, `uploads/${user.uid}/${Date.now()}_${f.name}`)
            ));

            // 2. Save to Firestore
            await addDoc(collection(db, "posts"), {
                authorId: user.uid,
                type: "photo",
                content: drafts.blogPost, // Default to blog content for main feed
                privateNote: drafts.privateNote,
                instagramCaption: drafts.instagramCaption,
                facebookPost: drafts.facebookPost,
                mediaUrls,
                location: location ? { latitude: location.lat, longitude: location.lng } : null,
                timestamp: serverTimestamp(),
            });

            alert("Published successfully!");
            // Reset
            setFiles([]);
            setMessages([]);
            setDrafts({ privateNote: "", blogPost: "", instagramCaption: "", facebookPost: "" });
            setStep("upload");
        } catch (e) {
            console.error(e);
            alert("Error publishing");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Step 1: Upload */}
            {step === "upload" && (
                <Card>
                    <CardHeader><CardTitle>1. Select Photos</CardTitle></CardHeader>
                    <CardContent>
                        <div className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:bg-slate-50"
                            onClick={() => document.getElementById('file-input')?.click()}>
                            <p className="text-xl mb-2">📸</p>
                            <p>Click to select photos from your trip</p>
                            <input
                                id="file-input"
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Chat & Context */}
            {step === "chat" && (
                <Card>
                    <CardHeader><CardTitle>2. Tell me about this place</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {files.map((f, i) => (
                                <div key={i} className="w-20 h-20 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden">
                                    <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>

                        {location && (
                            <div className="text-sm text-green-600 flex items-center gap-1">
                                📍 Location found: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                            </div>
                        )}

                        <div className="h-40 bg-slate-50 rounded-lg p-4 overflow-y-auto space-y-2">
                            {messages.map((m, i) => (
                                <div key={i} className={`text-sm ${m.role === 'user' ? 'text-blue-600 text-right' : 'text-slate-600'}`}>
                                    {m.content}
                                </div>
                            ))}
                        </div>

                        <form onSubmit={sendChatMessage} className="flex gap-2">
                            <Input
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                placeholder="e.g. 'We found the best tacos here!'"
                            />
                            <Button type="submit" variant="secondary">Chat</Button>
                        </form>

                        <Button onClick={generateDrafts} className="w-full" disabled={loading}>
                            {loading ? "✨ Generating Drafts..." : "✨ Generate Content"}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Review & Publish */}
            {step === "review" && (
                <div className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>🔒 Private Note</CardTitle></CardHeader>
                        <CardContent>
                            <Textarea
                                value={drafts.privateNote}
                                onChange={e => setDrafts({ ...drafts, privateNote: e.target.value })}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>📝 Blog Post</CardTitle></CardHeader>
                        <CardContent>
                            <Textarea
                                className="h-40"
                                value={drafts.blogPost}
                                onChange={e => setDrafts({ ...drafts, blogPost: e.target.value })}
                            />
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardHeader><CardTitle>📸 Instagram</CardTitle></CardHeader>
                            <CardContent>
                                <Textarea
                                    value={drafts.instagramCaption}
                                    onChange={e => setDrafts({ ...drafts, instagramCaption: e.target.value })}
                                />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>📘 Facebook</CardTitle></CardHeader>
                            <CardContent>
                                <Textarea
                                    value={drafts.facebookPost}
                                    onChange={e => setDrafts({ ...drafts, facebookPost: e.target.value })}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <Button onClick={handlePublish} className="w-full" size="lg" disabled={loading}>
                        {loading ? "Publishing..." : "🚀 Publish All"}
                    </Button>
                </div>
            )}
        </div>
    );
}
