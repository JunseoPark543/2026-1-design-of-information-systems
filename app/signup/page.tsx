"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageShell } from "@/components/PageShell";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", gender: "선택 안 함", age: "" });
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
    const profile = {
      name: form.name,
      phone: form.phone,
      gender: form.gender,
      age: form.age ? Number(form.age) : null,
    };

    const { data, error } = await supabase.auth.signInAnonymously({
      options: { data: profile },
    });

    if (error || !data.user) {
      setLoading(false);
      setMessage("익명 사용자 시작에 실패했습니다. Supabase Auth에서 Anonymous sign-ins 설정을 켰는지 확인해주세요.");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      ...profile,
    });

    setLoading(false);

    if (profileError) {
      setMessage(profileError.message);
      return;
    }

    router.push("/menus");
    router.refresh();
  }

  return (
    <PageShell className="flex min-h-[calc(100vh-72px)] items-center justify-center">
      <Card className="w-full max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-slate-950">소비자 시작하기</h1>
        <p className="mt-2 text-sm text-slate-600">프로필 정보만 입력하면 바로 주문, 리뷰, 추천 기능을 사용할 수 있습니다.</p>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            이름
            <input className="h-11 rounded-md border border-slate-300 px-3 font-normal" value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            전화번호
            <input className="h-11 rounded-md border border-slate-300 px-3 font-normal" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            성별
            <select className="h-11 rounded-md border border-slate-300 px-3 font-normal" value={form.gender} onChange={(event) => updateField("gender", event.target.value)}>
              <option>선택 안 함</option>
              <option>남성</option>
              <option>여성</option>
              <option>기타</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            나이
            <input className="h-11 rounded-md border border-slate-300 px-3 font-normal" type="number" min="1" max="120" value={form.age} onChange={(event) => updateField("age", event.target.value)} />
          </label>
          {message ? <p className="rounded-md bg-rose-50 p-3 text-sm font-medium text-rose-700 sm:col-span-2">{message}</p> : null}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading} className="w-full">{loading ? "시작 중" : "프로필 만들고 시작"}</Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}