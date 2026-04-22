/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";

import { type Product } from "@/types/inventory";

type SaleFormProps = {
  products: Product[];
  onSuccess: () => void;
};

type SaleLineInput = {
  lineId: string;
  productId: string;
  quantity: number;
  price: number;
};

function createLine(products: Product[], lineId: string): SaleLineInput {
  const first = products[0];
  return {
    lineId,
    productId: first?._id || "",
    quantity: 1,
    price: first?.sellingPrice || 0,
  };
}

export default function SaleForm({ products, onSuccess }: SaleFormProps) {
  const [nextLineNumber, setNextLineNumber] = useState(2);
  const [lines, setLines] = useState<SaleLineInput[]>(() => [createLine(products, "line-1")]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grandTotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity * line.price, 0),
    [lines]
  );

  useEffect(() => {
    if (!products.length) {
      setLines((current) => (current.length ? current : [createLine([], "line-1")]));
      return;
    }

    setLines((current) => {
      if (current.length === 0) {
        return [createLine(products, "line-1")];
      }

      return current.map((line, index) => {
        const product = products.find((item) => item._id === line.productId);

        if (product) {
          return line;
        }

        const fallback = products[index] || products[0];
        return {
          ...line,
          productId: fallback._id,
          price: fallback.sellingPrice,
        };
      });
    });
  }, [products]);

  function updateLine(lineId: string, updates: Partial<SaleLineInput>) {
    setLines((current) =>
      current.map((line) => (line.lineId === lineId ? { ...line, ...updates } : line))
    );
  }

  function addLine() {
    if (!products.length) {
      return;
    }

    setLines((current) => [...current, createLine(products, `line-${nextLineNumber}`)]);
    setNextLineNumber((current) => current + 1);
  }

  function removeLine(lineId: string) {
    setLines((current) => (current.length === 1 ? current : current.filter((line) => line.lineId !== lineId)));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payloadItems = lines
        .filter((line) => !!line.productId)
        .map((line) => ({
          productId: line.productId,
          quantity: Number(line.quantity),
          price: Number(line.price),
        }));

      if (!payloadItems.length) {
        throw new Error("أضف منتجًا واحدًا على الأقل");
      }

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payloadItems, date }),
      });
      const data = await response.json();

      if (!response.ok) {
        const reason = [data?.message, data?.details].filter(Boolean).join(": ");
        throw new Error(reason || "فشل تسجيل عملية البيع");
      }

      setLines([createLine(products, "line-1")]);
      setNextLineNumber(2);
      onSuccess();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "تعذر تسجيل عملية البيع");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold text-slate-900">تسجيل فاتورة بيع</h2>

      <div className="mt-4 space-y-3">
        {lines.map((line, index) => {
          const selectedProduct = products.find((product) => product._id === line.productId);

          return (
            <div key={line.lineId} className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-12">
              <div className="sm:col-span-5">
                <label
                  htmlFor={`sale-line-product-${line.lineId}`}
                  className="mb-1 block text-sm font-semibold text-slate-700"
                >
                  المنتج
                </label>
                <select
                  id={`sale-line-product-${line.lineId}`}
                  value={line.productId}
                  onChange={(event) => {
                    const id = event.target.value;
                    const product = products.find((item) => item._id === id);
                    updateLine(line.lineId, {
                      productId: id,
                      price: product?.sellingPrice ?? line.price,
                    });
                  }}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
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

              <div className="sm:col-span-2">
                <label
                  htmlFor={`sale-line-qty-${line.lineId}`}
                  className="mb-1 block text-sm font-semibold text-slate-700"
                >
                  الكمية
                </label>
                <input
                  id={`sale-line-qty-${line.lineId}`}
                  type="number"
                  min={1}
                  max={selectedProduct?.quantity || undefined}
                  value={line.quantity}
                  onChange={(event) => updateLine(line.lineId, { quantity: Number(event.target.value) })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  placeholder="الكمية"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor={`sale-line-price-${line.lineId}`}
                  className="mb-1 block text-sm font-semibold text-slate-700"
                >
                  سعر البيع
                </label>
                <input
                  id={`sale-line-price-${line.lineId}`}
                  type="number"
                  min={0}
                  step="0.01"
                  value={line.price}
                  onChange={(event) => updateLine(line.lineId, { price: Number(event.target.value) })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  placeholder="سعر البيع"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-slate-700">الإجمالي</label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold">
                  ${(line.quantity * line.price).toFixed(2)}
                </div>
              </div>

              <div className="sm:col-span-1">
                <label className="mb-1 block text-sm font-semibold text-slate-700">إجراء</label>
                <button
                  type="button"
                  onClick={() => removeLine(line.lineId)}
                  disabled={lines.length === 1}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold disabled:opacity-60"
                >
                  حذف
                </button>
              </div>

              <p className="text-xs text-slate-500 sm:col-span-12">الصنف {index + 1}</p>
            </div>
          );
        })}

        <div className="flex flex-wrap items-end gap-2">
          <button
            type="button"
            onClick={addLine}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold"
          >
            إضافة صنف آخر
          </button>

          <div>
            <label htmlFor="sale-date" className="mb-1 block text-sm font-semibold text-slate-700">
              تاريخ الفاتورة
            </label>
            <input
              id="sale-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2"
              required
            />
          </div>

          <p className="text-sm font-bold text-slate-800">الإجمالي: ${grandTotal.toFixed(2)}</p>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={saving || !products.length}
        className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
      >
        {saving ? "جار الحفظ..." : "تسجيل الفاتورة"}
      </button>
    </form>
  );
}
