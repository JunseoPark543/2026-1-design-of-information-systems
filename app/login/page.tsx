"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageShell } from "@/components/PageShell";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("name").eq("id", data.user.id).maybeSingle();
      setName(profile?.name || (data.user.user_metadata?.name as string | undefined) || "소비자");
      setLoading(false);
    }

    loadSession().catch(() => setLoading(false));
  }, []);

  function continueSession() {
    router.push("/menus");
    router.refresh();
  }

  return (
    <PageShell className="flex min-h-[calc(100vh-72px)] items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-slate-950">로그인</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">이 서비스는 이메일 없이 현재 브라우저에 저장된 소비자 세션으로 로그인합니다.</p>
        {loading ? <p className="mt-5 rounded-md bg-slate-50 p-3 text-sm text-slate-600">저장된 세션을 확인하고 있습니다.</p> : null}
        {!loading && name ? (
          <div className="mt-6 grid gap-4">
            <p className="rounded-md bg-blue-50 p-3 text-sm font-semibold text-blue-700">{name}님으로 계속할 수 있습니다.</p>
            <Button onClick={continueSession}>계속하기</Button>
          </div>
        ) : null}
        {!loading && !name ? (
          <div className="mt-6 grid gap-4">
            <p className="rounded-md bg-amber-50 p-3 text-sm font-medium text-amber-700">저장된 회원 정보가 없습니다. 먼저 회원가입을 진행해주세요.</p>
            <Link href="/signup" className="inline-flex min-h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">회원가입으로 이동</Link>
          </div>
        ) : null}
      </Card>
    </PageShell>
  );
}