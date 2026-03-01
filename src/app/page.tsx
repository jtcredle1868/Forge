// src/app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-white mb-4">
          The Forge
        </h1>
        <p className="text-xl text-slate-300 mb-8">
          Where Perfect Prose Begins
        </p>
        <p className="text-lg text-slate-400 mb-12 leading-relaxed">
          AI-powered coaching for writers. Get craft feedback from your personal prose coach,
          manage your manuscripts with precision, and write with confidence.
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/register">Create Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
