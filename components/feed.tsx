"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Post } from "@/lib/types/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Feed() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newPosts = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Post[];
            setPosts(newPosts);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) return <div>Loading feed...</div>;

    return (
        <div className="space-y-4 max-w-lg mx-auto">
            {posts.map((post) => (
                <Card key={post.id}>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">
                                {post.timestamp?.seconds
                                    ? new Date(post.timestamp.seconds * 1000).toLocaleDateString()
                                    : "Just now"}
                            </span>
                            {post.location && (
                                <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                                    📍 {post.location.latitude.toFixed(4)}, {post.location.longitude.toFixed(4)}
                                </span>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {post.content && <p className="mb-4 whitespace-pre-wrap">{post.content}</p>}
                        {post.mediaUrls?.map((url, index) => (
                            <img
                                key={index}
                                src={url}
                                alt="Post attachment"
                                className="rounded-lg w-full object-cover max-h-96"
                                loading="lazy"
                            />
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
