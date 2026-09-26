import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppShell } from "@/components/layout/app-shell";
import { ImagePreviewProvider } from "@/components/ui/image-preview";
import { AdminStoreProvider } from "@/store/admin-store";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Krushiratna Admin",
    template: "%s | Krushiratna Admin",
  },
  description:
    "Admin console for managing agricultural categories, products and orders.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="font-sans">
        <AdminStoreProvider>
          <ImagePreviewProvider>
            <AppShell>{children}</AppShell>
          </ImagePreviewProvider>
        </AdminStoreProvider>
      </body>
    </html>
  );
}
