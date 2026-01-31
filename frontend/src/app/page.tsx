import { Suspense } from "react";
import Link from "next/link";
import { HomeWelcome } from "@/components/features/home/home-welcome";
import { HomeLoading } from "@/components/features/home/home-loading";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <Suspense fallback={<HomeLoading />}>
          <HomeWelcome />
        </Suspense>
      </div>
    </main>
  );
}
