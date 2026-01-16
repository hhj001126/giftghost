import type { Metadata, Viewport } from "next";
import { Quicksand, Bubblegum_Sans, Noto_Sans_SC, Noto_Sans_TC } from "next/font/google";
import "./_globals.scss";
import { I18nProvider } from "@/i18n";
import { TraceProvider } from "@/tracker";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const bubblegum = Bubblegum_Sans({
  variable: "--font-bubblegum",
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
});

// Simplified Chinese font
const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sc",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Traditional Chinese font
const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-tc",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://giftghost.com'),
  title: {
    default: "GiftGhost | AI-Powered Gift Recommendations",
    template: "%s | GiftGhost",
  },
  description: "The fun, easy way to find perfect gifts. Tell us about your friend and our AI will discover personalized gift ideas that they'll love!",
  keywords: [
    "gift ideas",
    "gift recommendations",
    "AI gift finder",
    "personalized gifts",
    "present ideas",
    "birthday gifts",
    "holiday shopping",
    "gift helper",
    "AI 礼物推荐",
    "AI 送禮建議",
  ],
  authors: [{ name: "GiftGhost Team" }],
  creator: "GiftGhost",
  publisher: "GiftGhost",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://giftghost.com",
    languages: {
      "en": "https://giftghost.com",
      "zh-CN": "https://giftghost.com?lang=zh-CN",
      "zh-HK": "https://giftghost.com?lang=zh-HK",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://giftghost.com",
    siteName: "GiftGhost",
    title: "GiftGhost | AI-Powered Gift Recommendations",
    description: "The fun, easy way to find perfect gifts. Tell us about your friend and our AI will discover personalized gift ideas!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GiftGhost - Find the Perfect Gift",
      },
      {
        url: "/og-image-square.png",
        width: 1080,
        height: 1080,
        alt: "GiftGhost Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GiftGhost | AI-Powered Gift Recommendations",
    description: "The fun, easy way to find perfect gifts!",
    images: ["/og-image.png"],
    creator: "@giftghost",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GiftGhost",
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FFFBF5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${quicksand.variable} ${bubblegum.variable} ${notoSansSC.variable} ${notoSansTC.variable} antialiased`}
      >
        <I18nProvider>
          <TraceProvider>
          {children}
        </TraceProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
