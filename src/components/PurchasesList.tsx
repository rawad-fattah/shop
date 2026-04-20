import { type Purchase } from "@/types/inventory";

type PurchasesListProps = {
  purchases: Purchase[];
  onDeletePurchase?: (purchaseId: string) => void | Promise<void>;
  deletingPurchaseId?: string | null;
};

function getProductName(purchase: Purchase) {
  if (!purchase.product) {
    return "منتج محذوف";
  }

  return typeof purchase.product === "string" ? purchase.product : purchase.product.name;
}

export default function PurchasesList({
  purchases,
  onDeletePurchase,
  deletingPurchaseId = null,
}: PurchasesListProps) {
  const showActions = !!onDeletePurchase;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-slate-100 text-right">
            <tr>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">المنتج</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">الكمية</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">تكلفة القطعة</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">إجمالي التكلفة</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">التاريخ</th>
              {showActions && <th className="px-4 py-3 font-semibold whitespace-nowrap">الإجراءات</th>}
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={showActions ? 6 : 5}>
                  لا توجد عمليات شراء.
                </td>
              </tr>
            )}
            {purchases.map((purchase) => (
              <tr key={purchase._id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{getProductName(purchase)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{purchase.quantity}</td>
                <td className="px-4 py-3 whitespace-nowrap">${purchase.costPerItem.toFixed(2)}</td>
                <td className="px-4 py-3 whitespace-nowrap">${purchase.totalCost.toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                  {new Date(purchase.date).toLocaleDateString("ar")}
                </td>
                {showActions && (
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void onDeletePurchase?.(purchase._id)}
                      disabled={deletingPurchaseId === purchase._id}
                      className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                    >
                      {deletingPurchaseId === purchase._id ? "جار الحذف..." : "حذف"}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
