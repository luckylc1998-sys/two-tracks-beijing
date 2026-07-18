import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "两条轨道 · 北京篇",
  description: "猪头与 Hedy 的像素回忆游戏",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
