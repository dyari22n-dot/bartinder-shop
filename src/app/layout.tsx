import type { Metadata, Viewport } from "next";

export const instant = false;
import { Geist } from "next/font/google";
import "./globals.css";
import { brand } from "@/lib/brand";
import { publicSiteUrl } from "@/lib/site-url";
import { LocaleProvider } from "@/components/locale-provider";
import { CategoryMenuProvider } from "@/components/category-menu-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl = publicSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${brand.name} | Shop`,
  description: brand.taglineEn,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: brand.name,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/brand-logo.png",
    apple: "/brand-logo.png",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: brand.name,
    images: [brand.logo],
  },
};

export const viewport: Viewport = {
  themeColor: "#100805",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ckb" dir="rtl" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full antialiased">
        <LocaleProvider>
          <CategoryMenuProvider>{children}</CategoryMenuProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}