"use client";

import { useMemo, useState } from "react";

import { type Product, type Category } from "@/types/inventory";

type ProductFormProps = {
  initial?: Product | null;
  onSuccess: () => void;
  onCancelEdit?: () => void;
};

const categories: Array<{ value: Category; label: string }> = [
  { value: "Dresses", label: "فساتين" },
  { value: "Bags", label: "حقائب" },
  { value: "Perfumes", label: "عطور" },
];

type ProductPayload = {
  name: string;
  category: Category;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  lowStockThreshold: number;
  imageUrl: string;
};

function emptyPayload(): ProductPayload {
  return {
    name: "",
    category: "Dresses",
    purchasePrice: 0,
    sellingPrice: 0,
    quantity: 0,
    lowStockThreshold: 5,
    imageUrl: "",
  };
}

function payloadFromProduct(product: Product): ProductPayload {
  return {
    name: product.name,
    category: product.category,
    purchasePrice: product.purchasePrice,
    sellingPrice: product.sellingPrice,
    quantity: product.quantity,
    lowStockThreshold: product.lowStockThreshold,
    imageUrl: product.imageUrl || "",
  };
}

export default function ProductForm({ initial, onSuccess, onCancelEdit }: ProductFormProps) {
  const [payload, setPayload] = useState<ProductPayload>(
    initial ? payloadFromProduct(initial) : emptyPayload()
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!initial?._id;
  const previewUrl = useMemo(() => payload.imageUrl || "", [payload.imageUrl]);

  function updateField<K extends keyof ProductPayload>(key: K, value: ProductPayload[K]) {
    setPayload((current) => ({ ...current, [key]: value }));
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "فشل رفع الصورة");
      }

      updateField("imageUrl", data.imageUrl);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const endpoint = isEditMode ? `/api/products/${initial?._id}` : "/api/products";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const reason = [data?.message, data?.details].filter(Boolean).join(": ");
        throw new Error(reason || "فشل حفظ المنتج");
      }

      if (!isEditMode) {
        setPayload(emptyPayload());
      }

      onSuccess();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold text-slate-900">
        {isEditMode ? "تعديل منتج" : "إضافة منتج"}
      </h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="product-name" className="text-sm font-semibold text-slate-700">
            اسم المنتج
          </label>
          <input
            id="product-name"
            required
            value={payload.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            placeholder="مثال: فستان صيفي مزهر"
          />
        </div>

        <div>
          <label htmlFor="product-category" className="text-sm font-semibold text-slate-700">
            التصنيف
          </label>
          <select
            id="product-category"
            value={payload.category}
            onChange={(event) => updateField("category", event.target.value as Category)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="purchase-price" className="text-sm font-semibold text-slate-700">
            سعر الشراء
          </label>
          <input
            id="purchase-price"
            type="number"
            min={0}
            step="0.01"
            required
            value={payload.purchasePrice}
            onChange={(event) => updateField("purchasePrice", Number(event.target.value))}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            placeholder="0.00"
          />
        </div>

        <div>
          <label htmlFor="selling-price" className="text-sm font-semibold text-slate-700">
            سعر البيع
          </label>
          <input
            id="selling-price"
            type="number"
            min={0}
            step="0.01"
            required
            value={payload.sellingPrice}
            onChange={(event) => updateField("sellingPrice", Number(event.target.value))}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            placeholder="0.00"
          />
        </div>

        <div>
          <label htmlFor="quantity" className="text-sm font-semibold text-slate-700">
            الكمية في المخزون
          </label>
          <input
            id="quantity"
            type="number"
            min={0}
            required
            value={payload.quantity}
            onChange={(event) => updateField("quantity", Number(event.target.value))}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            placeholder="0"
          />
        </div>

        <div>
          <label htmlFor="low-stock-threshold" className="text-sm font-semibold text-slate-700">
            حد تنبيه انخفاض المخزون
          </label>
          <input
            id="low-stock-threshold"
            type="number"
            min={0}
            required
            value={payload.lowStockThreshold}
            onChange={(event) => updateField("lowStockThreshold", Number(event.target.value))}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            placeholder="5"
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-3">
        <label htmlFor="product-image" className="text-sm font-semibold text-slate-700">
          صورة المنتج
        </label>
        <input
          id="product-image"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleImageUpload(file);
            }
          }}
          className="mt-2 block w-full text-sm"
        />
        {uploading && <p className="mt-2 text-xs text-slate-500">جار رفع الصورة...</p>}
        {previewUrl && (
          <img
            src={previewUrl}
            alt="معاينة المنتج"
            className="mt-3 h-28 w-28 rounded-lg object-cover border border-slate-200"
          />
        )}
      </div>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? "جار الحفظ..." : isEditMode ? "تحديث المنتج" : "إضافة المنتج"}
        </button>

        {isEditMode && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold"
          >
            إلغاء
          </button>
        )}
      </div>
    </form>
  );
}
