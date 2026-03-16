"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame, Eye, EyeOff, ArrowRight, Check } from "lucide-react";

const perks = [
  "Character voice authenticity checker",
  "Emotional arc visualizer",
  "Genre-aware world builder",
  "AI scene coaching (no rewrites)",
];

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json() as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Registration failed. Please try again.");
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
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#5a5a7a" }}>
            What you&rsquo;ll get
          </p>
          <ul className="space-y-3 mb-10">
            {perks.map((perk) => (
              <li key={perk} className="flex items-start gap-3 text-sm" style={{ color: "#9898b8" }}>
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(245,158,11,0.15)" }}
                >
                  <Check size={11} style={{ color: "#f59e0b" }} />
                </div>
                {perk}
              </li>
            ))}
          </ul>

          <div
            className="rounded-2xl p-5"
            style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: "#f59e0b" }}>Free forever</p>
            <p className="text-xs leading-relaxed" style={{ color: "#9898b8" }}>
              Your free account never expires. Upgrade when you&rsquo;re ready to unlock unlimited projects and AI sessions.
            </p>
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
            Start writing better
          </h1>
          <p className="text-sm mb-8" style={{ color: "#9898b8" }}>
            Create your free account — no credit card required
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#9898b8" }}>
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Austen"
                required
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                style={{ background: "#1a1a2e", border: "1px solid #2a2a45", color: "#f0f0f8" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#f59e0b")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a45")}
              />
            </div>

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
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#9898b8" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
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
              {loading ? "Creating account…" : <><span>Create Free Account</span><ArrowRight size={15} /></>}
            </button>

            <p className="text-xs text-center" style={{ color: "#5a5a7a" }}>
              By creating an account you agree to our{" "}
              <Link href="#" style={{ color: "#9898b8" }}>Terms</Link>{" "}
              and{" "}
              <Link href="#" style={{ color: "#9898b8" }}>Privacy Policy</Link>.
            </p>
          </form>

          <p className="mt-8 text-center text-sm" style={{ color: "#9898b8" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "#f59e0b" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
