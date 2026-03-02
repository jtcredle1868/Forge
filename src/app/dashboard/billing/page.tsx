import { getSession } from "@/lib/session";
import { db } from "@/server/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function BillingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [subscription, dailyUsage, monthlyUsage, projectCount] = await Promise.all([
    db.subscription.findUnique({ where: { userId: session.userId } }),
    db.aIInteraction.count({
      where: { userId: session.userId, createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } },
    }),
    db.aIInteraction.count({
      where: { userId: session.userId, createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
    }),
    db.project.count({ where: { userId: session.userId, isArchived: false } }),
  ]);

  const tier = subscription?.tier ?? "FREE";

  const tiers = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: ["2 projects", "50 AI coaching calls/day", "10 version snapshots", "Google Drive sync", ".txt export only"],
      tier: "FREE",
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      features: ["Unlimited projects", "Unlimited AI coaching", "30 version snapshots", "Google Drive sync", ".docx, .txt, .pdf export", "Refinery integration", "Find & Replace", "Focus mode"],
      tier: "PRO",
      highlight: true,
    },
    {
      name: "Studio",
      price: "$49",
      period: "/month",
      features: ["Everything in Pro", "90 version snapshots", "Analytics dashboard", "Priority support", "All export formats", "Custom style profile import/export"],
      tier: "STUDIO",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">Billing</h1>
        <p className="text-slate-400 mt-1">Manage your subscription and view usage</p>
      </div>

      {/* Current Plan */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-5">Current Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-white">{tier.charAt(0) + tier.slice(1).toLowerCase()} Plan</p>
            <p className="text-slate-400 text-sm mt-1">
              {tier === "FREE" && "2 projects · 50 AI calls/day · .txt export"}
              {tier === "PRO" && "Unlimited projects · Unlimited AI · All formats"}
              {tier === "STUDIO" && "Full access · Analytics · Priority support"}
            </p>
            {subscription?.currentPeriodEnd && (
              <p className="text-slate-500 text-xs mt-1">
                Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className={`px-4 py-2 rounded-lg text-sm font-bold ${
            tier === "FREE" ? "bg-slate-700 text-slate-300" :
            tier === "PRO" ? "bg-blue-600 text-white" :
            "bg-purple-600 text-white"
          }`}>
            {tier}
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-5">Usage This Period</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "AI Calls Today", value: dailyUsage, limit: tier === "FREE" ? "50" : "∞" },
            { label: "AI Calls This Month", value: monthlyUsage, limit: tier === "FREE" ? "1,500 est." : "∞" },
            { label: "Active Projects", value: projectCount, limit: tier === "FREE" ? "2" : "∞" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">of {stat.limit}</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
        {tier === "FREE" && dailyUsage >= 40 && (
          <div className="mt-4 p-3 bg-amber-900/30 border border-amber-800/50 rounded-lg text-sm text-amber-300">
            ⚠ You're approaching your daily AI coaching limit. Upgrade to Pro for unlimited coaching.
          </div>
        )}
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-bold text-white mb-5">Available Plans</h2>
        <div className="grid grid-cols-3 gap-5">
          {tiers.map((t) => (
            <div
              key={t.tier}
              className={`rounded-xl border p-6 flex flex-col ${
                t.tier === tier
                  ? "border-blue-500 bg-blue-950/20"
                  : t.highlight
                  ? "border-slate-600 bg-slate-800/30"
                  : "border-slate-700 bg-slate-800/20"
              }`}
            >
              {t.tier === tier && (
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Current Plan</span>
              )}
              {t.highlight && t.tier !== tier && (
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Most Popular</span>
              )}
              <h3 className="text-xl font-black text-white">{t.name}</h3>
              <div className="flex items-baseline gap-0.5 my-2">
                <span className="text-3xl font-black text-white">{t.price}</span>
                <span className="text-slate-400 text-sm">{t.period}</span>
              </div>
              <ul className="space-y-1.5 flex-1 my-4">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="text-green-400 text-xs">✓</span> {f}
                  </li>
                ))}
              </ul>
              {t.tier === tier ? (
                <button className="w-full py-2 rounded-lg bg-slate-700 text-slate-400 text-sm font-medium cursor-default">
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => alert("Stripe checkout would open here. Configure STRIPE_SECRET_KEY to enable.")}
                  className={`w-full py-2 rounded-lg text-sm font-bold transition-all ${
                    t.highlight
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white"
                  }`}
                >
                  {t.tier === "FREE" ? "Downgrade" : "Upgrade"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Manage */}
      {tier !== "FREE" && (
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-3">Manage Subscription</h2>
          <p className="text-slate-400 text-sm mb-4">Access invoices, update payment methods, or cancel your subscription.</p>
          <button
            onClick={() => alert("Stripe billing portal would open here.")}
            className="px-5 py-2 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-medium rounded-lg text-sm transition-all"
          >
            Open Billing Portal →
          </button>
        </div>
      )}
    </div>
  );
}
