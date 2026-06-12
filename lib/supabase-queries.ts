import { createClient } from "@/lib/supabase/client";
import type { AdminMenuMetric, AdminProfileSummary, Menu, MenuRequest, OrderWithItems, Review } from "@/lib/types";

export async function getCurrentUserId() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}

export async function fetchMenus(): Promise<Menu[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("menu_metrics")
    .select("*")
    .order("is_active", { ascending: false })
    .order("category", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Menu[];
}

export async function fetchActiveMenus(): Promise<Menu[]> {
  const menus = await fetchMenus();
  return menus.filter((menu) => menu.is_active);
}

export async function fetchMyOrders(userId: string): Promise<OrderWithItems[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, menus(*))")
    .eq("user_id", userId)
    .order("ordered_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as OrderWithItems[];
}

export async function fetchMyReviews(userId: string): Promise<Review[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, menus(id, name, category)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Review[];
}

export async function fetchMyRequests(userId: string): Promise<MenuRequest[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("menu_requests")
    .select("*")
    .eq("user_id", userId)
    .order("request_count", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MenuRequest[];
}

export async function fetchAdminMenuMetrics(): Promise<AdminMenuMetric[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("admin_menu_metrics").select("*").order("sold_count", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminMenuMetric[];
}

export async function fetchAllMenuRequests(): Promise<MenuRequest[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("menu_request_summary").select("*").order("request_count", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MenuRequest[];
}

export async function fetchAdminProfiles(): Promise<AdminProfileSummary[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("admin_profile_summary")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminProfileSummary[];
}