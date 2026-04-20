import { NextRequest, NextResponse } from "next/server";

import { getAuthSessionFromRequest, unauthorizedResponse } from "@/lib/auth";
import Product from "@/models/Product";
import Purchase from "@/models/Purchase";
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

    const purchases = await Purchase.find(filter)
      .populate("product", "name category")
      .sort({ date: -1 });

    return NextResponse.json(purchases);
  } catch (error) {
    return NextResponse.json(
      { message: "فشل جلب المشتريات", error },
      { status: 500 }
    );
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

    const quantity = Number(body.quantity);
    const costPerItem = Number(body.costPerItem);
    const totalCost = quantity * costPerItem;

    const product = await Product.findById(body.productId);

    if (!product) {
      return NextResponse.json({ message: "المنتج غير موجود" }, { status: 404 });
    }

    const purchase = await Purchase.create({
      product: body.productId,
      quantity,
      costPerItem,
      totalCost,
      date: body.date || new Date(),
    });

    product.quantity += quantity;
    product.purchasePrice = costPerItem;
    await product.save();

    const result = await purchase.populate("product", "name category");

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "فشل تسجيل عملية الشراء", error },
      { status: 400 }
    );
  }
}
