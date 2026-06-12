"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageShell } from "@/components/PageShell";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    router.push("/menus");
    router.refresh();
  }

  return (
    <PageShell className="flex min-h-[calc(100vh-72px)] items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-slate-950">로그인</h1>
        <p className="mt-2 text-sm text-slate-600">주문, 리뷰, 추천 기능을 사용하려면 로그인하세요.</p>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">이메일<input className="h-11 rounded-md border border-slate-300 px-3 font-normal" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">비밀번호<input className="h-11 rounded-md border border-slate-300 px-3 font-normal" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          {message ? <p className="rounded-md bg-rose-50 p-3 text-sm font-medium text-rose-700">{message}</p> : null}
          <Button type="submit" disabled={loading}>{loading ? "로그인 중" : "로그인"}</Button>
        </form>
        <p className="mt-5 text-sm text-slate-600">계정이 없나요? <Link href="/signup" className="font-bold text-blue-700">회원가입</Link></p>
      </Card>
    </PageShell>
  );
}
