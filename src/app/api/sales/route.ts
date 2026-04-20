import { NextRequest, NextResponse } from "next/server";

import { getAuthSessionFromRequest, unauthorizedResponse } from "@/lib/auth";
import Product from "@/models/Product";
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
    let filter: { date?: { $gte: Date; $lt: Date } } = {};

    if (dateParam) {
      const selectedDate = new Date(dateParam);

      if (Number.isNaN(selectedDate.getTime())) {
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

      filter = { date: { $gte: start, $lt: end } };
    }

    const sales = await Sale.find(filter)
      .populate("product", "name category")
      .sort({ date: -1 });

    return NextResponse.json(sales);
  } catch (error) {
    return NextResponse.json({ message: "فشل جلب المبيعات", error }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getAuthSessionFromRequest(request);

  if (!session) {
    return unauthorizedResponse();
  }

  try {
    await connectToDatabase();
    const body = await request.json();

    const quantitySold = Number(body.quantitySold);
    const sellingPrice = Number(body.sellingPrice);

    const product = await Product.findById(body.productId);

    if (!product) {
      return NextResponse.json({ message: "المنتج غير موجود" }, { status: 404 });
    }

    if (product.quantity < quantitySold) {
      return NextResponse.json(
        { message: "المخزون غير كافٍ لإتمام عملية البيع" },
        { status: 400 }
      );
    }

    const totalPrice = quantitySold * sellingPrice;
    const purchasePriceAtSale = product.purchasePrice;
    const profit = (sellingPrice - purchasePriceAtSale) * quantitySold;

    const sale = await Sale.create({
      product: body.productId,
      quantitySold,
      sellingPrice,
      purchasePriceAtSale,
      totalPrice,
      profit,
      date: body.date || new Date(),
    });

    product.quantity -= quantitySold;
    product.sellingPrice = sellingPrice;
    await product.save();

    const result = await sale.populate("product", "name category");

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "فشل تسجيل عملية البيع", error }, { status: 400 });
  }
}
