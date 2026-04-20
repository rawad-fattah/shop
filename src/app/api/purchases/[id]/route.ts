import { NextRequest, NextResponse } from "next/server";

import { getAuthSessionFromRequest, unauthorizedResponse } from "@/lib/auth";
import Product from "@/models/Product";
import Purchase from "@/models/Purchase";
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

    const purchase = await Purchase.findById(id);

    if (!purchase) {
      return NextResponse.json({ message: "عملية الشراء غير موجودة" }, { status: 404 });
    }

    const product = await Product.findById(purchase.product);

    if (product) {
      if (product.quantity < purchase.quantity) {
        return NextResponse.json(
          {
            message:
              "لا يمكن حذف عملية الشراء لأن المخزون الحالي أقل من الكمية التي تم شراؤها.",
          },
          { status: 400 }
        );
      }

      product.quantity -= purchase.quantity;
      await product.save();
    }

    await purchase.deleteOne();

    return NextResponse.json({ message: "تم حذف عملية الشراء" });
  } catch (error) {
    return NextResponse.json(
      { message: "فشل حذف عملية الشراء", error },
      { status: 500 }
    );
  }
}
