import { NextRequest, NextResponse } from "next/server";

import { getAuthSessionFromRequest, unauthorizedResponse } from "@/lib/auth";
import Product from "@/models/Product";
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

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ message: "المنتج غير موجود" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { message: "فشل جلب المنتج", error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await getAuthSessionFromRequest(request);

  if (!session) {
    return unauthorizedResponse();
  }

  try {
    await connectToDatabase();
    const { id } = await context.params;
    const body = await request.json();

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name: body.name,
        category: body.category,
        purchasePrice: Number(body.purchasePrice),
        sellingPrice: Number(body.sellingPrice),
        quantity: Number(body.quantity),
        imageUrl: body.imageUrl || "",
        lowStockThreshold: Number(body.lowStockThreshold || 5),
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json({ message: "المنتج غير موجود" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { message: "فشل تحديث المنتج", error },
      { status: 400 }
    );
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

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ message: "المنتج غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ message: "تم حذف المنتج" });
  } catch (error) {
    return NextResponse.json(
      { message: "فشل حذف المنتج", error },
      { status: 500 }
    );
  }
}
