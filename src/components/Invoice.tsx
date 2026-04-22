import { type Sale } from "@/types/inventory";

type InvoiceProps = {
  sale: Sale;
  shopName?: string;
  title?: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB");
}

export default function Invoice({ sale, shopName = "Marvella خان الصابون", title = "Invoice" }: InvoiceProps) {
  const items = Array.isArray(sale.items) ? sale.items : [];
  const billNo = sale._id.slice(-8).toUpperCase();

  return (
    <article className="invoice-card invoice-thermal mx-auto bg-white text-slate-900">
      <header className="invoice-thermal-header text-center">
        <h1 className="invoice-thermal-shop uppercase">{shopName}</h1>
        <p className="invoice-thermal-subtitle">KHAN AL SABOUN</p>
        <p className="invoice-thermal-subtitle">Fnaidek, highway</p>
        <p className="invoice-thermal-subtitle">PHONE: +961 76 466 703</p>
        <p className="invoice-thermal-subtitle">{title}</p>
      </header>

      <div className="invoice-thermal-meta mt-2 flex items-center justify-between">
        <p>Bill No : {billNo}</p>
        <p>Date : {formatDate(sale.date)}</p>
      </div>

      <div className="invoice-dashed mt-2" />

      <section className="mt-3 overflow-x-auto">
        <table className="invoice-thermal-table min-w-full border-collapse text-right">
          <thead>
            <tr>
              <th className="px-1 py-1">المنتج</th>
              <th className="px-1 py-1">QTY</th>
              <th className="px-1 py-1">السعر</th>
              <th className="px-1 py-1">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${item.productId}-${index}`}>
                <td className="px-1 py-1 font-medium break-words">{item.name}</td>
                <td className="px-1 py-1">{item.quantity}</td>
                <td className="px-1 py-1">${item.price.toFixed(2)}</td>
                <td className="px-1 py-1">${item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="invoice-dashed mt-2" />

      <div className="invoice-thermal-meta mt-2 flex items-center justify-between">
        <p>SubTotal</p>
        <p>{sale.totalQuantity}</p>
        <p>${sale.totalAmount.toFixed(2)}</p>
      </div>

      <footer className="invoice-thermal-total mt-2 flex items-center justify-between pt-2">
        <span>TOTAL</span>
        <span>${sale.totalAmount.toFixed(2)}</span>
      </footer>

      <p className="invoice-thermal-thanks mt-3 text-center">شكرا لزيارتكم</p>
    </article>
  );
}
