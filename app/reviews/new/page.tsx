"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageHeader, PageShell } from "@/components/PageShell";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfileId } from "@/lib/supabase-queries";

function todayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function ReviewForm() {
  const router = useRouter();
  const params = useSearchParams();
  const menuId = Number(params.get("menuId"));
  const menuName = params.get("menuName") || "선택한 메뉴";
  const [rating, setRating] = useState(5);
  const [reviewDate, setReviewDate] = useState(todayInputValue());
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const profileId = await getCurrentProfileId();
    if (!profileId) {
      setLoading(false);
      setMessage("회원정보 등록 후 별점을 저장할 수 있습니다.");
      router.push("/signup");
      return;
    }

    const supabase = createClient();
    const createdAt = `${reviewDate}T00:00:00+09:00`;
    const { error } = await supabase
      .from("reviews")
      .upsert({ user_id: profileId, menu_id: menuId, rating, content: null, created_at: createdAt }, { onConflict: "user_id,menu_id" });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/orders");
    router.refresh();
  }

  return (
    <Card className="max-w-2xl p-6">
      <h2 className="text-xl font-bold text-slate-950">{menuName}</h2>
      <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          별점
          <select className="h-11 rounded-md border border-slate-300 px-3 font-normal" value={rating} onChange={(event) => setRating(Number(event.target.value))}>
            {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value}점</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          작성일자
          <input className="h-11 rounded-md border border-slate-300 px-3 font-normal" type="date" value={reviewDate} onChange={(event) => setReviewDate(event.target.value)} required />
        </label>
        {message ? <p className="rounded-md bg-rose-50 p-3 text-sm font-medium text-rose-700">{message}</p> : null}
        <Button type="submit" disabled={loading || !menuId}>{loading ? "저장 중" : "별점 저장"}</Button>
      </form>
    </Card>
  );
}

export default function NewReviewPage() {
  return (
    <PageShell>
      <PageHeader title="별점 작성" description="선택한 별점과 작성일자는 메뉴 평균 평점과 추천 로직에 반영됩니다." />
      <Suspense fallback={<Card className="p-6">별점 입력 화면을 불러오는 중입니다.</Card>}>
        <ReviewForm />
      </Suspense>
    </PageShell>
  );
}
