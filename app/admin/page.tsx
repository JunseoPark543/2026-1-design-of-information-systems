"use client";

import { BarChart3, ReceiptText, ShoppingBag, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AdminChart } from "@/components/AdminChart";
import { LinkButton } from "@/components/Button";
import { EmptyState } from "@/components/Card";
import { InsightCard } from "@/components/InsightCard";
import { PageHeader, PageShell } from "@/components/PageShell";
import { StatCard } from "@/components/StatCard";
import { buildAdminInsights } from "@/lib/admin-insights";
import { compactNumber, formatCurrency } from "@/lib/format";
import { fetchAdminMenuMetrics, fetchAllMenuRequests } from "@/lib/supabase-queries";
import type { AdminInsight, AdminMenuMetric, MenuRequest } from "@/lib/types";

export default function AdminPage() {
  const [metrics, setMetrics] = useState<AdminMenuMetric[]>([]);
  const [requests, setRequests] = useState<MenuRequest[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAdminMenuMetrics(), fetchAllMenuRequests()])
      .then(([metricRows, requestRows]) => { setMetrics(metricRows); setRequests(requestRows); })
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    const soldCount = metrics.reduce((sum, item) => sum + item.sold_count, 0);
    const revenue = metrics.reduce((sum, item) => sum + item.revenue, 0);
    const reviewCount = metrics.reduce((sum, item) => sum + item.review_count, 0);
    const ratingTotal = metrics.reduce((sum, item) => sum + (item.average_rating ?? 0) * item.review_count, 0);
    return { soldCount, revenue, avgUnit: soldCount > 0 ? revenue / soldCount : 0, avgRating: reviewCount > 0 ? ratingTotal / reviewCount : 0 };
  }, [metrics]);

  const insights: AdminInsight[] = useMemo(() => buildAdminInsights(metrics, requests), [metrics, requests]);
  const topMenus = metrics.slice(0, 5);
  const improvementMenus = insights.filter((insight) => insight.type === "improve");
  const promotionMenus = insights.filter((insight) => insight.type === "promote");

  return (
    <PageShell>
      <PageHeader title="관리자 대시보드" description="MVP에서는 데모 관리자 접근을 허용합니다. 실제 서비스에서는 profiles.role 또는 별도 admin 테이블로 권한 체크를 추가하면 됩니다." action={<LinkButton href="/admin/menus" variant="secondary">메뉴 관리</LinkButton>} />
      {message ? <p className="mb-5 rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{message}</p> : null}
      {loading ? <EmptyState title="대시보드를 불러오는 중" description="매출, 리뷰, 요청 메뉴 데이터를 집계하고 있습니다." /> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="총 판매 수량" value={`${compactNumber(totals.soldCount)}개`} icon={<ShoppingBag className="h-5 w-5" />} />
        <StatCard title="총 매출" value={formatCurrency(totals.revenue)} icon={<ReceiptText className="h-5 w-5" />} />
        <StatCard title="평균 판매 단가" value={formatCurrency(Math.round(totals.avgUnit))} icon={<BarChart3 className="h-5 w-5" />} />
        <StatCard title="평균 평점" value={totals.avgRating.toFixed(1)} icon={<Star className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">메뉴별 판매량</h2>
          <AdminChart data={metrics} />
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">인기 메뉴 TOP 5</h2>
          <div className="mt-4 grid gap-3">
            {topMenus.map((menu, index) => (
              <div key={menu.menu_id} className="flex items-center justify-between rounded-md bg-slate-50 p-3">
                <div><p className="text-sm font-bold text-blue-700">#{index + 1}</p><p className="font-semibold text-slate-950">{menu.name}</p></div>
                <div className="text-right text-sm text-slate-600"><p className="font-bold text-slate-950">{menu.sold_count}개</p><p>{formatCurrency(menu.revenue)}</p></div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-950">매출 전략 인사이트</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {insights.map((insight, index) => <InsightCard key={`${insight.title}-${index}`} insight={insight} />)}
            {insights.length === 0 ? <p className="text-sm text-slate-500">아직 충분한 인사이트 데이터가 없습니다.</p> : null}
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">요청 메뉴 분석</h2>
          <div className="mt-4 grid gap-3">
            {requests.slice(0, 8).map((request) => <div key={request.id} className="flex items-center justify-between rounded-md bg-slate-50 p-3"><span className="font-semibold text-slate-950">{request.requested_name}</span><span className="rounded-md bg-blue-100 px-2 py-1 text-sm font-bold text-blue-700">{request.request_count}회</span></div>)}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">개선 필요 메뉴</h2>
          <div className="mt-4 grid gap-2 text-sm text-slate-600">{improvementMenus.map((item, index) => <p key={index}>{item.content}</p>)}{improvementMenus.length === 0 ? <p>현재 기준에서 긴급 개선 후보가 없습니다.</p> : null}</div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">홍보 필요 메뉴</h2>
          <div className="mt-4 grid gap-2 text-sm text-slate-600">{promotionMenus.map((item, index) => <p key={index}>{item.content}</p>)}{promotionMenus.length === 0 ? <p>현재 기준에서 홍보 강화 후보가 없습니다.</p> : null}</div>
        </section>
      </div>
    </PageShell>
  );
}
