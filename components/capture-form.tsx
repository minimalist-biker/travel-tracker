"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadFile } from "@/lib/storage-utils";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { PostType } from "@/lib/types/schema";

export function CaptureForm() {
    const { user } = useAuth();
    const [content, setContent] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<PostType>("note");
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

    const handleLocationClick = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            let mediaUrl = "";
            if (file) {
                const path = `uploads/${user.uid}/${Date.now()}_${file.name}`;
                mediaUrl = await uploadFile(file, path);
            }

            await addDoc(collection(db, "posts"), {
                authorId: user.uid,
                type: file ? "photo" : "note",
                content,
                mediaUrls: mediaUrl ? [mediaUrl] : [],
                location: location ? { latitude: location.lat, longitude: location.lng } : null,
                timestamp: serverTimestamp(),
            });

            setContent("");
            setFile(null);
            setLocation(null);
            alert("Entry saved!");
        } catch (error) {
            console.error("Error saving post:", error);
            alert("Failed to save entry.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
                <CardTitle>New Entry</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />

                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                            📷 Photo
                        </Button>
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />

                        <Button type="button" variant="outline" onClick={handleLocationClick}>
                            📍 {location ? "Location Set" : "Add Location"}
                        </Button>
                    </div>

                    {file && <p className="text-sm text-slate-500">Selected: {file.name}</p>}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Saving..." : "Post Entry"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
