import { ArrowRight, BarChart3, ClipboardList, Sparkles } from "lucide-react";
import { LinkButton } from "@/components/Button";
import { PageShell } from "@/components/PageShell";

export default function HomePage() {
  return (
    <PageShell className="py-10 lg:py-14">
      <section className="grid min-h-[calc(100vh-180px)] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="inline-flex rounded-md bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">학기 프로젝트 MVP</span>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">소비자 취향 분석 기반 매출 증진 시스템</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">주문, 리뷰, 요청 메뉴 데이터를 모아 소비자에게는 맞춤 메뉴를 추천하고, 점주에게는 매출과 메뉴 개선 인사이트를 제공하는 정보시스템입니다.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/menus">소비자 시작하기<ArrowRight className="h-4 w-4" /></LinkButton>
            <LinkButton href="/admin" variant="secondary">관리자 대시보드<BarChart3 className="h-4 w-4" /></LinkButton>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="grid gap-4">
            {[
              { icon: ClipboardList, title: "데이터 수집", text: "주문, 리뷰, 요청 메뉴를 Supabase에 저장" },
              { icon: Sparkles, title: "맞춤 추천", text: "주문 이력과 별점, 요청 메뉴 기반 rule-based 추천" },
              { icon: BarChart3, title: "매출 전략", text: "인기 메뉴, 개선 메뉴, 신메뉴 후보를 대시보드로 확인" },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white"><Icon className="h-5 w-5" /></div>
                <div><h2 className="font-bold text-slate-950">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
