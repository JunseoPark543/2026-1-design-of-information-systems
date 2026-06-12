"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageShell } from "@/components/PageShell";
import { buildAuthEmailFromPhone, getSignupDateParts, normalizePhone } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

const initialSignupParts = getSignupDateParts();

const initialForm = {
  name: "",
  phone: "",
  gender: "선택 안 함",
  age: "",
  password: "",
  passwordConfirm: "",
};

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [signupParts, setSignupParts] = useState(initialSignupParts);

  useEffect(() => {
    async function loadExistingProfile() {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();

      if (!auth.user) {
        setProfileLoaded(true);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("name, phone, gender, age, signup_year, signup_month, signup_day")
        .eq("id", auth.user.id)
        .maybeSingle();

      if (error) {
        setMessage(error.message);
        setProfileLoaded(true);
        return;
      }

      if (data) {
        setHasExistingProfile(true);
        setForm({
          ...initialForm,
          name: data.name ?? "",
          phone: data.phone ?? "",
          gender: data.gender ?? "선택 안 함",
          age: data.age ? String(data.age) : "",
        });
        setSignupParts({
          signup_year: data.signup_year ?? initialSignupParts.signup_year,
          signup_month: data.signup_month ?? initialSignupParts.signup_month,
          signup_day: data.signup_day ?? initialSignupParts.signup_day,
        });
      }

      setProfileLoaded(true);
    }

    loadExistingProfile().catch((error) => {
      setMessage(error.message);
      setProfileLoaded(true);
    });
  }, []);

  function updateField(name: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const normalizedPhone = normalizePhone(form.phone);
    const profile = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      gender: form.gender,
      age: form.age ? Number(form.age) : null,
      role: "consumer",
      ...signupParts,
    };

    if (!profile.name) {
      setLoading(false);
      setMessage("이름을 입력해주세요.");
      return;
    }

    if (normalizedPhone.length < 8) {
      setLoading(false);
      setMessage("로그인에 사용할 전화번호를 입력해주세요.");
      return;
    }

    const { data: currentAuth } = await supabase.auth.getUser();
    let userId = currentAuth.user?.id;

    if (!userId) {
      if (form.password.length < 6) {
        setLoading(false);
        setMessage("비밀번호는 6자 이상 입력해주세요.");
        return;
      }

      if (form.password !== form.passwordConfirm) {
        setLoading(false);
        setMessage("비밀번호 확인이 일치하지 않습니다.");
        return;
      }

      const authEmail = buildAuthEmailFromPhone(form.phone);
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: authEmail,
        password: form.password,
        options: { data: profile },
      });

      if (signupError) {
        const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: form.password,
        });

        if (signinError || !signinData.user) {
          setLoading(false);
          setMessage(signupError.message);
          return;
        }

        userId = signinData.user.id;
      } else if (signupData.session?.user) {
        userId = signupData.session.user.id;
      } else if (signupData.user) {
        const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: form.password,
        });

        if (signinError || !signinData.user) {
          setLoading(false);
          setMessage("회원가입은 되었지만 바로 로그인되지 않았습니다. Supabase Auth에서 이메일 확인 옵션을 끄거나 로그인 페이지에서 다시 시도해주세요.");
          return;
        }

        userId = signinData.user.id;
      }
    }

    if (!userId) {
      setLoading(false);
      setMessage("회원 정보를 저장할 사용자 정보를 찾지 못했습니다.");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({ id: userId, ...profile }, { onConflict: "id" });

    if (profileError) {
      setLoading(false);
      setMessage(profileError.message);
      return;
    }

    await supabase.auth.updateUser({ data: profile });

    setHasExistingProfile(true);
    setLoading(false);
    setMessage("회원 정보가 저장되었습니다.");
    router.push("/menus");
    router.refresh();
  }

  return (
    <PageShell className="flex min-h-[calc(100vh-72px)] items-center justify-center">
      <Card className="w-full max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-slate-950">{hasExistingProfile ? "내 정보 수정" : "회원가입"}</h1>
        <p className="mt-2 text-sm text-slate-600">회원 정보는 주문, 별점, 메뉴 요청, 추천 기능에 연결됩니다. 전화번호와 비밀번호로 다시 로그인할 수 있습니다.</p>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            이름
            <input className="h-11 rounded-md border border-slate-300 px-3 font-normal" value={form.name} onChange={(event) => updateField("name", event.target.value)} disabled={!profileLoaded} required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            전화번호
            <input className="h-11 rounded-md border border-slate-300 px-3 font-normal" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} disabled={!profileLoaded || hasExistingProfile} placeholder="01012345678" required />
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
          {!hasExistingProfile ? (
            <>
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                비밀번호
                <input className="h-11 rounded-md border border-slate-300 px-3 font-normal" type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} disabled={!profileLoaded} minLength={6} required />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                비밀번호 확인
                <input className="h-11 rounded-md border border-slate-300 px-3 font-normal" type="password" value={form.passwordConfirm} onChange={(event) => updateField("passwordConfirm", event.target.value)} disabled={!profileLoaded} minLength={6} required />
              </label>
            </>
          ) : null}
          <div className="rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-600 sm:col-span-2">
            가입일: {signupParts.signup_year}년 {signupParts.signup_month}월 {signupParts.signup_day}일
          </div>
          {message ? <p className="rounded-md bg-blue-50 p-3 text-sm font-medium text-blue-700 sm:col-span-2">{message}</p> : null}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading || !profileLoaded} className="w-full">{loading ? "저장 중" : hasExistingProfile ? "회원 정보 수정" : "회원가입"}</Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}


