import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "TasteOps | 소비자 취향 분석 기반 매출 증진 시스템",
  description: "주문, 리뷰, 요청 메뉴 데이터를 기반으로 메뉴 추천과 매출 전략 인사이트를 제공하는 정보시스템 설계 프로젝트",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}