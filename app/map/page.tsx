"use client";

import { TravelMap } from "@/components/travel-map";
import { PoiForm } from "@/components/poi-form";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MapPage() {
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
            <h1 className="text-2xl font-bold mb-6">Trip Map</h1>
            <TravelMap />

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Add a Place</h2>
                <PoiForm />
            </div>
        </div>
    );
}
