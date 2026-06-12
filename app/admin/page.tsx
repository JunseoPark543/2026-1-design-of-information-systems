"use client";

import { BarChart3, ReceiptText, ShoppingBag, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AdminChart } from "@/components/AdminChart";
import { AdminGate } from "@/components/AdminGate";
import { LinkButton } from "@/components/Button";
import { EmptyState } from "@/components/Card";
import { InsightCard } from "@/components/InsightCard";
import { PageHeader, PageShell } from "@/components/PageShell";
import { StatCard } from "@/components/StatCard";
import { buildAdminInsights } from "@/lib/admin-insights";
import { compactNumber, formatCurrency } from "@/lib/format";
import { fetchAdminMenuMetrics, fetchAdminProfiles, fetchAllMenuRequests } from "@/lib/supabase-queries";
import type { AdminInsight, AdminMenuMetric, AdminProfileSummary, MenuRequest } from "@/lib/types";

function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMenuMetric[]>([]);
  const [requests, setRequests] = useState<MenuRequest[]>([]);
  const [profiles, setProfiles] = useState<AdminProfileSummary[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAdminMenuMetrics(), fetchAllMenuRequests(), fetchAdminProfiles()])
      .then(([metricRows, requestRows, profileRows]) => {
        setMetrics(metricRows);
        setRequests(requestRows);
        setProfiles(profileRows);
      })
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
    <>
      <PageHeader title="관리자 대시보드" description="매출, 인기 메뉴, 요청 메뉴, 회원 정보, 개선 인사이트를 확인합니다." action={<LinkButton href="/admin/menus" variant="secondary">메뉴 관리</LinkButton>} />
      {message ? <p className="mb-5 rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{message}</p> : null}
      {loading ? <EmptyState title="대시보드를 불러오는 중" description="매출, 리뷰, 요청 메뉴, 회원 정보를 집계하고 있습니다." /> : null}
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
                <div>
                  <p className="text-sm font-bold text-blue-700">#{index + 1}</p>
                  <p className="font-semibold text-slate-950">{menu.name}</p>
                </div>
                <div className="text-right text-sm text-slate-600">
                  <p className="font-bold text-slate-950">{menu.sold_count}개</p>
                  <p>{formatCurrency(menu.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">회원 정보</h2>
            <p className="mt-1 text-sm text-slate-500">소비자가 등록한 프로필과 활동 요약입니다.</p>
          </div>
          <span className="text-sm font-semibold text-blue-700">총 {profiles.length}명</span>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-3 font-bold">이름</th>
                <th className="px-3 py-3 font-bold">전화번호</th>
                <th className="px-3 py-3 font-bold">성별</th>
                <th className="px-3 py-3 font-bold">나이</th>
                <th className="px-3 py-3 font-bold">주문</th>
                <th className="px-3 py-3 font-bold">총 구매</th>
                <th className="px-3 py-3 font-bold">별점</th>
                <th className="px-3 py-3 font-bold">요청</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profiles.map((profile) => (
                <tr key={profile.id}>
                  <td className="px-3 py-3 font-semibold text-slate-950">{profile.name || "이름 없음"}</td>
                  <td className="px-3 py-3 text-slate-600">{profile.phone || "-"}</td>
                  <td className="px-3 py-3 text-slate-600">{profile.gender || "-"}</td>
                  <td className="px-3 py-3 text-slate-600">{profile.age ?? "-"}</td>
                  <td className="px-3 py-3 text-slate-600">{profile.order_count}건</td>
                  <td className="px-3 py-3 text-slate-600">{formatCurrency(profile.total_spent)}</td>
                  <td className="px-3 py-3 text-slate-600">{profile.review_count}개</td>
                  <td className="px-3 py-3 text-slate-600">{profile.request_count}회</td>
                </tr>
              ))}
              {profiles.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-center text-slate-500" colSpan={8}>등록된 회원 정보가 없습니다.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

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
            {requests.slice(0, 8).map((request) => (
              <div key={request.id} className="flex items-center justify-between rounded-md bg-slate-50 p-3">
                <span className="font-semibold text-slate-950">{request.requested_name}</span>
                <span className="rounded-md bg-blue-100 px-2 py-1 text-sm font-bold text-blue-700">{request.request_count}회</span>
              </div>
            ))}
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
    </>
  );
}

export default function AdminPage() {
  return (
    <PageShell>
      <AdminGate>
        <AdminDashboard />
      </AdminGate>
    </PageShell>
  );
}