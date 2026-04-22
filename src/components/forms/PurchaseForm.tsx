/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";

import { type Product } from "@/types/inventory";

type PurchaseFormProps = {
  products: Product[];
  onSuccess: () => void;
};

export default function PurchaseForm({ products, onSuccess }: PurchaseFormProps) {
  const [productId, setProductId] = useState(products[0]?._id || "");
  const [quantity, setQuantity] = useState(1);
  const [costPerItem, setCostPerItem] = useState(products[0]?.purchasePrice || 0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProduct = useMemo(
    () => products.find((product) => product._id === productId),
    [productId, products]
  );

  useEffect(() => {
    if (!products.length) {
      setProductId("");
      return;
    }

    if (!products.some((product) => product._id === productId)) {
      setProductId(products[0]._id);
      setCostPerItem(products[0].purchasePrice);
    }
  }, [productId, products]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity, costPerItem, date }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "فشل تسجيل عملية الشراء");
      }

      setQuantity(1);
      onSuccess();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "تعذر تسجيل عملية الشراء"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold text-slate-900">تسجيل شراء</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="purchase-product" className="mb-1 block text-sm font-semibold text-slate-700">
            المنتج
          </label>
          <select
            id="purchase-product"
            value={productId}
            onChange={(event) => {
              const id = event.target.value;
              setProductId(id);
              const product = products.find((item) => item._id === id);
              if (product) {
                setCostPerItem(product.purchasePrice);
              }
            }}
            className="rounded-xl border border-slate-300 px-3 py-2 sm:col-span-2 w-full"
            required
            disabled={!products.length}
          >
            {products.length === 0 && <option value="">لا توجد منتجات متاحة</option>}
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name} ({product.quantity} في المخزون)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="purchase-quantity" className="mb-1 block text-sm font-semibold text-slate-700">
            الكمية
          </label>
          <input
            id="purchase-quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            placeholder="الكمية"
            required
          />
        </div>

        <div>
          <label htmlFor="purchase-cost" className="mb-1 block text-sm font-semibold text-slate-700">
            تكلفة القطعة
          </label>
          <input
            id="purchase-cost"
            type="number"
            min={0}
            step="0.01"
            value={costPerItem}
            onChange={(event) => setCostPerItem(Number(event.target.value))}
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            placeholder="تكلفة القطعة"
            required
          />
        </div>

        <div>
          <label htmlFor="purchase-date" className="mb-1 block text-sm font-semibold text-slate-700">
            التاريخ
          </label>
          <input
            id="purchase-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            required
          />
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          إجمالي التكلفة: ${(quantity * costPerItem).toFixed(2)}
          {selectedProduct && <span className="ml-2">للمنتج {selectedProduct.name}</span>}
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={saving || !productId}
        className="mt-4 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-60"
      >
        {saving ? "جار الحفظ..." : "تسجيل الشراء"}
      </button>
    </form>
  );
}
