import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AnimatedBackground from "@/components/display/AnimatedBackground";
import { MovieProvider } from "@/hooks/useMovieContext";
import { PartnerProvider } from "@/hooks/usePartnerContext";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#4f46e5",
};

export const metadata: Metadata = {
  title: "モバイルアプリ",
  description: "スマホアプリ想定のレイアウト",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "モバイルアプリ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MovieProvider>
          <PartnerProvider>
            <AnimatedBackground>
              <main className="min-h-screen">{children}</main>
            </AnimatedBackground>
          </PartnerProvider>
        </MovieProvider>
      </body>
    </html>
  );
}
