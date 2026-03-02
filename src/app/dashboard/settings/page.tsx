"use client";

import { useState, useEffect } from "react";

interface UserProfile {
  name: string;
  email: string;
  genre: string;
  writingGoals: string;
  feedbackIntensity: string;
  refineryApiKey: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    genre: "",
    writingGoals: "",
    feedbackIntensity: "STANDARD",
    refineryApiKey: "",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setProfile((prev) => ({ ...prev, ...data.user }));
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "preferences", label: "Preferences" },
    { id: "integrations", label: "Integrations" },
    { id: "account", label: "Account" },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-black text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your profile and application preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-white">Profile Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-700/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-2.5 bg-slate-700/30 border border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Primary Genre</label>
            <select
              value={profile.genre}
              onChange={(e) => setProfile({ ...profile, genre: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-700/60 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select genre...</option>
              {["Literary Fiction", "Genre Fiction", "Thriller / Mystery", "Science Fiction", "Fantasy", "Romance", "Horror", "Memoir", "Creative Non-Fiction", "Other"].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Writing Goals</label>
            <textarea
              value={profile.writingGoals}
              onChange={(e) => setProfile({ ...profile, writingGoals: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-700/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              placeholder="Describe your writing goals..."
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg transition-all"
          >
            {saved ? "✓ Saved!" : loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-white">Coaching Preferences</h2>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Default Feedback Intensity</label>
            <div className="space-y-3">
              {[
                { value: "LIGHT_TOUCH", label: "Light Touch", desc: "1-2 brief, affirming observations" },
                { value: "STANDARD", label: "Standard", desc: "2-4 balanced craft notes (recommended)" },
                { value: "DEEP_DIVE", label: "Deep Dive", desc: "Thorough analysis of all focus areas" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="intensity"
                    value={opt.value}
                    checked={profile.feedbackIntensity === opt.value}
                    onChange={() => setProfile({ ...profile, feedbackIntensity: opt.value })}
                    className="mt-1 accent-blue-500"
                  />
                  <div>
                    <p className="text-white font-medium">{opt.label}</p>
                    <p className="text-slate-400 text-sm">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg transition-all"
          >
            {saved ? "✓ Saved!" : loading ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === "integrations" && (
        <div className="space-y-4">
          {/* Refinery */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-400 text-xl">⬡</div>
              <div>
                <h3 className="text-white font-bold">The Refinery</h3>
                <p className="text-slate-400 text-sm">Connect to The Refinery for deep manuscript evaluation. Your Refinery API key enables "Send to Refinery" from any project.</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Refinery API Key</label>
              <input
                type="password"
                value={profile.refineryApiKey}
                onChange={(e) => setProfile({ ...profile, refineryApiKey: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-700/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm"
                placeholder="ref_••••••••••••••••"
              />
              <p className="text-slate-500 text-xs mt-1.5">Get your API key from your Refinery account settings.</p>
            </div>
            <button
              onClick={handleSave}
              disabled={loading}
              className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg transition-all"
            >
              {saved ? "✓ Saved!" : "Save API Key"}
            </button>
          </div>

          {/* Google Drive */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center text-green-400 text-xl">⟳</div>
              <div>
                <h3 className="text-white font-bold">Google Drive</h3>
                <p className="text-slate-400 text-sm">Google Drive sync is configured per-project in your project settings.</p>
                <p className="text-slate-500 text-xs mt-2">Navigate to any project → Project Settings to connect Google Drive for that manuscript.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === "account" && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white">Account Management</h2>

          <div className="border border-slate-700 rounded-lg p-5">
            <h3 className="text-white font-semibold mb-2">Change Password</h3>
            <p className="text-slate-400 text-sm mb-4">Update your account password.</p>
            <div className="space-y-3">
              <input type="password" placeholder="Current password" className="w-full px-4 py-2.5 bg-slate-700/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500" />
              <input type="password" placeholder="New password" className="w-full px-4 py-2.5 bg-slate-700/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500" />
              <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-all">
                Update Password
              </button>
            </div>
          </div>

          <div className="border border-red-900/50 rounded-lg p-5">
            <h3 className="text-red-400 font-semibold mb-2">Danger Zone</h3>
            <p className="text-slate-400 text-sm mb-4">Permanently delete your account and all manuscripts. This action cannot be undone.</p>
            <button className="px-5 py-2 border border-red-800 text-red-400 hover:bg-red-900/20 font-medium rounded-lg text-sm transition-all">
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
