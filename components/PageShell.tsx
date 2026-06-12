import type { ReactNode } from "react";

export function PageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <main className={`mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 ${className}`}>{children}</main>;
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-normal text-slate-950">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
