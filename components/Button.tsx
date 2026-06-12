import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
  secondary: "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
  ghost: "text-slate-700 hover:bg-slate-100",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
};

const baseClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55";

export function Button({ className = "", variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={`${baseClass} ${variants[variant]} ${className}`} {...props} />;
}

export function LinkButton({ className = "", variant = "primary", children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: Variant; children: ReactNode }) {
  return <Link className={`${baseClass} ${variants[variant]} ${className}`} {...props}>{children}</Link>;
}
