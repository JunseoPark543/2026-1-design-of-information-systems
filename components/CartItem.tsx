"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { CartLine } from "@/lib/types";

export function CartItem({ line, onChange, onRemove }: { line: CartLine; onChange: (quantity: number) => void; onRemove: () => void }) {
  return (
    <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <p className="text-sm font-semibold text-blue-700">{line.menu.category}</p>
        <h3 className="mt-1 text-lg font-bold text-slate-950">{line.menu.name}</h3>
        <p className="mt-1 text-sm text-slate-500">{formatCurrency(line.menu.price)} x {line.quantity}</p>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="flex items-center rounded-md border border-slate-200">
          <button onClick={() => onChange(Math.max(1, line.quantity - 1))} className="flex h-10 w-10 items-center justify-center text-slate-700 hover:bg-slate-50" aria-label="수량 감소"><Minus className="h-4 w-4" /></button>
          <span className="w-10 text-center text-sm font-bold">{line.quantity}</span>
          <button onClick={() => onChange(line.quantity + 1)} className="flex h-10 w-10 items-center justify-center text-slate-700 hover:bg-slate-50" aria-label="수량 증가"><Plus className="h-4 w-4" /></button>
        </div>
        <p className="w-24 text-right font-bold text-slate-950">{formatCurrency(line.menu.price * line.quantity)}</p>
        <button onClick={onRemove} className="flex h-10 w-10 items-center justify-center rounded-md text-rose-600 hover:bg-rose-50" aria-label="삭제"><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
