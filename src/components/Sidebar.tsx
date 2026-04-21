"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/", label: "لوحة التحكم" },
  { href: "/products", label: "المنتجات" },
  { href: "/purchases", label: "المشتريات" },
  { href: "/sales", label: "المبيعات" },
  { href: "/reports", label: "التقارير" },
  { href: "/account", label: "الحساب" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <aside className="w-full md:w-72 md:min-h-screen bg-slate-950 text-slate-100 px-4 py-6 md:sticky md:top-0">
      <div className="mb-8 px-2">
        <p className="sidebar-shop-kicker">Store</p>
        <h1 className="sidebar-shop-title">Marvella خان الصابون</h1>
      </div>

      <nav className="grid grid-cols-2 gap-2 md:grid-cols-1">
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-amber-300 text-slate-950"
                  : "bg-slate-900 text-slate-200 hover:bg-slate-800"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="mt-6 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-60"
      >
        {isLoggingOut ? "جار تسجيل الخروج..." : "تسجيل الخروج"}
      </button>
    </aside>
  );
}
