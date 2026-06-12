"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/Card";
import { MenuCard } from "@/components/MenuCard";
import { PageHeader, PageShell } from "@/components/PageShell";
import { fetchActiveMenus } from "@/lib/supabase-queries";
import type { CartLine, Menu } from "@/lib/types";

const CART_KEY = "tasteops-cart";

function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as CartLine[]; } catch { return []; }
}

function saveCart(lines: CartLine[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event("cart-updated"));
}

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [category, setCategory] = useState("전체");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveMenus().then(setMenus).catch((error) => setMessage(error.message)).finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ["전체", ...Array.from(new Set(menus.map((menu) => menu.category)))], [menus]);
  const filteredMenus = category === "전체" ? menus : menus.filter((menu) => menu.category === category);

  function handleAdd(menu: Menu) {
    const current = readCart();
    const existing = current.find((line) => line.menu.id === menu.id);
    const next = existing ? current.map((line) => line.menu.id === menu.id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { menu, quantity: 1 }];
    saveCart(next);
    setMessage(`${menu.name}을 장바구니에 담았습니다.`);
  }

  return (
    <PageShell>
      <PageHeader title="메뉴 조회" description="카테고리별 메뉴와 평균 별점을 확인하고 장바구니에 담아 주문할 수 있습니다." />
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-md px-4 py-2 text-sm font-bold transition ${category === item ? "bg-blue-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"}`}>{item}</button>)}
      </div>
      {message ? <p className="mb-5 rounded-md bg-blue-50 p-3 text-sm font-semibold text-blue-700">{message}</p> : null}
      {loading ? <EmptyState title="메뉴를 불러오는 중" description="Supabase에서 메뉴와 평점 정보를 가져오고 있습니다." /> : null}
      {!loading && filteredMenus.length === 0 ? <EmptyState title="메뉴가 없습니다" description="선택한 카테고리에 활성 메뉴가 없습니다." /> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMenus.map((menu) => <MenuCard key={menu.id} menu={menu} onAdd={handleAdd} />)}
      </div>
    </PageShell>
  );
}
