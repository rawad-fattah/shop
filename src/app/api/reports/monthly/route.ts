import { NextRequest, NextResponse } from "next/server";

import { getAuthSessionFromRequest, unauthorizedResponse } from "@/lib/auth";
import Sale from "@/models/Sale";
import { connectToDatabase } from "@/lib/mongodb";

function parseDate(value: string | null, fallback: Date) {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

export async function GET(request: NextRequest) {
  const session = await getAuthSessionFromRequest(request);

  if (!session) {
    return unauthorizedResponse();
  }

  try {
    await connectToDatabase();

    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const start = parseDate(request.nextUrl.searchParams.get("start"), defaultStart);
    const end = parseDate(request.nextUrl.searchParams.get("end"), defaultEnd);

    const sales = await Sale.find({
      date: { $gte: start, $lt: end },
    });

    const totals = sales.reduce(
      (acc, sale) => {
        acc.revenue += Number(sale.totalAmount || 0);
        acc.profit += Number(sale.totalProfit || 0);
        return acc;
      },
      { revenue: 0, profit: 0 }
    );

    const bestSellingMap = new Map<
      string,
      { productId: string; name: string; quantity: number; revenue: number }
    >();

    for (const sale of sales) {
      for (const item of sale.items || []) {
        const productId = item.productId?.toString() || item.name || "غير_معروف";
        const name = item.name || "منتج غير معروف";
        const current = bestSellingMap.get(productId) || {
          productId,
          name,
          quantity: 0,
          revenue: 0,
        };

        current.quantity += item.quantity;
        current.revenue += item.total;
        bestSellingMap.set(productId, current);
      }
    }

    const bestSellingProducts = Array.from(bestSellingMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return NextResponse.json({
      start,
      end,
      totalRevenue: totals.revenue,
      totalProfit: totals.profit,
      bestSellingProducts,
      totalSalesRecords: sales.length,
    });
  } catch (error) {
    return NextResponse.json({ message: "فشل تحميل التقرير", error }, { status: 500 });
  }
}
