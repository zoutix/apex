import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ReactNode } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://apexfuel.com"),
  title: {
    default: "ApexFuel — Premium Fitness & Nutrition Platform",
    template: "%s — ApexFuel",
  },
  description:
    "Track your macros, log workouts, and analyze your progress with Apple-level design and enterprise-grade architecture. The ultimate modern fitness platform.",
  keywords: [
    "fitness",
    "nutrition",
    "workout tracker",
    "macro tracking",
    "calorie counter",
    "health",
    "ApexFuel",
  ],
  authors: [{ name: "ApexFuel Team", url: "https://apexfuel.com" }],
  creator: "ApexFuel",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://apexfuel.com",
    title: "ApexFuel — Premium Fitness & Nutrition Platform",
    description:
      "Track your macros, log workouts, and analyze your progress with Apple-level design and enterprise-grade architecture.",
    siteName: "ApexFuel",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ApexFuel Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ApexFuel — Premium Fitness & Nutrition Platform",
    description:
      "Track your macros, log workouts, and analyze your progress with Apple-level design and enterprise-grade architecture.",
    images: ["/og-image.png"],
    creator: "@apexfuel",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={inter.variable}
    >
      <body className={`${inter.className} antialiased bg-background text-foreground min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
