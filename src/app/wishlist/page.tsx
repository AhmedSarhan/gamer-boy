import { Suspense } from "react";
import { WishlistClient } from "./wishlist-client";
import { SpinnerFullPage } from "@/shared/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist | GamerBoy",
  description:
    "View and manage your favorite games. Keep track of games you want to play.",
};

export default function WishlistPage() {
  return (
    <Suspense fallback={<SpinnerFullPage label="Loading favorites..." />}>
      <WishlistClient />
    </Suspense>
  );
}
