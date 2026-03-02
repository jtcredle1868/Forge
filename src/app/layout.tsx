// src/app/layout.tsx
import type { Metadata } from "next";
import { TRPCReactProvider } from "@/trpc/react";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "The Forge — Where Perfect Prose Begins",
  description: "AI-powered writing coaching and manuscript management for authors who refuse to let AI write for them.",
  icons: {
    icon: "/forge-logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased">
        <TRPCReactProvider>
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
