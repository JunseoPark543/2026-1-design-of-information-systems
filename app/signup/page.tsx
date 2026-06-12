"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageShell } from "@/components/PageShell";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", gender: "선택 안 함", age: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    async function loadExistingProfile() {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setProfileLoaded(true);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("name, phone, gender, age")
        .eq("id", auth.user.id)
        .maybeSingle();

      if (data) {
        setForm({
          name: data.name ?? "",
          phone: data.phone ?? "",
          gender: data.gender ?? "선택 안 함",
          age: data.age ? String(data.age) : "",
        });
      } else {
        setForm((current) => ({
          ...current,
          name: (auth.user.user_metadata?.name as string | undefined) ?? current.name,
          gender: (auth.user.user_metadata?.gender as string | undefined) ?? current.gender,
        }));
      }

      setProfileLoaded(true);
    }

    loadExistingProfile().catch(() => setProfileLoaded(true));
  }, []);

  function updateField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const profile = {
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      gender: form.gender,
      age: form.age ? Number(form.age) : null,
    };

    const { data: currentAuth } = await supabase.auth.getUser();
    let userId = currentAuth.user?.id;

    if (!userId) {
      const { data, error } = await supabase.auth.signInAnonymously({
        options: { data: profile },
      });

      if (error || !data.user) {
        setLoading(false);
        setMessage("소비자 정보를 저장할 수 없습니다. Supabase Auth에서 Anonymous sign-ins 설정을 켰는지 확인해주세요.");
        return;
      }

      userId = data.user.id;
    } else {
      await supabase.auth.updateUser({ data: profile });
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      ...profile,
    });

    setLoading(false);

    if (profileError) {
      setMessage(profileError.message);
      return;
    }

    setMessage("소비자 정보가 저장되었습니다.");
    router.push("/menus");
    router.refresh();
  }

  return (
    <PageShell className="flex min-h-[calc(100vh-72px)] items-center justify-center">
      <Card className="w-full max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-slate-950">소비자 정보 등록</h1>
        <p className="mt-2 text-sm text-slate-600">한 번 등록한 정보는 현재 브라우저 세션에 유지되며, 다시 방문하면 같은 프로필을 수정할 수 있습니다.</p>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            이름
            <input className="h-11 rounded-md border border-slate-300 px-3 font-normal" value={form.name} onChange={(event) => updateField("name", event.target.value)} disabled={!profileLoaded} required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            전화번호
            <input className="h-11 rounded-md border border-slate-300 px-3 font-normal" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} disabled={!profileLoaded} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            성별
            <select className="h-11 rounded-md border border-slate-300 px-3 font-normal" value={form.gender} onChange={(event) => updateField("gender", event.target.value)} disabled={!profileLoaded}>
              <option>선택 안 함</option>
              <option>남성</option>
              <option>여성</option>
              <option>기타</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            나이
            <input className="h-11 rounded-md border border-slate-300 px-3 font-normal" type="number" min="1" max="120" value={form.age} onChange={(event) => updateField("age", event.target.value)} disabled={!profileLoaded} />
          </label>
          {message ? <p className="rounded-md bg-blue-50 p-3 text-sm font-medium text-blue-700 sm:col-span-2">{message}</p> : null}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading || !profileLoaded} className="w-full">{loading ? "저장 중" : "정보 저장하고 시작"}</Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}