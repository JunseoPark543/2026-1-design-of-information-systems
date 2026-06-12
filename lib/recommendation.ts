import type { Menu, MenuRequest, OrderWithItems, Recommendation, Review } from "@/lib/types";

type RecommendationInput = {
  menus: Menu[];
  orders: OrderWithItems[];
  reviews: Review[];
  requests: MenuRequest[];
};

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s/g, "");
}

function includesSimilarKeyword(menu: Menu, requestedName: string) {
  const target = normalizeText(requestedName);
  const name = normalizeText(menu.name);
  const category = normalizeText(menu.category);
  return name.includes(target) || target.includes(name) || category.includes(target) || target.includes(category);
}

function dedupeAndLimit(recommendations: Recommendation[], limit = 6) {
  const seen = new Set<number>();
  return recommendations
    .sort((a, b) => b.score - a.score)
    .filter((item) => {
      if (seen.has(item.menu.id)) return false;
      seen.add(item.menu.id);
      return true;
    })
    .slice(0, limit);
}

export function getRecommendations({ menus, orders, reviews, requests }: RecommendationInput): Recommendation[] {
  const activeMenus = menus.filter((menu) => menu.is_active);
  const orderedMenuIds = new Set<number>();
  const orderCountByMenu = new Map<number, number>();
  const ratingByMenu = new Map<number, { total: number; count: number }>();

  orders.forEach((order) => {
    order.order_items.forEach((item) => {
      orderedMenuIds.add(item.menu_id);
      orderCountByMenu.set(item.menu_id, (orderCountByMenu.get(item.menu_id) ?? 0) + item.quantity);
    });
  });

  reviews.forEach((review) => {
    const current = ratingByMenu.get(review.menu_id) ?? { total: 0, count: 0 };
    current.total += review.rating;
    current.count += 1;
    ratingByMenu.set(review.menu_id, current);
  });

  const ratedOrderedMenus = activeMenus
    .map((menu) => {
      const rating = ratingByMenu.get(menu.id);
      return { menu, quantity: orderCountByMenu.get(menu.id) ?? 0, userAverageRating: rating ? rating.total / rating.count : null };
    })
    .filter((item) => orderedMenuIds.has(item.menu.id));

  const highRatedHistory = ratedOrderedMenus.filter((item) => (item.userAverageRating ?? 0) >= 4);
  const lowRatedHistory = ratedOrderedMenus.filter((item) => item.userAverageRating !== null && item.userAverageRating < 4);
  const recommendations: Recommendation[] = [];

  if (highRatedHistory.length > 0) {
    const favoriteCategories = new Set(highRatedHistory.sort((a, b) => b.quantity - a.quantity).map((item) => item.menu.category));
    activeMenus
      .filter((menu) => favoriteCategories.has(menu.category) && !orderedMenuIds.has(menu.id))
      .forEach((menu) => recommendations.push({
        menu,
        reason: "최근 자주 주문했고 높은 별점을 준 메뉴와 같은 카테고리입니다.",
        score: 100 + (menu.average_rating ?? 0) * 5 + (menu.sold_count ?? 0),
        source: "order",
      }));
  }

  if (lowRatedHistory.length > 0 && highRatedHistory.length === 0) {
    const dislikedCategories = new Set(lowRatedHistory.map((item) => item.menu.category));
    activeMenus
      .filter((menu) => !dislikedCategories.has(menu.category) && !orderedMenuIds.has(menu.id))
      .forEach((menu) => recommendations.push({
        menu,
        reason: "평점이 낮았던 메뉴와 다른 카테고리에서 만족도가 높은 메뉴입니다.",
        score: 80 + (menu.average_rating ?? 0) * 5 + (menu.sold_count ?? 0),
        source: "category-shift",
      }));
  }

  requests.forEach((request) => {
    activeMenus
      .filter((menu) => includesSimilarKeyword(menu, request.requested_name) && !orderedMenuIds.has(menu.id))
      .forEach((menu) => recommendations.push({
        menu,
        reason: `요청한 메뉴 '${request.requested_name}'와 이름 또는 카테고리가 유사합니다.`,
        score: 90 + request.request_count * 4 + (menu.average_rating ?? 0) * 3,
        source: "request",
      }));
  });

  activeMenus
    .filter((menu) => (menu.average_rating ?? 0) >= 4)
    .forEach((menu) => recommendations.push({
      menu,
      reason: "최근 평균 별점이 4점 이상인 인기 메뉴입니다.",
      score: 60 + (menu.average_rating ?? 0) * 6 + (menu.sold_count ?? 0),
      source: "high-rating",
    }));

  if (recommendations.length === 0 || (orders.length === 0 && requests.length === 0)) {
    activeMenus.forEach((menu) => recommendations.push({
      menu,
      reason: "아직 데이터가 부족하여 전체 인기 메뉴를 추천합니다.",
      score: 30 + (menu.sold_count ?? 0) * 2 + (menu.average_rating ?? 0),
      source: "popular",
    }));
  }

  return dedupeAndLimit(recommendations);
}
