import { type Sale } from "@/types/inventory";

type SalesListProps = {
  sales: Sale[];
  compact?: boolean;
  onDeleteSale?: (saleId: string) => void | Promise<void>;
  onPrintSale?: (saleId: string) => void;
  deletingSaleId?: string | null;
};

function getProductName(sale: Sale) {
  if (!sale.product) {
    return "منتج محذوف";
  }

  return typeof sale.product === "string" ? sale.product : sale.product.name;
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
              <th className="px-4 py-3 font-semibold whitespace-nowrap">المنتج</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">الكمية</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">السعر</th>
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
              <tr key={sale._id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{getProductName(sale)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{sale.quantitySold}</td>
                <td className="px-4 py-3 whitespace-nowrap">${sale.sellingPrice.toFixed(2)}</td>
                <td className="px-4 py-3 whitespace-nowrap">${sale.totalPrice.toFixed(2)}</td>
                {!compact && <td className="px-4 py-3 whitespace-nowrap">${sale.profit.toFixed(2)}</td>}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
