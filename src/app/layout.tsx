import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "전생 서랍",
  description: "생년월일과 7개의 질문으로 여는 나만의 전생 기록",
  applicationName: "전생 서랍",
  alternates: { canonical: "/" },
  openGraph: {
    title: "전생 서랍",
    description: "생년월일과 7개의 질문으로 여는 나만의 전생 기록",
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "전생 서랍",
  },
  twitter: {
    card: "summary_large_image",
    title: "전생 서랍",
    description: "생년월일과 7개의 질문으로 여는 나만의 전생 기록",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F5E8C8",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
