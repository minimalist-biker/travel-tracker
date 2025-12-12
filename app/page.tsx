"use client";

import { Feed } from "@/components/feed";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const { user, loading, logout } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4 pb-20">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Travel Tracker</h1>
        {user ? (
          <Button variant="ghost" onClick={logout}>Logout</Button>
        ) : (
          <Link href="/login"><Button>Login</Button></Link>
        )}
      </header>

      <main>
        <Feed />
      </main>

      {user && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-4">
          <Link href="/research">
            <Button size="lg" className="rounded-full h-14 w-14 shadow-lg text-2xl bg-indigo-600 hover:bg-indigo-700">
              🧠
            </Button>
          </Link>
          <Link href="/map">
            <Button size="lg" className="rounded-full h-14 w-14 shadow-lg text-2xl bg-emerald-600 hover:bg-emerald-700">
              🗺️
            </Button>
          </Link>
          <Link href="/backfill">
            <Button size="lg" className="rounded-full h-14 w-14 shadow-lg text-2xl bg-orange-500 hover:bg-orange-600">
              🕰️
            </Button>
          </Link>
          <Link href="/capture">
            <Button size="lg" className="rounded-full h-14 w-14 shadow-lg text-2xl">
              +
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
