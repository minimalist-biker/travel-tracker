"use client";

import { BackfillScanner } from "@/components/backfill-scanner";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BackfillPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto p-4 pb-20">
            <h1 className="text-2xl font-bold mb-6">Smart Route Backfill</h1>
            <BackfillScanner />
        </div>
    );
}
