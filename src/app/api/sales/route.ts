import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { getAuthSessionFromRequest, unauthorizedResponse } from "@/lib/auth";
import Product from "@/models/Product";
import Sale from "@/models/Sale";
import { connectToDatabase } from "@/lib/mongodb";

type RequestedSaleItem = {
  productId: string;
  quantity: number;
  price: number;
};

function getErrorDetails(error: unknown) {
  if (error instanceof mongoose.Error.ValidationError) {
    const keys = Object.keys(error.errors || {});
    const staleSchemaKeys = ["product", "quantitySold", "sellingPrice", "totalPrice", "purchasePriceAtSale", "profit"];

    if (keys.some((key) => staleSchemaKeys.includes(key))) {
      return "يبدو أن الخادم يستخدم موديل قديم للمبيعات. أعد تشغيل الخادم (npm run dev) ثم حاول مجددًا.";
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "خطأ غير معروف";
}

function normalizeRequestedItems(body: Record<string, unknown>): RequestedSaleItem[] {
  if (!Array.isArray(body.items)) {
    return [];
  }

  return body.items
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      productId: String(item.productId || ""),
      quantity: Number(item.quantity),
      price: Number(item.price),
    }))
    .filter((item) => !!item.productId);
}

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

    const sales = await Sale.find(filter).sort({ date: -1 });

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
    const body = (await request.json()) as Record<string, unknown>;

    const items = normalizeRequestedItems(body);

    if (!items.length) {
      return NextResponse.json({ message: "أضف صنفًا واحدًا على الأقل" }, { status: 400 });
    }

    for (const item of items) {
      if (!mongoose.isValidObjectId(item.productId)) {
        return NextResponse.json({ message: "معرف المنتج غير صالح" }, { status: 400 });
      }

      if (!Number.isFinite(item.quantity) || item.quantity < 1) {
        return NextResponse.json({ message: "كمية الصنف يجب أن تكون 1 أو أكثر" }, { status: 400 });
      }

      if (!Number.isFinite(item.price) || item.price < 0) {
        return NextResponse.json({ message: "سعر الصنف غير صالح" }, { status: 400 });
      }
    }

    const requestedByProduct = new Map<string, number>();
    for (const item of items) {
      const current = requestedByProduct.get(item.productId) || 0;
      requestedByProduct.set(item.productId, current + item.quantity);
    }

    const productIds = Array.from(requestedByProduct.keys());
    const products = await Product.find({ _id: { $in: productIds } });
    const productsMap = new Map(products.map((product) => [product._id.toString(), product]));

    for (const productId of productIds) {
      const product = productsMap.get(productId);
      if (!product) {
        return NextResponse.json({ message: "أحد المنتجات غير موجود" }, { status: 404 });
      }

      const requestedQty = requestedByProduct.get(productId) || 0;
      if (product.quantity < requestedQty) {
        return NextResponse.json(
          { message: `المخزون غير كافٍ للمنتج: ${product.name}` },
          { status: 400 }
        );
      }
    }

    const saleItems = items.map((item) => {
      const product = productsMap.get(item.productId);
      const name = product?.name || "منتج غير معروف";
      const category = product?.category || "غير معروف";
      const total = item.quantity * item.price;
      const purchasePrice = product?.purchasePrice ?? 0;
      const profit = (item.price - purchasePrice) * item.quantity;

      return {
        productId: item.productId,
        name,
        category,
        quantity: item.quantity,
        price: item.price,
        total,
        profit,
      };
    });

    const totalAmount = saleItems.reduce((sum, item) => sum + item.total, 0);
    const totalProfit = saleItems.reduce((sum, item) => sum + item.profit, 0);
    const totalQuantity = saleItems.reduce((sum, item) => sum + item.quantity, 0);

    const saleDate = body.date ? new Date(String(body.date)) : new Date();
    if (Number.isNaN(saleDate.getTime())) {
      return NextResponse.json({ message: "تاريخ الفاتورة غير صالح" }, { status: 400 });
    }

    const sale = await Sale.create({
      items: saleItems,
      totalAmount,
      totalProfit,
      totalQuantity,
      date: saleDate,
    });

    for (const [productId, requestedQty] of requestedByProduct.entries()) {
      const product = productsMap.get(productId);
      if (!product) {
        continue;
      }

      const soldLine = items.find((item) => item.productId === productId);
      product.quantity -= requestedQty;
      if (soldLine) {
        product.sellingPrice = soldLine.price;
      }
      await product.save();
    }

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "فشل تسجيل عملية البيع",
        details: getErrorDetails(error),
      },
      { status: 400 }
    );
  }
}
