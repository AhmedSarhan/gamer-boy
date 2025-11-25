import { Suspense } from "react";
import { RecentlyPlayedClient } from "./recently-played-client";
import { SpinnerFullPage } from "@/shared/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recently Played | GamerBoy",
  description:
    "View your recently played games. Continue where you left off or replay your favorites.",
};

export default function RecentlyPlayedPage() {
  return (
    <Suspense fallback={<SpinnerFullPage label="Loading recently played..." />}>
      <RecentlyPlayedClient />
    </Suspense>
  );
}
