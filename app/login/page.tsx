"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageShell } from "@/components/PageShell";
import { buildAuthEmailFromPhone, normalizePhone } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSession() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setChecking(false);
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("name").eq("id", data.user.id).maybeSingle();
      setName(profile?.name || (data.user.user_metadata?.name as string | undefined) || "소비자");
      setChecking(false);
    }

    loadSession().catch(() => setChecking(false));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (normalizePhone(phone).length < 8) {
      setLoading(false);
      setMessage("전화번호를 입력해주세요.");
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: buildAuthEmailFromPhone(phone),
      password,
    });

    if (error || !data.user) {
      setLoading(false);
      setMessage("전화번호 또는 비밀번호가 올바르지 않습니다. 회원가입한 정보로 다시 시도해주세요.");
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("name").eq("id", data.user.id).maybeSingle();

    if (!profile) {
      setLoading(false);
      setMessage("로그인은 되었지만 회원 정보가 없습니다. 회원가입 페이지에서 이름과 전화번호를 저장해주세요.");
      return;
    }

    setLoading(false);
    router.push("/menus");
    router.refresh();
  }

  async function handleSwitchAccount() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setName(null);
    setMessage("다른 회원으로 로그인할 수 있습니다.");
  }

  return (
    <PageShell className="flex min-h-[calc(100vh-72px)] items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-slate-950">로그인</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">회원가입 때 입력한 전화번호와 비밀번호로 로그인합니다.</p>
        {checking ? <p className="mt-5 rounded-md bg-slate-50 p-3 text-sm text-slate-600">저장된 로그인 상태를 확인하고 있습니다.</p> : null}
        {!checking && name ? (
          <div className="mt-6 grid gap-3 rounded-md bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-700">현재 {name}님으로 로그인되어 있습니다.</p>
            <Button onClick={() => router.push("/menus")}>계속하기</Button>
            <Button type="button" variant="ghost" onClick={handleSwitchAccount}>다른 회원으로 로그인</Button>
          </div>
        ) : null}
        {!checking && !name ? (
          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              전화번호
              <input className="h-11 rounded-md border border-slate-300 px-3 font-normal" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="01012345678" required />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              비밀번호
              <input className="h-11 rounded-md border border-slate-300 px-3 font-normal" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required />
            </label>
            {message ? <p className="rounded-md bg-amber-50 p-3 text-sm font-medium text-amber-700">{message}</p> : null}
            <Button type="submit" disabled={loading}>{loading ? "로그인 중" : "로그인"}</Button>
            <Link href="/signup" className="text-center text-sm font-semibold text-blue-700 hover:text-blue-800">아직 회원이 아니라면 회원가입</Link>
          </form>
        ) : null}
      </Card>
    </PageShell>
  );
}
