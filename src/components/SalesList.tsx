import { type Sale } from "@/types/inventory";

type SalesListProps = {
  sales: Sale[];
  compact?: boolean;
  onDeleteSale?: (saleId: string) => void | Promise<void>;
  onPrintSale?: (saleId: string) => void;
  deletingSaleId?: string | null;
};

function getProductsSummary(sale: Sale) {
  const items = Array.isArray(sale.items) ? sale.items : [];
  if (!items.length) {
    return "لا توجد أصناف";
  }

  return items.map((item) => `${item.name} x ${item.quantity}`).join("، ");
}

function getSafeTotals(sale: Sale) {
  const items = Array.isArray(sale.items) ? sale.items : [];

  const totalAmount =
    typeof sale.totalAmount === "number" && Number.isFinite(sale.totalAmount)
      ? sale.totalAmount
      : items.reduce((sum, item) => sum + Number(item.total || 0), 0);

  const totalProfit =
    typeof sale.totalProfit === "number" && Number.isFinite(sale.totalProfit)
      ? sale.totalProfit
      : items.reduce((sum, item) => sum + Number(item.profit || 0), 0);

  const totalQuantity =
    typeof sale.totalQuantity === "number" && Number.isFinite(sale.totalQuantity)
      ? sale.totalQuantity
      : items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return { totalAmount, totalProfit, totalQuantity, itemsCount: items.length };
}

export default function SalesList({
  sales,
  compact = false,
  onDeleteSale,
  onPrintSale,
  deletingSaleId = null,
}: SalesListProps) {
  const showActions = !compact && (!!onDeleteSale || !!onPrintSale);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-slate-100 text-right">
            <tr>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">المنتجات</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">عدد الأصناف</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">إجمالي الكمية</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">الإجمالي</th>
              {!compact && <th className="px-4 py-3 font-semibold whitespace-nowrap">الربح</th>}
              <th className="px-4 py-3 font-semibold whitespace-nowrap">التاريخ</th>
              {showActions && <th className="px-4 py-3 font-semibold whitespace-nowrap">الإجراءات</th>}
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={showActions ? 7 : compact ? 5 : 6}>
                  لا توجد عمليات بيع.
                </td>
              </tr>
            )}
            {sales.map((sale) => (
              <tr key={sale._id} className="border-t border-slate-100 align-top">
                {(() => {
                  const totals = getSafeTotals(sale);

                  return (
                    <>
                      <td className="px-4 py-3 text-xs text-slate-700">{getProductsSummary(sale)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{totals.itemsCount}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{totals.totalQuantity}</td>
                      <td className="px-4 py-3 whitespace-nowrap">${totals.totalAmount.toFixed(2)}</td>
                      {!compact && <td className="px-4 py-3 whitespace-nowrap">${totals.totalProfit.toFixed(2)}</td>}
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {new Date(sale.date).toLocaleDateString("ar")}
                      </td>
                      {showActions && (
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {onPrintSale && (
                              <button
                                type="button"
                                onClick={() => onPrintSale(sale._id)}
                                className="rounded-lg border border-sky-300 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50"
                              >
                                طباعة فاتورة
                              </button>
                            )}

                            {onDeleteSale && (
                              <button
                                type="button"
                                onClick={() => void onDeleteSale(sale._id)}
                                disabled={deletingSaleId === sale._id}
                                className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                              >
                                {deletingSaleId === sale._id ? "جار الحذف..." : "حذف"}
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </>
                  );
                })()}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
