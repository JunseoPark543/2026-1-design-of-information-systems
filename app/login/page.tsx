"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageShell } from "@/components/PageShell";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDemoStart() {
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { data: current } = await supabase.auth.getUser();

    if (current.user) {
      setLoading(false);
      router.push("/menus");
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signInAnonymously({
      options: { data: { name: "데모 사용자", gender: "선택 안 함" } },
    });

    if (error || !data.user) {
      setLoading(false);
      setMessage("데모 세션 시작에 실패했습니다. Supabase Auth에서 Anonymous sign-ins 설정을 켰는지 확인해주세요.");
      return;
    }

    await supabase.from("profiles").upsert({
      id: data.user.id,
      name: "데모 사용자",
      gender: "선택 안 함",
    });

    setLoading(false);
    router.push("/menus");
    router.refresh();
  }

  return (
    <PageShell className="flex min-h-[calc(100vh-72px)] items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-slate-950">데모 시작</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">별도 계정 정보 없이 현재 브라우저에서 사용할 소비자 세션을 시작합니다.</p>
        {message ? <p className="mt-5 rounded-md bg-rose-50 p-3 text-sm font-medium text-rose-700">{message}</p> : null}
        <div className="mt-6 grid gap-3">
          <Button onClick={handleDemoStart} disabled={loading}>{loading ? "시작 중" : "데모 세션 시작"}</Button>
          <Link href="/signup" className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">
            프로필 입력하고 시작
          </Link>
        </div>
      </Card>
    </PageShell>
  );
}