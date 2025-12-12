import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

const serviceAccount = require('../service-account-key.json');

console.log("🔍 Testing connection for Project ID:", serviceAccount.project_id);

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function testConnection() {
    try {
        console.log("Attempting to write a test document...");
        await db.collection('test_connection').doc('ping').set({
            timestamp: new Date(),
            message: "Hello from local dev!"
        });
        console.log("✅ Write successful!");

        console.log("Attempting to read it back...");
        const doc = await db.collection('test_connection').doc('ping').get();
        console.log("✅ Read successful:", doc.data());
    } catch (error) {
        console.error("❌ Connection failed:", error);
    }
}

testConnection();
