import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LiquidBackground from "@/components/LiquidBackground";

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
    <html lang="ar" dir="rtl" data-theme="light" data-brand="nicefood" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <LiquidBackground />
          <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", position: "relative", zIndex: 1 }}>
            <Header />
            <main style={{ flex: 1, paddingTop: "var(--header-height, 70px)" }}>
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
