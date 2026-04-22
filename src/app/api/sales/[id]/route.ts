import { NextRequest, NextResponse } from "next/server";

import { getAuthSessionFromRequest, unauthorizedResponse } from "@/lib/auth";
import Product from "@/models/Product";
import Sale from "@/models/Sale";
import { connectToDatabase } from "@/lib/mongodb";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const session = await getAuthSessionFromRequest(request);

  if (!session) {
    return unauthorizedResponse();
  }

  try {
    await connectToDatabase();
    const { id } = await context.params;

    const sale = await Sale.findById(id);

    if (!sale) {
      return NextResponse.json({ message: "عملية البيع غير موجودة" }, { status: 404 });
    }

    return NextResponse.json(sale);
  } catch (error) {
    return NextResponse.json({ message: "فشل جلب الفاتورة", error }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await getAuthSessionFromRequest(request);

  if (!session) {
    return unauthorizedResponse();
  }

  try {
    await connectToDatabase();
    const { id } = await context.params;

    const sale = await Sale.findById(id);

    if (!sale) {
      return NextResponse.json({ message: "عملية البيع غير موجودة" }, { status: 404 });
    }

    const productRestoreMap = new Map<string, number>();

    for (const item of sale.items || []) {
      const productId = item.productId?.toString();
      if (!productId) {
        continue;
      }

      const current = productRestoreMap.get(productId) || 0;
      productRestoreMap.set(productId, current + item.quantity);
    }

    const restoreIds = Array.from(productRestoreMap.keys());
    const products = await Product.find({ _id: { $in: restoreIds } });

    for (const product of products) {
      const restoreQty = productRestoreMap.get(product._id.toString()) || 0;
      product.quantity += restoreQty;
      await product.save();
    }

    await sale.deleteOne();

    return NextResponse.json({ message: "تم حذف عملية البيع" });
  } catch (error) {
    return NextResponse.json({ message: "فشل حذف عملية البيع", error }, { status: 500 });
  }
}
