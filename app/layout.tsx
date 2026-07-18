import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "两条轨道 · 北京篇",
  description: "猪头与 Hedy 的北京像素回忆探索游戏",
  openGraph: {
    title: "两条轨道 · 北京篇",
    description: "重新走过双井地铁站与日坛公园的那个夏天。",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
