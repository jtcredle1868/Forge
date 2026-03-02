"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const GENRES = [
  "Literary Fiction",
  "Genre Fiction",
  "Thriller / Mystery",
  "Science Fiction",
  "Fantasy",
  "Romance",
  "Horror",
  "Memoir",
  "Creative Non-Fiction",
  "Other",
];

const WRITING_GOALS = [
  "Improve sentence variety",
  "Strengthen pacing",
  "Reduce passive voice",
  "Enhance dialogue",
  "Better show-don't-tell",
  "Tighten word economy",
  "General craft improvement",
  "Develop a distinct voice",
];

const INTENSITY_OPTIONS = [
  {
    value: "LIGHT_TOUCH",
    label: "Light Touch",
    description: "1-2 brief observations. Affirming, high-level guidance. Best when you just want a quick check.",
    icon: "◦",
  },
  {
    value: "STANDARD",
    label: "Standard",
    description: "2-4 balanced observations. Mixes affirmation with focused craft notes. The default for most sessions.",
    icon: "◉",
  },
  {
    value: "DEEP_DIVE",
    label: "Deep Dive",
    description: "Thorough analysis across all focus areas. Specific patterns and their effects on reader experience.",
    icon: "◈",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [genre, setGenre] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [intensity, setIntensity] = useState("STANDARD");
  const [loading, setLoading] = useState(false);

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genre, writingGoals: goals.join(", "), feedbackIntensity: intensity }),
      });
    } catch {
      // Non-blocking — proceed even if this fails
    }
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Image src="/forge-logo.svg" alt="The Forge" width={56} height={56} className="mx-auto mb-3" />
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-12 rounded-full transition-all ${
                  s <= step ? "bg-blue-500" : "bg-slate-700"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-slate-500">Step {step} of 4</p>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700 p-10 text-center">
            <div className="text-5xl mb-4">✦</div>
            <h2 className="text-3xl font-black text-white mb-4">Welcome to The Forge</h2>
            <p className="text-slate-300 text-lg mb-6 leading-relaxed">
              The Forge is your personal prose coach. It observes your writing, asks craft questions, and helps you see your work with fresh eyes.
            </p>
            <div className="bg-blue-950/40 border border-blue-800/50 rounded-xl p-5 mb-8 text-left">
              <p className="text-blue-200 font-semibold mb-2">Our core promise:</p>
              <p className="text-blue-300 text-sm leading-relaxed">
                <strong className="text-white">AI assists, never replaces. The human always writes.</strong>{" "}
                The Forge will never rewrite your prose, complete your sentences, or generate story content. Every word in your manuscript is yours.
              </p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl transition-all"
              style={{ boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}
            >
              Let's begin →
            </button>
          </div>
        )}

        {/* Step 2: Genre */}
        {step === 2 && (
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
            <h2 className="text-2xl font-black text-white mb-2">What do you write?</h2>
            <p className="text-slate-400 mb-6">This helps The Forge calibrate its coaching lens to your genre's conventions.</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => setGenre(g)}
                  className={`p-3 rounded-lg border text-sm font-medium text-left transition-all ${
                    genre === g
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-2.5 border border-slate-600 text-slate-300 rounded-lg hover:border-slate-500">
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!genre}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-lg transition-all"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Writing Goals */}
        {step === 3 && (
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
            <h2 className="text-2xl font-black text-white mb-2">What are your writing goals?</h2>
            <p className="text-slate-400 mb-6">Select all that apply. The Forge will focus its observations on these areas.</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {WRITING_GOALS.map((goal) => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`p-3 rounded-lg border text-sm font-medium text-left transition-all ${
                    goals.includes(goal)
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white"
                  }`}
                >
                  {goals.includes(goal) && <span className="mr-1">✓</span>}
                  {goal}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-2.5 border border-slate-600 text-slate-300 rounded-lg hover:border-slate-500">
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Feedback Intensity */}
        {step === 4 && (
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
            <h2 className="text-2xl font-black text-white mb-2">How deep should the feedback go?</h2>
            <p className="text-slate-400 mb-6">You can change this anytime in your project settings.</p>
            <div className="space-y-4 mb-8">
              {INTENSITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setIntensity(opt.value)}
                  className={`w-full p-5 rounded-xl border text-left transition-all ${
                    intensity === opt.value
                      ? "bg-blue-600/20 border-blue-500 text-white"
                      : "border-slate-600 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xl">{opt.icon}</span>
                    <span className="font-bold text-white">{opt.label}</span>
                    {intensity === opt.value && <span className="ml-auto text-blue-400">✓</span>}
                  </div>
                  <p className="text-sm text-slate-400 pl-8">{opt.description}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="flex-1 py-2.5 border border-slate-600 text-slate-300 rounded-lg hover:border-slate-500">
                ← Back
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg transition-all"
                style={{ boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}
              >
                {loading ? "Setting up..." : "Enter The Forge →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
