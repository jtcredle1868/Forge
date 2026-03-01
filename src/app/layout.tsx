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
      <body>
        <TRPCReactProvider>
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
