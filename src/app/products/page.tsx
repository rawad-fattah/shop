/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

import ProductForm from "@/components/forms/ProductForm";
import ProductList from "@/components/ProductList";
import { type Product } from "@/types/inventory";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function loadProducts() {
    const params = new URLSearchParams();

    if (search) {
      params.set("search", search);
    }

    if (category) {
      params.set("category", category);
    }

    if (onlyLowStock) {
      params.set("lowStock", "true");
    }

    const response = await fetch(`/api/products?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      setLoadError(data?.message || "فشل تحميل المنتجات");
      setProducts([]);
      return;
    }

    setLoadError(null);
    setProducts(Array.isArray(data) ? data : []);
  }

  async function deleteProduct(id: string) {
    const shouldDelete = window.confirm("هل تريد حذف هذا المنتج؟");
    if (!shouldDelete) {
      return;
    }

    await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (editing?._id === id) {
      setEditing(null);
    }
    await loadProducts();
  }

  useEffect(() => {
    void loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, onlyLowStock]);

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-black text-slate-900">إدارة المنتجات</h1>
        <p className="text-slate-600 mt-1">إدارة مخزون الفساتين والحقائب والعطور.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2"
            placeholder="ابحث بالاسم"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2"
          >
            <option value="">كل التصنيفات</option>
            <option value="Dresses">فساتين</option>
            <option value="Bags">حقائب</option>
            <option value="Perfumes">عطور</option>
          </select>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={onlyLowStock}
              onChange={(event) => setOnlyLowStock(event.target.checked)}
            />
            عرض منخفض المخزون فقط
          </label>
          <button
            onClick={() => {
              setSearch("");
              setCategory("");
              setOnlyLowStock(false);
            }}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold"
          >
            إعادة ضبط الفلاتر
          </button>
        </div>
      </div>

      <ProductForm
        key={editing?._id || "new-product"}
        initial={editing}
        onSuccess={() => {
          setEditing(null);
          void loadProducts();
        }}
        onCancelEdit={() => setEditing(null)}
      />

      {loadError && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {loadError}
        </p>
      )}

      <ProductList products={products} onEdit={setEditing} onDelete={deleteProduct} />
    </section>
  );
}
