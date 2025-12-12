import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

const serviceAccount = require('../service-account-key.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

const MOCK_TRIP = [
    {
        location: { name: "Quebec City, QC", latitude: 46.8139, longitude: -71.2080 },
        content: "Starting our journey! The architecture here is amazing.",
        date: "2025-10-01T10:00:00Z",
        type: "photo"
    },
    {
        location: { name: "Acadia National Park, ME", latitude: 44.3386, longitude: -68.2733 },
        content: "First night in the van. It's getting cold but the stars are incredible.",
        date: "2025-10-05T18:30:00Z",
        type: "photo"
    },
    {
        location: { name: "Blue Ridge Parkway, VA", latitude: 37.7690, longitude: -79.0474 },
        content: "Driving through the clouds today. The fall colors are peaking.",
        date: "2025-10-15T14:15:00Z",
        type: "photo"
    },
    {
        location: { name: "New Orleans, LA", latitude: 29.9511, longitude: -90.0715 },
        content: "Beignets and Jazz. We might stay here a few extra days.",
        date: "2025-10-25T09:00:00Z",
        type: "photo"
    },
    {
        location: { name: "Austin, TX", latitude: 30.2672, longitude: -97.7431 },
        content: "Tacos for breakfast, lunch, and dinner.",
        date: "2025-11-01T12:00:00Z",
        type: "photo"
    },
    {
        location: { name: "Veracruz, Mexico", latitude: 19.1738, longitude: -96.1342 },
        content: "We made it to Mexico! The ocean breeze is perfect.",
        date: "2025-11-10T16:45:00Z",
        type: "photo"
    }
];

async function seed() {
    console.log("🌱 Seeding database...");
    const collectionRef = db.collection('posts');

    for (const post of MOCK_TRIP) {
        await collectionRef.add({
            authorId: "seed-user",
            content: post.content,
            location: post.location,
            timestamp: Timestamp.fromDate(new Date(post.date)),
            type: post.type,
            mediaUrls: [`https://picsum.photos/seed/${post.location.name.replace(/[^a-zA-Z0-9]/g, '')}/800/600`] // Random working image
        });
        console.log(`Added: ${post.location.name}`);
    }
    console.log("✅ Seeding complete!");
}

seed().catch(console.error);
