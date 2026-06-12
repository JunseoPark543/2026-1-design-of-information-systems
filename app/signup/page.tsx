"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageShell } from "@/components/PageShell";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "", gender: "선택 안 함", age: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const profile = { name: form.name, phone: form.phone, gender: form.gender, age: form.age ? Number(form.age) : null };
    const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: profile } });

    if (error || !data.user) {
      setLoading(false);
      setMessage(error?.message ?? "회원가입에 실패했습니다.");
      return;
    }

    if (data.session) {
      const { error: profileError } = await supabase.from("profiles").upsert({ id: data.user.id, ...profile });
      if (profileError) {
        setLoading(false);
        setMessage(profileError.message);
        return;
      }
      setLoading(false);
      router.push("/menus");
      router.refresh();
      return;
    }

    setLoading(false);
    setMessage("회원가입이 완료되었습니다. 이메일 인증이 켜져 있다면 인증 후 로그인하세요.");
    router.push("/login");
  }

  return (
    <PageShell className="flex min-h-[calc(100vh-72px)] items-center justify-center">
      <Card className="w-full max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-slate-950">회원가입</h1>
        <p className="mt-2 text-sm text-slate-600">프로필 정보는 추천과 주문 내역 관리에 사용됩니다.</p>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">이메일<input className="h-11 rounded-md border border-slate-300 px-3 font-normal" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required /></label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">비밀번호<input className="h-11 rounded-md border border-slate-300 px-3 font-normal" type="password" minLength={6} value={form.password} onChange={(event) => updateField("password", event.target.value)} required /></label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">이름<input className="h-11 rounded-md border border-slate-300 px-3 font-normal" value={form.name} onChange={(event) => updateField("name", event.target.value)} required /></label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">전화번호<input className="h-11 rounded-md border border-slate-300 px-3 font-normal" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} /></label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">성별<select className="h-11 rounded-md border border-slate-300 px-3 font-normal" value={form.gender} onChange={(event) => updateField("gender", event.target.value)}><option>선택 안 함</option><option>남성</option><option>여성</option><option>기타</option></select></label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">나이<input className="h-11 rounded-md border border-slate-300 px-3 font-normal" type="number" min="1" max="120" value={form.age} onChange={(event) => updateField("age", event.target.value)} /></label>
          {message ? <p className="rounded-md bg-rose-50 p-3 text-sm font-medium text-rose-700 sm:col-span-2">{message}</p> : null}
          <div className="sm:col-span-2"><Button type="submit" disabled={loading} className="w-full">{loading ? "가입 중" : "회원가입"}</Button></div>
        </form>
        <p className="mt-5 text-sm text-slate-600">이미 계정이 있나요? <Link href="/login" className="font-bold text-blue-700">로그인</Link></p>
      </Card>
    </PageShell>
  );
}
