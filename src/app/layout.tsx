import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header, Footer, CategoriesSidebar } from "@/shared/ui";
import { Suspense } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GamerBoy - Play Free Online Games",
  description: "Browse and play free online games from GameDistribution.com",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <Header />
        <div className="flex flex-1">
          {/* Categories Sidebar */}
          <Suspense fallback={null}>
            <CategoriesSidebar />
          </Suspense>

          {/* Main Content */}
          <main className="flex-1 bg-gray-50 dark:bg-black">{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
