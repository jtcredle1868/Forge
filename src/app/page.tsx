import Link from "next/link";
import {
  Flame, Users, TrendingUp, Zap, Shield,
  ArrowRight, Check, MessageSquare, BarChart2, Globe
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    name: "AI Prose Coach",
    description:
      "\"Would They Say That?\" — instant authenticity scores for character dialogue, with voice guidance that keeps you in control of the prose.",
    color: "#f59e0b",
  },
  {
    icon: Users,
    name: "Character Studio",
    description:
      "Deep character profiles with arc tracking, voice samples, and emotional milestones. See your characters evolve across every scene.",
    color: "#ec4899",
  },
  {
    icon: BarChart2,
    name: "Emotional Arc Visualizer",
    description:
      "Scene-by-scene tension mapping gives you a visual X-ray of your manuscript's pacing — spot flat spots before readers do.",
    color: "#3b82f6",
  },
  {
    icon: Globe,
    name: "World Builder",
    description:
      "Genre-aware tools for romance, thriller, fantasy and more. Track clues, stakes, locations, and lore without losing the thread.",
    color: "#10b981",
  },
  {
    icon: Zap,
    name: "Scene Intelligence",
    description:
      "Rich text editor with live AI coaching. Get craft feedback on your scenes without breaking your flow.",
    color: "#8b5cf6",
  },
  {
    icon: TrendingUp,
    name: "Progress Tracking",
    description:
      "Monitor word counts, AI sessions, and character appearances. Know exactly where your manuscript stands.",
    color: "#f97316",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for exploring The Forge with your first manuscript.",
    features: ["1 project", "50 AI coaching sessions", "Basic character profiles", "Emotional arc viewer"],
    cta: "Start Writing Free",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For serious writers who want unlimited coaching and world-building.",
    features: ["Unlimited projects", "Unlimited AI sessions", "Full world builder", "Character arc tracking", "Priority support"],
    cta: "Start Pro Trial",
    href: "/register",
    highlighted: true,
  },
  {
    name: "Studio",
    price: "$49",
    period: "/month",
    description: "For authors, writing coaches, and small publishers.",
    features: ["Everything in Pro", "Up to 10 seats", "Team collaboration", "Advanced analytics", "Custom AI personas"],
    cta: "Contact Sales",
    href: "/register",
    highlighted: false,
  },
];

export default function HomePage() {
  return (
    <div style={{ background: "#0c0c14", minHeight: "100vh", color: "#f0f0f8" }}>
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-8 py-5 border-b sticky top-0 z-50"
        style={{ background: "rgba(12,12,20,0.92)", borderColor: "#2a2a45", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
          >
            <Flame size={16} style={{ color: "#0c0c14" }} />
          </div>
          <span className="text-sm font-bold tracking-wide" style={{ color: "#f0f0f8" }}>The Forge</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ color: "#9898b8" }}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: "#f59e0b", color: "#0c0c14" }}
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-8 pt-24 pb-20 text-center max-w-4xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
          style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}
        >
          <Flame size={11} />
          AI-Powered Creative Writing Coach
        </div>
        <h1 className="text-5xl font-extrabold leading-tight mb-6" style={{ color: "#f0f0f8", letterSpacing: "-0.03em" }}>
          Where Perfect{" "}
          <span style={{ background: "linear-gradient(90deg, #f59e0b, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Prose
          </span>{" "}
          Begins
        </h1>
        <p className="text-lg leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: "#9898b8" }}>
          The Forge gives fiction writers AI coaching that respects the craft. Get character voice checks,
          emotional arc analysis, and scene feedback — without an AI ever writing your story for you.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/register"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold"
            style={{ background: "#f59e0b", color: "#0c0c14" }}
          >
            Start Writing Free
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold"
            style={{ background: "#1a1a2e", color: "#f0f0f8", border: "1px solid #2a2a45" }}
          >
            Sign In
          </Link>
        </div>
        <p className="mt-5 text-xs" style={{ color: "#5a5a7a" }}>
          No credit card required · Free plan forever
        </p>
      </section>

      {/* Features */}
      <section className="px-8 py-20" style={{ background: "#0d0d1a" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#5a5a7a" }}>Features</p>
            <h2 className="text-3xl font-bold mb-4" style={{ color: "#f0f0f8" }}>
              Everything a serious writer needs
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "#9898b8" }}>
              Built for novelists, not bloggers. Every tool is designed around the needs of long-form fiction.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.name}
                className="rounded-2xl p-6"
                style={{ background: "#13131f", border: "1px solid #2a2a45" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}15` }}
                >
                  <f.icon size={20} style={{ color: f.color }} />
                </div>
                <h3 className="text-sm font-bold mb-2" style={{ color: "#f0f0f8" }}>{f.name}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "#9898b8" }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Callout */}
      <section className="px-8 py-20">
        <div
          className="max-w-4xl mx-auto rounded-3xl p-12 text-center"
          style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(249,115,22,0.05))", border: "1px solid rgba(245,158,11,0.2)" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(245,158,11,0.15)" }}
          >
            <Shield size={28} style={{ color: "#f59e0b" }} />
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: "#f0f0f8" }}>
            Your voice. Your story. Always.
          </h2>
          <p className="text-base leading-relaxed max-w-2xl mx-auto" style={{ color: "#9898b8" }}>
            The Forge never rewrites your prose. Our AI coaches observe, analyze, and ask questions — giving you
            the craft feedback of a professional editor while keeping you the sole author of every word.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-8 py-20" style={{ background: "#0d0d1a" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#5a5a7a" }}>Pricing</p>
            <h2 className="text-3xl font-bold" style={{ color: "#f0f0f8" }}>Simple, honest pricing</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="rounded-2xl p-7 flex flex-col"
                style={{
                  background: plan.highlighted ? "rgba(245,158,11,0.07)" : "#13131f",
                  border: `1px solid ${plan.highlighted ? "rgba(245,158,11,0.4)" : "#2a2a45"}`,
                }}
              >
                {plan.highlighted && (
                  <div
                    className="text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full self-start"
                    style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}
                  >
                    Most Popular
                  </div>
                )}
                <h3 className="text-base font-bold mb-1" style={{ color: "#f0f0f8" }}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-extrabold" style={{ color: "#f0f0f8" }}>{plan.price}</span>
                  <span className="text-sm" style={{ color: "#5a5a7a" }}>{plan.period}</span>
                </div>
                <p className="text-xs mb-6" style={{ color: "#9898b8" }}>{plan.description}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-xs" style={{ color: "#9898b8" }}>
                      <Check size={13} style={{ color: "#10b981", flexShrink: 0 }} />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className="text-center px-5 py-3 rounded-xl text-sm font-semibold"
                  style={{
                    background: plan.highlighted ? "#f59e0b" : "transparent",
                    color: plan.highlighted ? "#0c0c14" : "#9898b8",
                    border: plan.highlighted ? "none" : "1px solid #2a2a45",
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-10 border-t" style={{ borderColor: "#2a2a45" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
            >
              <Flame size={13} style={{ color: "#0c0c14" }} />
            </div>
            <span className="text-sm font-bold" style={{ color: "#f0f0f8" }}>The Forge</span>
          </div>
          <p className="text-xs" style={{ color: "#5a5a7a" }}>
            © {new Date().getFullYear()} The Forge. Where perfect prose begins.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Support"].map((item) => (
              <Link key={item} href="#" className="text-xs" style={{ color: "#5a5a7a" }}>
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
