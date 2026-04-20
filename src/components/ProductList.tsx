"use client";

import { type Product } from "@/types/inventory";

type ProductListProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
};

export default function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  const safeProducts = Array.isArray(products) ? products : [];

  const categoryLabels: Record<string, string> = {
    Dresses: "فساتين",
    Bags: "حقائب",
    Perfumes: "عطور",
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-slate-100 text-right">
            <tr>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">الصورة</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">الاسم</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">التصنيف</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">سعر الشراء</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">سعر البيع</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">المخزون</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {safeProducts.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={7}>
                  لا توجد منتجات.
                </td>
              </tr>
            )}
            {safeProducts.map((product) => {
              const isLowStock = product.quantity <= product.lowStockThreshold;

              return (
                <tr key={product._id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-slate-100" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{categoryLabels[product.category] || product.category}</td>
                  <td className="px-4 py-3 whitespace-nowrap">${product.purchasePrice.toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">${product.sellingPrice.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        isLowStock
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {product.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(product)}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => onDelete(product._id)}
                        className="rounded-lg border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
