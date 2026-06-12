export type Gender = "남성" | "여성" | "기타" | "선택 안 함";

export type Profile = {
  id: string;
  name: string | null;
  phone: string | null;
  gender: string | null;
  age: number | null;
  role?: string | null;
  signup_year?: number | null;
  signup_month?: number | null;
  signup_day?: number | null;
  created_at: string;
};

export type Menu = {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  average_rating?: number | null;
  review_count?: number | null;
  sold_count?: number | null;
};

export type Order = {
  id: number;
  user_id: string | null;
  ordered_at: string;
  total_amount: number;
};

export type OrderItem = {
  id: number;
  order_id: number;
  menu_id: number;
  quantity: number;
  unit_price: number;
  menus?: Menu | null;
};

export type OrderWithItems = Order & { order_items: OrderItem[] };

export type Review = {
  id: number;
  user_id: string | null;
  menu_id: number;
  rating: number;
  content: string | null;
  created_at: string;
  menus?: Pick<Menu, "id" | "name" | "category"> | null;
};

export type MenuRequest = {
  id: number;
  user_id: string | null;
  requested_name: string;
  request_count: number;
  created_at: string;
};

export type CartLine = { menu: Menu; quantity: number };

export type Recommendation = {
  menu: Menu;
  reason: string;
  score: number;
  source: "order" | "request" | "high-rating" | "popular" | "category-shift";
};

export type AdminMenuMetric = {
  menu_id: number;
  name: string;
  category: string;
  price: number;
  is_active: boolean;
  sold_count: number;
  revenue: number;
  average_rating: number | null;
  review_count: number;
};

export type AdminInsight = {
  title: string;
  content: string;
  type: "improve" | "promote" | "maintain" | "new-menu" | "replace";
  menuName?: string;
};

export type AdminProfileSummary = {
  id: string;
  name: string | null;
  phone: string | null;
  gender: string | null;
  age: number | null;
  signup_year: number | null;
  signup_month: number | null;
  signup_day: number | null;
  created_at: string;
  order_count: number;
  total_spent: number;
  review_count: number;
  request_count: number;
};

export type AdminOrderSummary = {
  order_id: number;
  user_id: string | null;
  ordered_at: string;
  total_amount: number;
  item_count: number;
  menu_summary: string | null;
};
