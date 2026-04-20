import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";

import Sidebar from "@/components/Sidebar";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "إدارة المبيعات والمخزون",
  description: "نظام إدارة المخزون والمشتريات والمبيعات والتقارير",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${manrope.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full app-background text-slate-900">
        <div className="md:flex md:min-h-screen">
          <Sidebar />
          <main className="flex-1 px-4 py-5 md:px-8 md:py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
