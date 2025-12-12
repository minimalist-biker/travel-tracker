"use client";

import { APIProvider, Map, AdvancedMarker, Pin, useMap, InfoWindow } from "@vis.gl/react-google-maps";
import { useEffect, useState, useRef } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Post } from "@/lib/types/schema";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const MAP_ID = "travel_tracker_map"; // You need to create this in Google Cloud Console

export function TravelMap() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [center, setCenter] = useState({ lat: 19.1738, lng: -96.1342 }); // Default to Veracruz
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    // Ref for the map instance
    const mapRef = useMap();
    const clustererRef = useRef<MarkerClusterer | null>(null);
    const [markers, setMarkers] = useState<{ [key: string]: google.maps.marker.AdvancedMarkerElement }>({});

    useEffect(() => {
        const fetchLocations = async () => {
            const q = query(collection(db, "posts"), where("location", "!=", null));
            const snapshot = await getDocs(q);
            const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
            setPosts(fetchedPosts);

            if (fetchedPosts.length > 0 && fetchedPosts[0].location) {
                setCenter({
                    lat: fetchedPosts[0].location.latitude,
                    lng: fetchedPosts[0].location.longitude
                });
            }
        };

        fetchLocations();
    }, []);

    // Initialize Clusterer
    useEffect(() => {
        if (!mapRef) return;
        if (!clustererRef.current) {
            clustererRef.current = new MarkerClusterer({ map: mapRef });
        }
    }, [mapRef]);

    // Update Clusterer markers
    useEffect(() => {
        clustererRef.current?.clearMarkers();
        clustererRef.current?.addMarkers(Object.values(markers));
    }, [markers]);

    const setMarkerRef = (marker: google.maps.marker.AdvancedMarkerElement | null, key: string) => {
        if (marker && markers[key]) return;
        if (!marker && !markers[key]) return;

        setMarkers(prev => {
            if (marker) {
                return { ...prev, [key]: marker };
            } else {
                const newMarkers = { ...prev };
                delete newMarkers[key];
                return newMarkers;
            }
        });
    };

    if (!GOOGLE_MAPS_API_KEY) {
        return <div className="p-4 bg-yellow-100 text-yellow-800 rounded">Missing Google Maps API Key</div>;
    }

    return (
        <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg relative">
            <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <Map
                    defaultCenter={center}
                    defaultZoom={4} // Zoomed out to show clustering
                    mapId={MAP_ID}
                    gestureHandling={'greedy'}
                    disableDefaultUI={false}
                    className="w-full h-full"
                >
                    {posts.map((post) => (
                        post.location && (
                            <AdvancedMarker
                                key={post.id}
                                position={{ lat: post.location.latitude, lng: post.location.longitude }}
                                title={post.content?.slice(0, 20)}
                                ref={(marker) => setMarkerRef(marker, post.id)}
                                onClick={() => setSelectedPost(post)}
                            >
                                <Pin background={getPinColor(post.type)} borderColor={'#000'} glyphColor={'#fff'} />
                            </AdvancedMarker>
                        )
                    ))}

                    {selectedPost && selectedPost.location && (
                        <InfoWindow
                            position={{ lat: selectedPost.location.latitude, lng: selectedPost.location.longitude }}
                            onCloseClick={() => setSelectedPost(null)}
                            pixelOffset={[0, -30]}
                        >
                            <div className="max-w-xs">
                                {selectedPost.mediaUrls && selectedPost.mediaUrls.length > 0 && (
                                    <img
                                        src={selectedPost.mediaUrls[0]}
                                        alt="Trip photo"
                                        className="w-full h-32 object-cover rounded-t-lg mb-2"
                                    />
                                )}
                                <div className="p-1">
                                    <h3 className="font-bold text-sm mb-1">{selectedPost.location.name}</h3>
                                    <p className="text-xs text-gray-600 line-clamp-3">{selectedPost.content}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        {selectedPost.timestamp?.seconds ? new Date(selectedPost.timestamp.seconds * 1000).toLocaleDateString() : ''}
                                    </p>
                                </div>
                            </div>
                        </InfoWindow>
                    )}
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
