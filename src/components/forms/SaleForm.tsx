/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";

import { type Product } from "@/types/inventory";

type SaleFormProps = {
  products: Product[];
  onSuccess: () => void;
};

export default function SaleForm({ products, onSuccess }: SaleFormProps) {
  const [productId, setProductId] = useState(products[0]?._id || "");
  const [quantitySold, setQuantitySold] = useState(1);
  const [sellingPrice, setSellingPrice] = useState(products[0]?.sellingPrice || 0);
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
      setSellingPrice(products[0].sellingPrice);
    }
  }, [productId, products]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantitySold, sellingPrice, date }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "فشل تسجيل عملية البيع");
      }

      setQuantitySold(1);
      onSuccess();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "تعذر تسجيل عملية البيع");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold text-slate-900">تسجيل بيع</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <select
          value={productId}
          onChange={(event) => {
            const id = event.target.value;
            setProductId(id);
            const product = products.find((item) => item._id === id);
            if (product) {
              setSellingPrice(product.sellingPrice);
            }
          }}
          className="rounded-xl border border-slate-300 px-3 py-2 sm:col-span-2"
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

        <input
          type="number"
          min={1}
          max={selectedProduct?.quantity || undefined}
          value={quantitySold}
          onChange={(event) => setQuantitySold(Number(event.target.value))}
          className="rounded-xl border border-slate-300 px-3 py-2"
          placeholder="الكمية المباعة"
          required
        />

        <input
          type="number"
          min={0}
          step="0.01"
          value={sellingPrice}
          onChange={(event) => setSellingPrice(Number(event.target.value))}
          className="rounded-xl border border-slate-300 px-3 py-2"
          placeholder="سعر البيع"
          required
        />

        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2"
          required
        />
      </div>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={saving || !productId}
        className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
      >
        {saving ? "جار الحفظ..." : "تسجيل البيع"}
      </button>
    </form>
  );
}
