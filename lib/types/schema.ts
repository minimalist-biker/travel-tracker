import { Timestamp } from "firebase/firestore";

export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string;
    createdAt: Timestamp;
}

export interface Trip {
    id: string;
    ownerId: string;
    title: string;
    startDate: Timestamp;
    endDate?: Timestamp;
    status: "active" | "completed" | "planned";
    collaborators: string[]; // list of uids
}

export type PostType = "note" | "photo" | "video" | "location_log";

export interface Post {
    id: string;
    tripId: string;
    authorId: string;
    type: PostType;
    content: string; // text content or caption
    mediaUrls?: string[]; // list of storage URLs
    location?: {
        latitude: number;
        longitude: number;
        name?: string;
    };
    timestamp: Timestamp;
    tags?: string[];
}

export interface LocationPOI {
    id: string;
    name: string;
    description: string;
    category: "food" | "history" | "fishing" | "hiking" | "camping" | "boondock" | "other";
    customCategory?: string; // if category is 'other'
    coordinates: {
        latitude: number;
        longitude: number;
    };
    amenities?: string[];
    cost?: string;
    rating?: number;
    authorId: string;
    images?: string[];
    createdAt: Timestamp;
}
