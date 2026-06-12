"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/Card";
import { PageHeader, PageShell } from "@/components/PageShell";
import { RecommendationCard } from "@/components/RecommendationCard";
import { getRecommendations } from "@/lib/recommendation";
import { fetchActiveMenus, fetchMyOrders, fetchMyRequests, fetchMyReviews, getCurrentProfileId } from "@/lib/supabase-queries";
import type { Recommendation } from "@/lib/types";

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const profileId = await getCurrentProfileId();
      const menus = await fetchActiveMenus();
      if (!profileId) {
        setRecommendations(getRecommendations({ menus, orders: [], reviews: [], requests: [] }));
        setMessage("소비자 정보를 등록하면 주문 이력과 요청 메뉴를 반영한 개인화 추천을 볼 수 있습니다.");
        return;
      }
      const [orders, reviews, requests] = await Promise.all([fetchMyOrders(profileId), fetchMyReviews(profileId), fetchMyRequests(profileId)]);
      setRecommendations(getRecommendations({ menus, orders, reviews, requests }));
    }
    load().catch((error) => setMessage(error.message)).finally(() => setLoading(false));
  }, []);

  return (
    <PageShell>
      <PageHeader title="맞춤형 메뉴 추천" description="주문 이력, 리뷰 별점, 요청 메뉴를 기준으로 추천 이유를 함께 제공합니다." />
      {message ? <p className="mb-5 rounded-md bg-blue-50 p-3 text-sm font-semibold text-blue-700">{message}</p> : null}
      {loading ? <EmptyState title="추천을 계산하는 중" description="소비자 데이터를 기반으로 추천 규칙을 적용하고 있습니다." /> : null}
      {!loading && recommendations.length === 0 ? <EmptyState title="추천할 메뉴가 없습니다" description="활성 메뉴와 리뷰 데이터를 확인해주세요." /> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((recommendation) => <RecommendationCard key={recommendation.menu.id} recommendation={recommendation} />)}
      </div>
    </PageShell>
  );
}

