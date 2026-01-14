import type { Metadata, Viewport } from "next";
import { Quicksand, Bubblegum_Sans } from "next/font/google";
import "./_globals.scss";

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

export const metadata: Metadata = {
  title: "GiftGhost | Find the Perfect Gift",
  description: "AI-powered gift recommendations made simple. Tell us about your friend, and we'll find the perfect gift idea!",
  keywords: ["gift", "recommendation", "AI", "present", "friend"],
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
        className={`${quicksand.variable} ${bubblegum.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
