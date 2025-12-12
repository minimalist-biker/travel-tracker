"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export function PoiForm() {
    const { user } = useAuth();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("other");
    const [customCategory, setCustomCategory] = useState("");
    const [iconUrl, setIconUrl] = useState("");
    const [generatingIcon, setGeneratingIcon] = useState(false);

    const handleGenerateIcon = async () => {
        if (!customCategory) return;
        setGeneratingIcon(true);
        try {
            const res = await fetch("/api/generate-icon", {
                method: "POST",
                body: JSON.stringify({ prompt: customCategory }),
            });
            const data = await res.json();
            setIconUrl(data.url);
        } catch (e) {
            console.error(e);
        } finally {
            setGeneratingIcon(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            await addDoc(collection(db, "posts"), {
                authorId: user.uid,
                type: "location_log",
                content: description,
                location: { latitude: 19.1738, longitude: -96.1342, name }, // Mock location for demo
                poiData: {
                    name,
                    category: category === "other" ? customCategory : category,
                    iconUrl,
                },
                timestamp: serverTimestamp(),
            });
            alert("POI Saved!");
            setName("");
            setDescription("");
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Card className="w-full max-w-lg mx-auto mt-6">
            <CardHeader>
                <CardTitle>Add New Location (POI)</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input placeholder="Location Name" value={name} onChange={e => setName(e.target.value)} required />
                    <Textarea placeholder="Description / Notes" value={description} onChange={e => setDescription(e.target.value)} />

                    <select
                        className="w-full p-2 border rounded"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                    >
                        <option value="food">Food</option>
                        <option value="history">History</option>
                        <option value="camping">Camping</option>
                        <option value="other">Other (Custom)</option>
                    </select>

                    {category === "other" && (
                        <div className="flex gap-2">
                            <Input
                                placeholder="Custom Category (e.g. Scuba)"
                                value={customCategory}
                                onChange={e => setCustomCategory(e.target.value)}
                            />
                            <Button type="button" onClick={handleGenerateIcon} disabled={generatingIcon}>
                                {generatingIcon ? "🎨..." : "Generate Icon"}
                            </Button>
                        </div>
                    )}

                    {iconUrl && (
                        <div className="flex items-center gap-2">
                            <img src={iconUrl} alt="Generated Icon" className="w-10 h-10 rounded-full border" />
                            <span className="text-sm text-green-600">Icon ready!</span>
                        </div>
                    )}

                    <Button type="submit" className="w-full">Save Location</Button>
                </form>
            </CardContent>
        </Card>
    );
}
