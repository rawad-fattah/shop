/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

import SalesList from "@/components/SalesList";
import SaleForm from "@/components/forms/SaleForm";
import { type Product, type Sale } from "@/types/inventory";

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null);

  async function loadProducts() {
    const response = await fetch("/api/products");
    const data = await response.json();
    setProducts(response.ok && Array.isArray(data) ? data : []);
  }

  async function loadSales(date: string) {
    const response = await fetch(`/api/sales?date=${encodeURIComponent(date)}`);
    const data = await response.json();
    setSales(response.ok && Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  useEffect(() => {
    void loadSales(selectedDate);
  }, [selectedDate]);

  async function deleteSale(saleId: string) {
    const shouldDelete = window.confirm("هل تريد حذف عملية البيع هذه؟");
    if (!shouldDelete) {
      return;
    }

    setDeletingSaleId(saleId);

    try {
      const response = await fetch(`/api/sales/${saleId}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "فشل حذف عملية البيع");
      }

      await Promise.all([loadProducts(), loadSales(selectedDate)]);
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "فشل حذف عملية البيع";
      window.alert(message);
    } finally {
      setDeletingSaleId(null);
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-black text-slate-900">المبيعات</h1>
        <p className="text-slate-600 mt-1">تسجيل المبيعات وتقليل المخزون تلقائيًا.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <label htmlFor="sales-filter-date" className="block text-sm font-semibold text-slate-700">
          عرض المبيعات حسب التاريخ
        </label>
        <input
          id="sales-filter-date"
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          className="mt-2 rounded-xl border border-slate-300 px-3 py-2"
        />
      </div>

      <SaleForm
        products={products}
        onSuccess={() => {
          void Promise.all([loadProducts(), loadSales(selectedDate)]);
        }}
      />

      <SalesList sales={sales} onDeleteSale={deleteSale} deletingSaleId={deletingSaleId} />
    </section>
  );
}
