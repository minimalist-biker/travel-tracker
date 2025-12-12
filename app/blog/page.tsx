"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Post } from "@/lib/types/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BlogPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
            const snapshot = await getDocs(q);
            const fetchedPosts = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Post[];
            setPosts(fetchedPosts);
            setLoading(false);
        };

        fetchPosts();
    }, []);

    const sharePost = (post: Post) => {
        const text = `Check out this update from our trip: ${post.content?.slice(0, 50)}...`;
        if (navigator.share) {
            navigator.share({
                title: "Travel Tracker Update",
                text: text,
                url: window.location.href,
            });
        } else {
            alert("Sharing not supported on this device, copy the URL!");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading our journey...</div>;

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <header className="text-center mb-12 mt-8">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Garron and Mel&apos;s Journey</h1>
                <p className="text-slate-600">Follow along on our indefinite van life adventure.</p>
            </header>

            <div className="space-y-8">
                {posts.map((post) => (
                    <Card key={post.id} className="overflow-hidden">
                        {post.mediaUrls?.[0] && (
                            <img
                                src={post.mediaUrls[0]}
                                alt="Trip update"
                                className="w-full h-64 object-cover"
                            />
                        )}
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">
                                    {post.timestamp?.seconds
                                        ? new Date(post.timestamp.seconds * 1000).toLocaleDateString(undefined, { dateStyle: 'long' })
                                        : "Just now"}
                                </span>
                                {post.location && (
                                    <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                                        📍 {post.location.name || `${post.location.latitude.toFixed(2)}, ${post.location.longitude.toFixed(2)}`}
                                    </span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-lg text-slate-800 leading-relaxed">{post.content}</p>

                            <div className="mt-6 flex justify-end">
                                <Button variant="ghost" size="sm" onClick={() => sharePost(post)}>
                                    📤 Share
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
