"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/Card";
import { PageHeader, PageShell } from "@/components/PageShell";
import { formatCurrency, formatDate } from "@/lib/format";
import { fetchMyOrders, getCurrentUserId } from "@/lib/supabase-queries";
import type { OrderWithItems } from "@/lib/types";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUserId()
      .then((userId) => {
        if (!userId) {
          setMessage("로그인 후 주문 내역을 확인할 수 있습니다.");
          return [];
        }
        return fetchMyOrders(userId);
      })
      .then(setOrders)
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell>
      <PageHeader title="내 주문 내역" description="주문한 메뉴를 확인하고 리뷰를 작성할 수 있습니다." />
      {message ? <p className="mb-5 rounded-md bg-blue-50 p-3 text-sm font-semibold text-blue-700">{message}</p> : null}
      {loading ? <EmptyState title="주문 내역을 불러오는 중" description="잠시만 기다려주세요." /> : null}
      {!loading && orders.length === 0 ? <EmptyState title="주문 내역이 없습니다" description="메뉴를 주문하면 이곳에서 확인할 수 있습니다." /> : null}
      <div className="grid gap-4">
        {orders.map((order) => (
          <section key={order.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="text-lg font-bold text-slate-950">주문 #{order.id}</h2><p className="text-sm text-slate-500">{formatDate(order.ordered_at)}</p></div>
              <p className="text-xl font-bold text-slate-950">{formatCurrency(order.total_amount)}</p>
            </div>
            <div className="mt-4 grid gap-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex flex-col gap-2 rounded-md bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="font-semibold text-slate-950">{item.menus?.name ?? `메뉴 #${item.menu_id}`}</p><p className="text-sm text-slate-500">{formatCurrency(item.unit_price)} x {item.quantity}</p></div>
                  <Link href={`/reviews/new?menuId=${item.menu_id}&menuName=${encodeURIComponent(item.menus?.name ?? "")}`} className="inline-flex min-h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">리뷰 작성</Link>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
