"use client";

import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Post } from "@/lib/types/schema";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const MAP_ID = "travel_tracker_map"; // You need to create this in Google Cloud Console

export function TravelMap() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [center, setCenter] = useState({ lat: 19.1738, lng: -96.1342 }); // Default to Veracruz

    useEffect(() => {
        const fetchLocations = async () => {
            // Fetch posts that have a location
            const q = query(collection(db, "posts"), where("location", "!=", null));
            const snapshot = await getDocs(q);
            const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
            setPosts(fetchedPosts);

            // If we have posts, center on the most recent one
            if (fetchedPosts.length > 0 && fetchedPosts[0].location) {
                setCenter({
                    lat: fetchedPosts[0].location.latitude,
                    lng: fetchedPosts[0].location.longitude
                });
            }
        };

        fetchLocations();
    }, []);

    if (!GOOGLE_MAPS_API_KEY) {
        return <div className="p-4 bg-yellow-100 text-yellow-800 rounded">Missing Google Maps API Key</div>;
    }

    return (
        <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg">
            <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <Map
                    defaultCenter={center}
                    defaultZoom={10}
                    mapId={MAP_ID}
                    gestureHandling={'greedy'}
                    disableDefaultUI={false}
                >
                    {posts.map((post) => (
                        post.location && (
                            <AdvancedMarker
                                key={post.id}
                                position={{ lat: post.location.latitude, lng: post.location.longitude }}
                                title={post.content?.slice(0, 20)}
                            >
                                <Pin background={getPinColor(post.type)} borderColor={'#000'} glyphColor={'#fff'} />
                            </AdvancedMarker>
                        )
                    ))}
                </Map>
            </APIProvider>
        </div>
    );
}

function getPinColor(type: string) {
    switch (type) {
        case 'photo': return '#E11D48'; // Red
        case 'note': return '#2563EB'; // Blue
        case 'location_log': return '#16A34A'; // Green
        default: return '#9333EA'; // Purple
    }
}
