import { AlertTriangle, Megaphone, PlusCircle, Trophy, Wrench } from "lucide-react";
import type { AdminInsight } from "@/lib/types";

const styles = {
  improve: { icon: Wrench, className: "bg-rose-50 text-rose-700 border-rose-100" },
  promote: { icon: Megaphone, className: "bg-sky-50 text-sky-700 border-sky-100" },
  maintain: { icon: Trophy, className: "bg-amber-50 text-amber-700 border-amber-100" },
  "new-menu": { icon: PlusCircle, className: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  replace: { icon: AlertTriangle, className: "bg-orange-50 text-orange-700 border-orange-100" },
};

export function InsightCard({ insight }: { insight: AdminInsight }) {
  const style = styles[insight.type];
  const Icon = style.icon;
  return (
    <article className={`rounded-lg border p-4 ${style.className}`}>
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h3 className="font-bold">{insight.title}</h3>
          <p className="mt-1 text-sm leading-6">{insight.content}</p>
        </div>
      </div>
    </article>
  );
}
