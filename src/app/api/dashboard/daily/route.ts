import { NextRequest, NextResponse } from "next/server";

import { getAuthSessionFromRequest, unauthorizedResponse } from "@/lib/auth";
import Sale from "@/models/Sale";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const session = await getAuthSessionFromRequest(request);

  if (!session) {
    return unauthorizedResponse();
  }

  try {
    await connectToDatabase();

    const dateParam = request.nextUrl.searchParams.get("date");
    const selectedDate = dateParam ? new Date(dateParam) : new Date();

    if (dateParam && Number.isNaN(selectedDate.getTime())) {
      return NextResponse.json({ message: "معامل التاريخ غير صالح" }, { status: 400 });
    }

    const start = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );
    const end = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate() + 1
    );

    const sales = await Sale.find({
      date: { $gte: start, $lt: end },
    }).sort({ date: -1 });

    const totals = sales.reduce(
      (acc, sale) => {
        acc.totalSales += Number(sale.totalAmount || 0);
        acc.totalProfit += Number(sale.totalProfit || 0);
        acc.itemsSold += Number(sale.totalQuantity || 0);
        return acc;
      },
      { totalSales: 0, totalProfit: 0, itemsSold: 0 }
    );

    return NextResponse.json({ ...totals, sales });
  } catch (error) {
    return NextResponse.json(
      { message: "فشل تحميل لوحة التحكم اليومية", error },
      { status: 500 }
    );
  }
}
