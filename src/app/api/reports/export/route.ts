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

    const startParam = request.nextUrl.searchParams.get("start");
    const endParam = request.nextUrl.searchParams.get("end");

    const start = startParam ? new Date(startParam) : new Date(0);
    const end = endParam ? new Date(endParam) : new Date();

    const sales = await Sale.find({
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    const header = [
      "التاريخ",
      "المنتج",
      "التصنيف",
      "الكمية المباعة",
      "سعر البيع",
      "الإجمالي",
      "الربح",
    ];

    const rows = sales.flatMap((sale) =>
      (sale.items || []).map((item: {
        name?: string;
        category?: string;
        quantity: number;
        price: number;
        total: number;
        profit: number;
      }) => [
        new Date(sale.date).toISOString(),
        item.name || "غير معروف",
        item.category || "غير معروف",
        String(item.quantity),
        String(item.price),
        String(item.total),
        String(item.profit),
      ])
    );

    const csvBody = [header, ...rows]
      .map((line: string[]) =>
        line.map((value: string) => `"${value.replace(/"/g, '""')}"`).join(",")
      )
      .join("\r\n");

    // Add UTF-8 BOM so Excel can decode Arabic headers correctly.
    const csv = `\uFEFF${csvBody}`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=taqrir-almabieat.csv",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "فشل تصدير التقرير", error },
      { status: 500 }
    );
  }
}
