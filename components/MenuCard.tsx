"use client";

import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/Button";
import { formatCurrency } from "@/lib/format";
import type { Menu } from "@/lib/types";

export function MenuCard({ menu, onAdd }: { menu: Menu; onAdd?: (menu: Menu) => void }) {
  return (
    <article className={`flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm ${!menu.is_active ? "opacity-60" : ""}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{menu.category}</span>
          <h3 className="mt-3 text-lg font-bold text-slate-950">{menu.name}</h3>
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold text-amber-600">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />{(menu.average_rating ?? 0).toFixed(1)}
        </div>
      </div>
      <p className="min-h-10 flex-1 text-sm leading-6 text-slate-600">{menu.description ?? "매장 추천 메뉴입니다."}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-slate-950">{formatCurrency(menu.price)}</p>
          <p className="text-xs text-slate-500">리뷰 {menu.review_count ?? 0}개</p>
        </div>
        {onAdd ? <Button onClick={() => onAdd(menu)} disabled={!menu.is_active}><ShoppingCart className="h-4 w-4" />담기</Button> : null}
      </div>
    </article>
  );
}
