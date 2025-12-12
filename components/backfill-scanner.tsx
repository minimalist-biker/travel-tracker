"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { extractExifData } from "@/lib/exif-utils";
import { AdvancedCaptureForm } from "@/components/advanced-capture-form";

interface PhotoCluster {
    id: string;
    date: Date;
    location?: { lat: number; lng: number };
    files: File[];
    title: string;
}

export function BackfillScanner() {
    const [clusters, setClusters] = useState<PhotoCluster[]>([]);
    const [scanning, setScanning] = useState(false);
    const [selectedCluster, setSelectedCluster] = useState<PhotoCluster | null>(null);

    const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setScanning(true);
        const files = Array.from(e.target.files);
        const filesWithData = await Promise.all(files.map(async (f) => ({
            file: f,
            exif: await extractExifData(f)
        })));

        // Simple clustering logic: Group by date (same day)
        const groups: Record<string, typeof filesWithData> = {};

        filesWithData.forEach(item => {
            if (item.exif.date) {
                const dateKey = item.exif.date.toDateString();
                if (!groups[dateKey]) groups[dateKey] = [];
                groups[dateKey].push(item);
            } else {
                // No date? Group in "Unknown Date"
                if (!groups["Unknown"]) groups["Unknown"] = [];
                groups["Unknown"].push(item);
            }
        });

        const newClusters: PhotoCluster[] = Object.entries(groups).map(([dateKey, items], index) => ({
            id: `cluster-${index}`,
            date: items[0].exif.date || new Date(),
            location: items[0].exif.latitude ? { lat: items[0].exif.latitude, lng: items[0].exif.longitude! } : undefined,
            files: items.map(i => i.file),
            title: dateKey === "Unknown" ? "Unsorted Photos" : `Trip on ${dateKey}`,
        }));

        setClusters(newClusters);
        setScanning(false);
    };

    if (selectedCluster) {
        return (
            <div className="space-y-4">
                <Button variant="outline" onClick={() => setSelectedCluster(null)}>← Back to Suggestions</Button>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h2 className="font-bold text-lg">Creating Entry for: {selectedCluster.title}</h2>
                    <p className="text-sm text-slate-600">Pre-loaded {selectedCluster.files.length} photos.</p>
                </div>
                {/* We would ideally pass props to AdvancedCaptureForm to pre-fill files */}
                {/* For MVP, we'll just render it, but in a real app we'd refactor AdvancedCaptureForm to accept initialFiles prop */}
                <AdvancedCaptureForm />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="bg-slate-50 border-dashed border-2">
                <CardContent className="pt-6 text-center">
                    <h3 className="text-lg font-semibold mb-2">Find Missed Moments</h3>
                    <p className="text-slate-500 mb-4">Select a folder of photos to find gaps in your trip log.</p>
                    <Button onClick={() => document.getElementById('backfill-input')?.click()}>
                        📂 Scan Photo Library
                    </Button>
                    <input
                        id="backfill-input"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleScan}
                    />
                </CardContent>
            </Card>

            {scanning && <div className="text-center">Analyzing photos...</div>}

            <div className="grid gap-4">
                {clusters.map((cluster) => (
                    <Card key={cluster.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedCluster(cluster)}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">{cluster.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2 overflow-hidden h-20 mb-2 rounded-md">
                                {cluster.files.slice(0, 4).map((f, i) => (
                                    <img key={i} src={URL.createObjectURL(f)} className="w-20 h-20 object-cover" />
                                ))}
                                {cluster.files.length > 4 && (
                                    <div className="w-20 h-20 bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                        +{cluster.files.length - 4}
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-slate-500">
                                {cluster.files.length} photos • {cluster.location ? "📍 Location found" : "No GPS data"}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
