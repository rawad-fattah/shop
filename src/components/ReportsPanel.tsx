"use client";

import { useState } from "react";

import { type MonthlyReportResponse } from "@/types/inventory";

type ReportsPanelProps = {
  report: MonthlyReportResponse | null;
  onFilter: (start: string, end: string) => void;
};

export default function ReportsPanel({ report, onFilter }: ReportsPanelProps) {
  const [start, setStart] = useState(new Date().toISOString().slice(0, 8) + "01");
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10));

  const safeReport = report
    ? {
        totalRevenue:
          typeof report.totalRevenue === "number" && Number.isFinite(report.totalRevenue)
            ? report.totalRevenue
            : 0,
        totalProfit:
          typeof report.totalProfit === "number" && Number.isFinite(report.totalProfit)
            ? report.totalProfit
            : 0,
        totalSalesRecords:
          typeof report.totalSalesRecords === "number" && Number.isFinite(report.totalSalesRecords)
            ? report.totalSalesRecords
            : 0,
        bestSellingProducts: Array.isArray(report.bestSellingProducts)
          ? report.bestSellingProducts
          : [],
      }
    : null;

  return (
    <div className="space-y-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onFilter(start, end);
        }}
        className="rounded-2xl border border-slate-200 bg-white p-5"
      >
        <h2 className="text-lg font-bold text-slate-900">النطاق الزمني</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            type="date"
            value={start}
            onChange={(event) => setStart(event.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2"
          />
          <input
            type="date"
            value={end}
            onChange={(event) => setEnd(event.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2"
          />
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            تطبيق الفلتر
          </button>
        </div>
      </form>

      {safeReport && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-600">إجمالي الإيرادات</p>
              <p className="mt-1 text-2xl font-black">${safeReport.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-600">إجمالي الأرباح</p>
              <p className="mt-1 text-2xl font-black">${safeReport.totalProfit.toFixed(2)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-600">عدد عمليات البيع</p>
              <p className="mt-1 text-2xl font-black">{safeReport.totalSalesRecords}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-base font-bold">أفضل المنتجات مبيعًا</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {safeReport.bestSellingProducts.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="text-slate-600">
                    {item.quantity} مبيع | ${item.revenue.toFixed(2)}
                  </span>
                </li>
              ))}
              {safeReport.bestSellingProducts.length === 0 && (
                <li className="text-slate-500">لا توجد بيانات ضمن المدة المحددة.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
