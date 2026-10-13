import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import LiquidBackground from "@/components/LiquidBackground";

const ibmArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NiceFood | مجموعة نايس فود للمنتجات الغذائية - طعموش، ابن الأصول، مزايا",
  description: "الموقع الرسمي لمجموعة مصانع نايس فود للمنتجات الغذائية: طعموش للدواجن والمجمدات، ابن الأصول للمصنعات الشرقية، مزايا للّانشون والسوسيس. تسوق الآن أونلاين بالفيزا أو كاش مع التوصيل.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/images/brands/nicefood-logo.jpeg", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml" },
      { url: "/images/brands/nicefood-logo.jpeg" },
    ],
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      data-theme="light"
      data-brand="nicefood"
      className={`${ibmArabic.variable} ${plusJakarta.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>
          <LiquidBackground />
          <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", position: "relative", zIndex: 1 }}>
            <Header />
            <main style={{ flex: 1, paddingTop: "var(--header-height, 70px)", paddingBottom: "var(--mobile-bottom-nav-height, 0px)" }}>
              {children}
            </main>
            <Footer />
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
