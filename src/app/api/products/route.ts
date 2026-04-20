import { NextRequest, NextResponse } from "next/server";

import { getAuthSessionFromRequest, unauthorizedResponse } from "@/lib/auth";
import Product from "@/models/Product";
import { connectToDatabase } from "@/lib/mongodb";

function getErrorDetails(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "خطأ غير معروف في الخادم";
}

export async function GET(request: NextRequest) {
  const session = await getAuthSessionFromRequest(request);

  if (!session) {
    return unauthorizedResponse();
  }

  try {
    await connectToDatabase();

    const search = request.nextUrl.searchParams.get("search") || "";
    const category = request.nextUrl.searchParams.get("category") || "";
    const lowStock = request.nextUrl.searchParams.get("lowStock") === "true";

    const query: Record<string, unknown> = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    if (lowStock) {
      query.$expr = { $lte: ["$quantity", "$lowStockThreshold"] };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      {
        message: "فشل جلب المنتجات",
        details: getErrorDetails(error),
      },
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

    const purchasePrice = Number(body.purchasePrice);
    const sellingPrice = Number(body.sellingPrice);
    const quantity = Number(body.quantity);
    const lowStockThreshold = Number(body.lowStockThreshold ?? 5);

    if (!Number.isFinite(purchasePrice) || !Number.isFinite(sellingPrice)) {
      return NextResponse.json(
        { message: "يجب أن تكون الأسعار أرقامًا صحيحة" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(quantity) || !Number.isFinite(lowStockThreshold)) {
      return NextResponse.json(
        { message: "يجب أن تكون الكمية وحد التنبيه أرقامًا صحيحة" },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name: body.name,
      category: body.category,
      purchasePrice,
      sellingPrice,
      quantity,
      imageUrl: body.imageUrl || "",
      lowStockThreshold,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const details = getErrorDetails(error);
    const status = details.includes("MONGODB_URI") ? 500 : 400;

    return NextResponse.json(
      {
        message: "فشل إنشاء المنتج",
        details,
      },
      { status }
    );
  }
}
