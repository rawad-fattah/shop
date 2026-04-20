/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

import PurchasesList from "@/components/PurchasesList";
import PurchaseForm from "@/components/forms/PurchaseForm";
import { type Product, type Purchase } from "@/types/inventory";

export default function PurchasesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [deletingPurchaseId, setDeletingPurchaseId] = useState<string | null>(null);

  async function loadProducts() {
    const response = await fetch("/api/products");
    const data = await response.json();
    setProducts(response.ok && Array.isArray(data) ? data : []);
  }

  async function loadPurchases(date: string) {
    const response = await fetch(`/api/purchases?date=${encodeURIComponent(date)}`);
    const data = await response.json();
    setPurchases(response.ok && Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  useEffect(() => {
    void loadPurchases(selectedDate);
  }, [selectedDate]);

  async function deletePurchase(purchaseId: string) {
    const shouldDelete = window.confirm("هل تريد حذف عملية الشراء هذه؟");
    if (!shouldDelete) {
      return;
    }

    setDeletingPurchaseId(purchaseId);

    try {
      const response = await fetch(`/api/purchases/${purchaseId}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "فشل حذف عملية الشراء");
      }

      await Promise.all([loadProducts(), loadPurchases(selectedDate)]);
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "فشل حذف عملية الشراء";
      window.alert(message);
    } finally {
      setDeletingPurchaseId(null);
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-black text-slate-900">المشتريات</h1>
        <p className="text-slate-600 mt-1">تسجيل المشتريات وزيادة المخزون تلقائيًا.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <label
          htmlFor="purchases-filter-date"
          className="block text-sm font-semibold text-slate-700"
        >
          عرض المشتريات حسب التاريخ
        </label>
        <input
          id="purchases-filter-date"
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          className="mt-2 rounded-xl border border-slate-300 px-3 py-2"
        />
      </div>

      <PurchaseForm
        products={products}
        onSuccess={() => {
          void Promise.all([loadProducts(), loadPurchases(selectedDate)]);
        }}
      />

      <PurchasesList
        purchases={purchases}
        onDeletePurchase={deletePurchase}
        deletingPurchaseId={deletingPurchaseId}
      />
    </section>
  );
}
