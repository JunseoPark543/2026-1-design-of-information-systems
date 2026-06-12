"use client";

import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button, LinkButton } from "@/components/Button";
import { CartItem } from "@/components/CartItem";
import { EmptyState } from "@/components/Card";
import { PageHeader, PageShell } from "@/components/PageShell";
import { formatCurrency } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfileId } from "@/lib/supabase-queries";
import type { CartLine } from "@/lib/types";

const CART_KEY = "tasteops-cart";

function readCart(): CartLine[] {
  const raw = window.localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as CartLine[]; } catch { return []; }
}

function writeCart(lines: CartLine[]) { window.localStorage.setItem(CART_KEY, JSON.stringify(lines)); }

export default function CartPage() {
  const router = useRouter();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const total = useMemo(() => lines.reduce((sum, line) => sum + line.menu.price * line.quantity, 0), [lines]);

  useEffect(() => setLines(readCart()), []);

  function updateLines(next: CartLine[]) {
    setLines(next);
    writeCart(next);
  }

  async function handleOrder() {
    setLoading(true);
    setMessage("");

    const profileId = await getCurrentProfileId();
    if (!profileId) {
      setLoading(false);
      setMessage("회원정보 등록 후 주문할 수 있습니다.");
      router.push("/signup");
      return;
    }

    const supabase = createClient();
    const { data: order, error: orderError } = await supabase.from("orders").insert({ user_id: profileId, total_amount: total }).select("id").single();
    if (orderError || !order) {
      setLoading(false);
      setMessage(orderError?.message ?? "주문 생성에 실패했습니다.");
      return;
    }
    const { error: itemError } = await supabase.from("order_items").insert(lines.map((line) => ({ order_id: order.id, menu_id: line.menu.id, quantity: line.quantity, unit_price: line.menu.price })));
    setLoading(false);
    if (itemError) {
      setMessage(itemError.message);
      return;
    }
    updateLines([]);
    router.push("/orders");
    router.refresh();
  }

  return (
    <PageShell>
      <PageHeader title="장바구니" description="담은 메뉴를 확인하고 주문을 완료하세요." action={<LinkButton href="/menus" variant="secondary">메뉴 더 보기</LinkButton>} />
      {lines.length === 0 ? <EmptyState title="장바구니가 비어 있습니다" description="메뉴 페이지에서 원하는 메뉴를 담아주세요." /> : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-3">
            {lines.map((line) => <CartItem key={line.menu.id} line={line} onChange={(quantity) => updateLines(lines.map((item) => item.menu.id === line.menu.id ? { ...item, quantity } : item))} onRemove={() => updateLines(lines.filter((item) => item.menu.id !== line.menu.id))} />)}
          </div>
          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-blue-50 text-blue-700"><ShoppingBag className="h-5 w-5" /></div>
              <div><p className="text-sm font-semibold text-slate-500">총 주문 금액</p><p className="text-2xl font-bold text-slate-950">{formatCurrency(total)}</p></div>
            </div>
            {message ? <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm font-medium text-rose-700">{message}</p> : null}
            <Button onClick={handleOrder} disabled={loading || lines.length === 0} className="mt-5 w-full">{loading ? "주문 중" : "주문하기"}</Button>
          </aside>
        </div>
      )}
    </PageShell>
  );
}
