import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tojun (登順) | 日本百名山 最適登順ナビゲーター",
  description:
    "居住地・体力・スタイルに合わせて挫折しない最適な登順を提案する日本百名山ナビゲーター。GPS現在地からのアクセス計算、既登頂の山除外、4段階ステップアップ計画に対応。",
  keywords: ["日本百名山", "登山", "百名山", "登順", "登山ルート", "山岳", "Tojun"],
  authors: [{ name: "Tojun" }],
  openGraph: {
    title: "Tojun (登順) | 日本百名山 最適登順ナビゲーター",
    description:
      "居住地・体力・スタイルに合わせて挫折しない最適な登順を提案する日本百名山ナビゲーター。",
    siteName: "Tojun (登順)",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tojun (登順) | 日本百名山 最適登順ナビゲーター",
    description:
      "居住地・体力・スタイルに合わせて挫折しない最適な登順を提案する日本百名山ナビゲーター。",
  },
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
