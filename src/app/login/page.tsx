"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json() as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Sign in failed. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: "#0c0c14" }}>
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-96 flex-shrink-0 p-10"
        style={{ background: "#13131f", borderRight: "1px solid #2a2a45" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
          >
            <Flame size={18} style={{ color: "#0c0c14" }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "#f0f0f8" }}>The Forge</p>
            <p className="text-xs" style={{ color: "#5a5a7a" }}>Perfect Prose</p>
          </div>
        </div>

        <div>
          <blockquote className="mb-8">
            <p className="text-xl font-semibold leading-relaxed mb-4" style={{ color: "#f0f0f8" }}>
              &ldquo;The Forge has completely changed how I think about character voice. It&rsquo;s like having a developmental editor on call.&rdquo;
            </p>
            <footer className="text-sm" style={{ color: "#9898b8" }}>
              — Sarah K., literary fiction author
            </footer>
          </blockquote>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Writers", value: "12,000+" },
              { label: "AI Sessions", value: "890K+" },
              { label: "Avg Rating", value: "4.9 ★" },
              { label: "Words Coached", value: "2B+" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-4"
                style={{ background: "#1a1a2e", border: "1px solid #2a2a45" }}
              >
                <p className="text-lg font-bold" style={{ color: "#f59e0b" }}>{stat.value}</p>
                <p className="text-xs" style={{ color: "#5a5a7a" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
            >
              <Flame size={18} style={{ color: "#0c0c14" }} />
            </div>
            <span className="text-sm font-bold" style={{ color: "#f0f0f8" }}>The Forge</span>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: "#f0f0f8" }}>
            Welcome back
          </h1>
          <p className="text-sm mb-8" style={{ color: "#9898b8" }}>
            Sign in to continue your story
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#9898b8" }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                style={{ background: "#1a1a2e", border: "1px solid #2a2a45", color: "#f0f0f8" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#f59e0b")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a45")}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold" style={{ color: "#9898b8" }}>Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none pr-11"
                  style={{ background: "#1a1a2e", border: "1px solid #2a2a45", color: "#f0f0f8" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#f59e0b")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a45")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#5a5a7a" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
              style={{ background: loading ? "#b45309" : "#f59e0b", color: "#0c0c14", cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Signing in…" : <><span>Sign In</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm" style={{ color: "#9898b8" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold" style={{ color: "#f59e0b" }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
