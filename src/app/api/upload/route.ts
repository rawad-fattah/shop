import path from "node:path";
import { promises as fs } from "node:fs";

import { NextRequest, NextResponse } from "next/server";

import { getAuthSessionFromRequest, unauthorizedResponse } from "@/lib/auth";
import { cloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

export const runtime = "nodejs";
const MAX_UPLOAD_SIZE_BYTES = 2 * 1024 * 1024;
const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

function toSafeFileName(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  const rawBase = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  const rawExt = dotIndex > 0 ? fileName.slice(dotIndex + 1) : "jpg";

  const safeBase = rawBase
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "image";

  const safeExt = rawExt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "") || "jpg";

  return `${safeBase}.${safeExt}`;
}

function isServerlessProduction() {
  return (
    process.env.NODE_ENV === "production" &&
    (process.env.NETLIFY === "true" || process.env.VERCEL === "1")
  );
}

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

async function uploadToImgBB(file: File) {
  if (!IMGBB_API_KEY) {
    throw new Error("IMGBB_API_KEY is missing");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const payload = new URLSearchParams({
    key: IMGBB_API_KEY,
    image: buffer.toString("base64"),
    name: toSafeFileName(file.name),
  });

  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload.toString(),
  });

  const data = await response.json();

  if (!response.ok || !data?.success || !data?.data?.url) {
    throw new Error(data?.error?.message || "ImgBB upload failed");
  }

  return data.data.url as string;
}

async function fileToDataUrl(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return `data:${file.type};base64,${buffer.toString("base64")}`;
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

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "نوع الملف يجب أن يكون صورة" }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json(
        { message: "حجم الصورة كبير جدا. الحد الاقصى 2MB" },
        { status: 400 }
      );
    }

    const imageUrl = isCloudinaryConfigured
      ? await uploadToCloudinary(file)
      : IMGBB_API_KEY
        ? await uploadToImgBB(file)
        : isServerlessProduction()
          ? await fileToDataUrl(file)
          : await saveLocally(file);

    return NextResponse.json({ imageUrl });
  } catch (error) {
    const details = error instanceof Error ? error.message : "خطأ غير معروف";
    return NextResponse.json({ message: "فشل رفع الصورة", details }, { status: 500 });
  }
}
