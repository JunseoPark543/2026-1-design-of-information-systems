import type { ReactNode } from "react";

export function StatCard({ title, value, helper, icon }: { title: string; value: string; helper?: string; icon?: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
        </div>
        {icon ? <div className="flex h-11 w-11 items-center justify-center rounded-md bg-blue-50 text-blue-700">{icon}</div> : null}
      </div>
      {helper ? <p className="mt-3 text-sm text-slate-500">{helper}</p> : null}
    </section>
  );
}
