"use client";

import { FormEvent, useState } from "react";

export default function ChangeCredentialsForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("كلمة المرور الجديدة وتأكيدها غير متطابقين");
      setSuccess(null);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          newUsername: newUsername.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "فشل تحديث بيانات الدخول");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("تم تحديث بيانات الدخول بنجاح");

      if (typeof data?.username === "string") {
        setNewUsername(data.username);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "فشل تحديث بيانات الدخول");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold text-slate-900">تغيير بيانات الدخول</h2>
      <p className="mt-1 text-sm text-slate-600">قم بتحديث كلمة المرور ويمكنك تغيير اسم المستخدم اختياريًا.</p>

      <div className="mt-4 grid gap-3">
        <div>
          <label htmlFor="new-username" className="text-sm font-semibold text-slate-700">
            اسم مستخدم جديد (اختياري)
          </label>
          <input
            id="new-username"
            value={newUsername}
            onChange={(event) => setNewUsername(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            autoComplete="username"
            placeholder="اتركه فارغًا للإبقاء على الاسم الحالي"
          />
        </div>

        <div>
          <label htmlFor="current-password" className="text-sm font-semibold text-slate-700">
            كلمة المرور الحالية
          </label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            autoComplete="current-password"
            required
          />
        </div>

        <div>
          <label htmlFor="new-password" className="text-sm font-semibold text-slate-700">
            كلمة المرور الجديدة
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="text-sm font-semibold text-slate-700">
            تأكيد كلمة المرور الجديدة
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {loading ? "جار التحديث..." : "تحديث بيانات الدخول"}
      </button>
    </form>
  );
}
