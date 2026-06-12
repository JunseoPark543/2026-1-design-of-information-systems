"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, ClipboardPlus, Coffee, LogOut, Menu as MenuIcon, Settings, ShoppingCart, Sparkles, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { ADMIN_ACCESS_KEY } from "@/components/AdminGate";
import { createClient } from "@/lib/supabase/client";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAdminArea = pathname.startsWith("/admin");
  const [userLabel, setUserLabel] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function loadUserLabel() {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      setUserLabel(null);
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("name").eq("id", data.user.id).maybeSingle();
    const metadataName = data.user.user_metadata?.name as string | undefined;
    setUserLabel(profile?.name || metadataName || "소비자");
  }

  useEffect(() => {
    loadUserLabel();
    const supabase = createClient();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUserLabel();
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.sessionStorage.removeItem(ADMIN_ACCESS_KEY);
    window.localStorage.removeItem(ADMIN_ACCESS_KEY);
    setUserLabel(null);
    router.push("/");
    router.refresh();
  }

  const consumerLinks = [
    { href: "/menus", label: "메뉴", icon: Coffee },
    { href: "/cart", label: "장바구니", icon: ShoppingCart },
    { href: "/requests", label: "메뉴 요청", icon: ClipboardPlus },
    { href: "/recommendations", label: "추천", icon: Sparkles },
  ];

  const adminLinks = [
    { href: "/admin", label: "대시보드", icon: BarChart3 },
    { href: "/admin/menus", label: "메뉴 관리", icon: Settings },
  ];

  const links = isAdminArea ? adminLinks : consumerLinks;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-base font-bold text-slate-950">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-white">T</span>
          TasteOps
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              <Icon className="h-4 w-4" />{label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {userLabel ? (
            <>
              {!isAdminArea ? (
                <Link href="/signup" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  <UserRound className="h-4 w-4" />내 정보
                </Link>
              ) : null}
              <span className="max-w-40 truncate text-sm text-slate-500">{userLabel}</span>
              <button onClick={handleLogout} className="flex h-10 w-10 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100" aria-label="로그아웃">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">로그인</Link>
              <Link href="/signup" className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">회원가입</Link>
            </div>
          )}
        </div>
        <button onClick={() => setOpen((value) => !value)} className="flex h-10 w-10 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 md:hidden" aria-label="메뉴 열기">
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>
      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="grid gap-1">
            {links.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">{label}</Link>
            ))}
            {userLabel ? (
              <>
                {!isAdminArea ? <Link href="/signup" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">내 정보</Link> : null}
                <button onClick={handleLogout} className="rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100">로그아웃</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">로그인</Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">회원가입</Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
