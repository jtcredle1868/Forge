// src/app/layout.tsx
import type { Metadata } from "next";
import { TRPCReactProvider } from "@/trpc/react";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "The Forge — Where Perfect Prose Begins",
  description: "AI-powered writing coaching and manuscript management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Playfair+Display:wght@600&family=IBM+Plex+Serif:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <TRPCReactProvider>
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
