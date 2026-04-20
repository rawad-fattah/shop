import { NextRequest, NextResponse } from "next/server";

import { getAuthSessionFromRequest, unauthorizedResponse } from "@/lib/auth";
import Product from "@/models/Product";
import Sale from "@/models/Sale";
import { connectToDatabase } from "@/lib/mongodb";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

    const product = await Product.findById(sale.product);

    if (product) {
      product.quantity += sale.quantitySold;
      await product.save();
    }

    await sale.deleteOne();

    return NextResponse.json({ message: "تم حذف عملية البيع" });
  } catch (error) {
    return NextResponse.json({ message: "فشل حذف عملية البيع", error }, { status: 500 });
  }
}
