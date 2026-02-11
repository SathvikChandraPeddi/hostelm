import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HostelM - Find Your Perfect Hostel",
  description: "Discover and book hostels near your college or university. The easiest way to find student accommodation.",
  keywords: ["hostel", "student accommodation", "college hostel", "university housing", "student housing"],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "HostelM - Find Your Perfect Hostel",
    description: "Discover and book hostels near your college or university.",
    type: "website",
    locale: "en_IN",
    siteName: "HostelM",
  },
  twitter: {
    card: "summary_large_image",
    title: "HostelM - Find Your Perfect Hostel",
    description: "Discover and book hostels near your college or university.",
  },
};

export const viewport: Viewport = {
  themeColor: "#8B5CF6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
