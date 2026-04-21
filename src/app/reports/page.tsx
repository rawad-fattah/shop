/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

import ReportsPanel from "@/components/ReportsPanel";
import { type MonthlyReportResponse } from "@/types/inventory";

export default function ReportsPage() {
  const [report, setReport] = useState<MonthlyReportResponse | null>(null);
  const [selectedStart, setSelectedStart] = useState("");
  const [selectedEnd, setSelectedEnd] = useState("");

  const exportParams = new URLSearchParams();
  if (selectedStart) {
    exportParams.set("start", selectedStart);
  }
  if (selectedEnd) {
    exportParams.set("end", selectedEnd);
  }
  const exportHref = `/api/reports/export${exportParams.toString() ? `?${exportParams.toString()}` : ""}`;

  function normalizeReportResponse(data: unknown): MonthlyReportResponse {
    const payload = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;

    const bestSellingProducts = Array.isArray(payload.bestSellingProducts)
      ? payload.bestSellingProducts
          .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
          .map((item) => ({
            productId: typeof item.productId === "string" ? item.productId : "unknown",
            name: typeof item.name === "string" ? item.name : "منتج غير معروف",
            quantity:
              typeof item.quantity === "number" && Number.isFinite(item.quantity)
                ? item.quantity
                : 0,
            revenue:
              typeof item.revenue === "number" && Number.isFinite(item.revenue)
                ? item.revenue
                : 0,
          }))
      : [];

    return {
      start: typeof payload.start === "string" ? payload.start : "",
      end: typeof payload.end === "string" ? payload.end : "",
      totalRevenue:
        typeof payload.totalRevenue === "number" && Number.isFinite(payload.totalRevenue)
          ? payload.totalRevenue
          : 0,
      totalProfit:
        typeof payload.totalProfit === "number" && Number.isFinite(payload.totalProfit)
          ? payload.totalProfit
          : 0,
      totalSalesRecords:
        typeof payload.totalSalesRecords === "number" && Number.isFinite(payload.totalSalesRecords)
          ? payload.totalSalesRecords
          : 0,
      bestSellingProducts,
    };
  }

  async function loadReport(start?: string, end?: string) {
    const params = new URLSearchParams();
    if (start) {
      params.set("start", start);
    }
    if (end) {
      params.set("end", end);
    }

    const response = await fetch(`/api/reports/monthly?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      setReport(normalizeReportResponse({}));
      return;
    }

    setReport(normalizeReportResponse(data));
  }

  useEffect(() => {
    void loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-slate-900">التقارير</h1>
          <p className="text-slate-600 mt-1">الإيرادات والأرباح وأفضل المنتجات مبيعًا شهريًا.</p>
        </div>

        <a
          href={exportHref}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          تصدير CSV
        </a>
      </div>

      <ReportsPanel
        report={report}
        onFilter={(start, end) => {
          setSelectedStart(start);
          setSelectedEnd(end);
          void loadReport(start, end);
        }}
      />
    </section>
  );
}
