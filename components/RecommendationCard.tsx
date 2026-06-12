import { Sparkles, Star } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { Recommendation } from "@/lib/types";

export function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const { menu } = recommendation;
  return (
    <article className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700"><Sparkles className="h-3.5 w-3.5" />{menu.category}</span>
          <h3 className="mt-3 text-xl font-bold text-slate-950">{menu.name}</h3>
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold text-amber-600"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{(menu.average_rating ?? 0).toFixed(1)}</div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{menu.description}</p>
      <div className="mt-5 rounded-md bg-slate-50 p-3 text-sm font-medium leading-6 text-slate-700">{recommendation.reason}</div>
      <p className="mt-4 text-lg font-bold text-slate-950">{formatCurrency(menu.price)}</p>
    </article>
  );
}
