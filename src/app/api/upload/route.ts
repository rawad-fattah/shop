import path from "node:path";
import { promises as fs } from "node:fs";

import { NextRequest, NextResponse } from "next/server";

import { getAuthSessionFromRequest, unauthorizedResponse } from "@/lib/auth";
import { cloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

export const runtime = "nodejs";

async function saveLocally(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const timestamp = Date.now();
  const safeName = file.name.replace(/\s+/g, "-");
  const filename = `${timestamp}-${safeName}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  const destination = path.join(uploadDir, filename);
  await fs.writeFile(destination, buffer);

  return `/uploads/${filename}`;
}

async function uploadToCloudinary(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "shop-inventory",
  });

  return result.secure_url;
}

export async function POST(request: NextRequest) {
  const session = await getAuthSessionFromRequest(request);

  if (!session) {
    return unauthorizedResponse();
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: "ملف الصورة مطلوب" }, { status: 400 });
    }

    const imageUrl = isCloudinaryConfigured
      ? await uploadToCloudinary(file)
      : await saveLocally(file);

    return NextResponse.json({ imageUrl });
  } catch (error) {
    return NextResponse.json({ message: "فشل رفع الصورة", error }, { status: 500 });
  }
}
