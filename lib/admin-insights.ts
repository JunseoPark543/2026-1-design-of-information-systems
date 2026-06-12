import type { AdminInsight, AdminMenuMetric, MenuRequest } from "@/lib/types";

export function buildAdminInsights(metrics: AdminMenuMetric[], requests: MenuRequest[]): AdminInsight[] {
  const insights: AdminInsight[] = [];
  const maxSold = Math.max(...metrics.map((metric) => metric.sold_count), 0);
  const highOrderThreshold = Math.max(5, Math.ceil(maxSold * 0.6));

  metrics.forEach((metric) => {
    const rating = metric.average_rating ?? 0;

    if (metric.sold_count >= highOrderThreshold && rating > 0 && rating < 4) {
      insights.push({
        title: "개선 필요",
        content: `${metric.name}은 주문량이 많지만 평균 평점이 낮아 맛, 가격, 구성 점검이 필요합니다.`,
        type: "improve",
        menuName: metric.name,
      });
    }

    if (metric.sold_count > 0 && metric.sold_count < highOrderThreshold * 0.35 && rating >= 4.3) {
      insights.push({
        title: "홍보 강화 필요",
        content: `${metric.name}은 만족도가 높지만 주문량이 적어 추천 영역과 프로모션 노출을 늘릴 가치가 있습니다.`,
        type: "promote",
        menuName: metric.name,
      });
    }

    if (metric.sold_count >= highOrderThreshold && rating >= 4) {
      insights.push({
        title: "대표 메뉴 유지/홍보",
        content: `${metric.name}은 주문량과 평점이 모두 높아 대표 메뉴로 유지하고 세트 프로모션을 검토할 수 있습니다.`,
        type: "maintain",
        menuName: metric.name,
      });
    }
  });

  requests
    .filter((request) => request.request_count >= 3)
    .forEach((request) => {
      insights.push({
        title: "신메뉴 검토",
        content: `${request.requested_name} 요청이 ${request.request_count}회 누적되어 신메뉴 개발 후보로 검토할 수 있습니다.`,
        type: "new-menu",
        menuName: request.requested_name,
      });
    });

  return insights.slice(0, 10);
}
