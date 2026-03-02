// src/app/page.tsx
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Image src="/forge-logo.svg" alt="The Forge" width={44} height={44} />
          <div>
            <span className="text-xl font-bold text-white">The Forge</span>
            <span className="block text-xs text-slate-400 leading-none">Where Perfect Prose Begins</span>
          </div>
        </div>
        <nav className="flex gap-3">
          <Link
            href="/login"
            className="px-5 py-2 text-slate-300 hover:text-white font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
            style={{ boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-32 max-w-5xl mx-auto">
        <div className="mb-6">
          <Image src="/forge-logo.svg" alt="The Forge" width={100} height={100} className="mx-auto" />
        </div>

        <h1 className="text-6xl font-black text-white mb-4 leading-tight">
          The <span style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Forge</span>
        </h1>
        <p className="text-2xl font-semibold text-slate-300 mb-6">Where Perfect Prose Begins</p>
        <p className="text-lg text-slate-400 max-w-2xl mb-12 leading-relaxed">
          The AI coaching platform built on an unwavering principle:{" "}
          <strong className="text-white">AI assists, never replaces.</strong>{" "}
          Get real-time prose guidance, structural feedback, and style coaching —
          while every word remains entirely yours.
        </p>

        <div className="flex gap-4 flex-wrap justify-center mb-20">
          <Link
            href="/register"
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl transition-all"
            style={{ boxShadow: "0 0 30px rgba(59,130,246,0.4)" }}
          >
            Start Writing Free
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-semibold text-lg rounded-xl transition-all"
          >
            Sign In
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {[
            {
              icon: "✦",
              title: "Prose Coaching",
              desc: "Highlight any passage and receive craft observations on rhythm, pacing, and word economy — never rewrites."
            },
            {
              icon: "⊕",
              title: "Style Profiles",
              desc: "Define your POV, tense, and voice for each project. The Forge flags inconsistencies so you stay true to your style."
            },
            {
              icon: "◈",
              title: "Temperature Check",
              desc: "Statistical analysis of sentence length, passive voice, dialogue ratio, and lexical diversity — without judgment."
            },
            {
              icon: "⬡",
              title: "Version History",
              desc: "Every save creates a snapshot. Roll back to any point in your manuscript's history with one click."
            },
            {
              icon: "⟳",
              title: "Google Drive Sync",
              desc: "Your manuscripts sync automatically to your Google Drive after every save. Your work, always backed up."
            },
            {
              icon: "⧉",
              title: "Refinery Ready",
              desc: "Send your manuscript to The Refinery for deep evaluation. Results appear directly in your coaching panel."
            },
          ].map((f) => (
            <div key={f.title} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-700/50 transition-colors">
              <div className="text-3xl text-blue-400 mb-3">{f.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Tiers */}
      <section className="relative z-10 py-20 px-6 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center text-white mb-12">Choose Your Tier</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Free", price: "$0", features: ["2 projects", "50 AI coaching calls/day", "10 version snapshots", "Google Drive sync", ".txt export"], cta: "Get Started", highlight: false },
              { name: "Pro", price: "$19/mo", features: ["Unlimited projects", "Unlimited AI coaching", "30 version snapshots", "Google Drive sync", ".docx, .txt, .pdf export", "Refinery integration"], cta: "Start Pro", highlight: true },
              { name: "Studio", price: "$49/mo", features: ["Everything in Pro", "90 version snapshots", "Analytics dashboard", "Priority support", "All export formats"], cta: "Go Studio", highlight: false },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl border p-8 flex flex-col ${
                  tier.highlight
                    ? "border-blue-500 bg-blue-950/40"
                    : "border-slate-700 bg-slate-800/30"
                }`}
                style={tier.highlight ? { boxShadow: "0 0 40px rgba(59,130,246,0.2)" } : {}}
              >
                {tier.highlight && (
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Most Popular</span>
                )}
                <h3 className="text-2xl font-black text-white mb-1">{tier.name}</h3>
                <p className="text-3xl font-bold text-blue-400 mb-6">{tier.price}</p>
                <ul className="space-y-2 flex-1 mb-8">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-green-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`w-full py-2.5 rounded-lg font-semibold text-center transition-all ${
                    tier.highlight
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 text-center text-slate-500 text-sm border-t border-slate-800">
        <p>© 2026 The Auditor's Forge. All rights reserved. Part of the Master Prose Platform.</p>
      </footer>
    </div>
  );
}
