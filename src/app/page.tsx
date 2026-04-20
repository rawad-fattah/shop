/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

import SalesList from "@/components/SalesList";
import StatCard from "@/components/StatCard";
import { type DailyDashboardResponse, type Product } from "@/types/inventory";

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [dashboard, setDashboard] = useState<DailyDashboardResponse>({
    totalSales: 0,
    totalProfit: 0,
    itemsSold: 0,
    sales: [],
  });
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  function normalizeDashboardResponse(data: unknown): DailyDashboardResponse {
    const payload = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;

    return {
      totalSales:
        typeof payload.totalSales === "number" && Number.isFinite(payload.totalSales)
          ? payload.totalSales
          : 0,
      totalProfit:
        typeof payload.totalProfit === "number" && Number.isFinite(payload.totalProfit)
          ? payload.totalProfit
          : 0,
      itemsSold:
        typeof payload.itemsSold === "number" && Number.isFinite(payload.itemsSold)
          ? payload.itemsSold
          : 0,
      sales: Array.isArray(payload.sales) ? payload.sales : [],
    };
  }

  async function loadDashboard(date: string) {
    const response = await fetch(`/api/dashboard/daily?date=${encodeURIComponent(date)}`);
    const data = await response.json();
    if (!response.ok) {
      setDashboard({ totalSales: 0, totalProfit: 0, itemsSold: 0, sales: [] });
      return;
    }

    setDashboard(normalizeDashboardResponse(data));
  }

  async function loadLowStock() {
    const response = await fetch("/api/products?lowStock=true");
    const data = await response.json();
    setLowStockProducts(response.ok && Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    void Promise.all([loadDashboard(selectedDate), loadLowStock()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-black text-slate-900">لوحة التحكم اليومية</h1>
        <p className="mt-1 text-slate-600">أداء المبيعات وتنبيهات المخزون حسب اليوم المختار.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <label htmlFor="dashboard-date" className="block text-sm font-semibold text-slate-700">
          اختر التاريخ
        </label>
        <input
          id="dashboard-date"
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          className="mt-2 rounded-xl border border-slate-300 px-3 py-2"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="إجمالي المبيعات" value={`$${dashboard.totalSales.toFixed(2)}`} accent="gold" />
        <StatCard label="إجمالي الربح" value={`$${dashboard.totalProfit.toFixed(2)}`} accent="teal" />
        <StatCard label="عدد القطع المباعة" value={String(dashboard.itemsSold)} accent="rose" />
      </div>

      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
        <h2 className="text-lg font-bold text-rose-900">تنبيهات انخفاض المخزون</h2>
        <ul className="mt-3 space-y-2 text-sm text-rose-800">
          {lowStockProducts.length === 0 && <li>جميع المنتجات أعلى من حد التنبيه.</li>}
          {lowStockProducts.map((product) => (
            <li key={product._id} className="rounded-lg bg-white px-3 py-2">
              {product.name} ({product.category}) - المتبقي {product.quantity}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-3 text-xl font-black text-slate-900">مبيعات يوم {selectedDate}</h2>
        <SalesList sales={dashboard.sales} compact />
      </div>
    </section>
  );
}
