import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SoWhat News",
  description: "Contextual Utility News Engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
