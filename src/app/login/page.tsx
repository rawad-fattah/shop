"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function getSafeRedirectPath(path: string | null) {
  if (!path || !path.startsWith("/")) {
    return "/";
  }

  if (path.startsWith("//")) {
    return "/";
  }

  return path;
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function readResponseMessage(response: Response) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await response.json();
      return typeof data?.message === "string" ? data.message : null;
    }

    const raw = await response.text();

    if (raw.trim().startsWith("<")) {
      return "الخادم أعاد صفحة HTML بدلا من JSON. تحقق من إعدادات نشر Netlify ومسار /api/auth/login.";
    }

    return raw.slice(0, 200) || null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const message = await readResponseMessage(response);

      if (!response.ok) {
        throw new Error(message || "بيانات الدخول غير صحيحة");
      }

      const nextPath = getSafeRedirectPath(searchParams.get("next"));
      router.replace(nextPath);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900">تسجيل الدخول</h1>
        <p className="mt-1 text-sm text-slate-600">استخدم اسم المستخدم وكلمة المرور للوصول إلى النظام.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <div>
            <label htmlFor="username" className="text-sm font-semibold text-slate-700">
              اسم المستخدم
            </label>
            <input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-semibold text-slate-700">
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "جار تسجيل الدخول..." : "دخول"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<section className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8" />}
    >
      <LoginPageContent />
    </Suspense>
  );
}
