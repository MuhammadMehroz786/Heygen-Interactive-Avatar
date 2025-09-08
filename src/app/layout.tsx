import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { JotaiProvider } from "@/providers/jotai-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Interactive Avatar Playground",
  description: "A Next.js starter for HeyGen Interactive Streaming Avatar service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <JotaiProvider>
          {children}
        </JotaiProvider>
      </body>
    </html>
  );
}