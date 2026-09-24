import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tojun (登順) | あなたのための百名山登順ロードマップ",
  description: "居住都道府県や登山経験から、日本百名山をどの順で登るべきかを最適にスコアリング。既登山の除外や4段階のステップアップ計画に対応。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
