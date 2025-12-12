"use client";

import { AdvancedCaptureForm } from "@/components/advanced-capture-form";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CapturePage() {
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
            <h1 className="text-2xl font-bold mb-6">New Entry</h1>
            <AdvancedCaptureForm />
        </div>
    );
}
