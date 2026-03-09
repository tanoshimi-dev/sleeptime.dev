"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/actions";

interface ProfileFormProps {
  user: {
    name?: string;
    email?: string;
    picture?: string;
    sub?: string;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(user.name || "");
  const [locale, setLocale] = useState("ja");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const result = await updateProfile({ displayName, locale });

      if (result.error) {
        setMessage(`Failed: ${result.error}`);
      } else {
        setMessage("Profile updated successfully.");
      }
    } catch {
      setMessage("An error occurred.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-4">
      <div>
        <label
          htmlFor="displayName"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Display Name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      <div>
        <label
          htmlFor="locale"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Locale
        </label>
        <select
          id="locale"
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <option value="ja">日本語</option>
          <option value="en">English</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {saving ? "Saving..." : "Save"}
      </button>

      {message && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
      )}
    </form>
  );
}
