import "./globals.css";
import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SoWhat News — News that knows who you are.",
  description:
    "Pick who you are. Tap any headline. Get a personal take and a relevance score from 1–10.",
  openGraph: {
    title: "SoWhat News — News that knows who you are.",
    description:
      "Pick who you are. Tap any headline. Get a personal take and a relevance score from 1–10.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
