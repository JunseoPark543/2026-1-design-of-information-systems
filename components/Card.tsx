import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}
