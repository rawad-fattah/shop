"use client";

import { useEffect, useState } from "react";

import Invoice from "@/components/Invoice";
import { type Sale } from "@/types/inventory";

type InvoicePageProps = {
  params: Promise<{ id: string }>;
};

export default function InvoicePage({ params }: InvoicePageProps) {
  const [sale, setSale] = useState<Sale | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSale() {
      try {
        const { id } = await params;
        const response = await fetch(`/api/sales/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "فشل تحميل الفاتورة");
        }

        if (mounted) {
          setSale(data as Sale);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : "فشل تحميل الفاتورة");
        }
      }
    }

    void loadSale();

    return () => {
      mounted = false;
    };
  }, [params]);

  return (
    <section className="invoice-print-root mx-auto max-w-3xl space-y-4 py-4">
      <div className="no-print flex justify-end gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          طباعة الفاتورة
        </button>
      </div>

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">{error}</p>}

      {!error && !sale && (
        <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600">
          جار تحميل بيانات الفاتورة...
        </p>
      )}

      {sale && <Invoice sale={sale} />}
    </section>
  );
}
