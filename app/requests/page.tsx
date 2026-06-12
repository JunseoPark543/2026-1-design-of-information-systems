"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/Card";
import { PageHeader, PageShell } from "@/components/PageShell";
import { createClient } from "@/lib/supabase/client";
import { fetchMyRequests, getCurrentUserId } from "@/lib/supabase-queries";
import type { MenuRequest } from "@/lib/types";

export default function RequestsPage() {
  const router = useRouter();
  const [requestedName, setRequestedName] = useState("");
  const [requests, setRequests] = useState<MenuRequest[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadRequests() {
    const userId = await getCurrentUserId();
    if (!userId) return;
    setRequests(await fetchMyRequests(userId));
  }

  useEffect(() => {
    loadRequests().catch((error) => setMessage(error.message));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const normalizedName = requestedName.trim();
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();

    if (!auth.user) {
      setLoading(false);
      setMessage("소비자 정보를 먼저 등록하면 메뉴 요청을 저장할 수 있습니다.");
      router.push("/signup");
      return;
    }

    const { data: existing, error: findError } = await supabase
      .from("menu_requests")
      .select("id, request_count")
      .eq("user_id", auth.user.id)
      .ilike("requested_name", normalizedName)
      .maybeSingle();

    if (findError) {
      setLoading(false);
      setMessage(findError.message);
      return;
    }

    const mutation = existing
      ? supabase.from("menu_requests").update({ request_count: existing.request_count + 1 }).eq("id", existing.id)
      : supabase.from("menu_requests").insert({ user_id: auth.user.id, requested_name: normalizedName, request_count: 1 });

    const { error } = await mutation;
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setRequestedName("");
    setMessage("요청 메뉴가 저장되었습니다.");
    await loadRequests();
  }

  return (
    <PageShell>
      <PageHeader title="요청 메뉴 등록" description="원하는 메뉴를 등록하면 추천과 관리자 신메뉴 후보 분석에 반영됩니다." />
      <form onSubmit={handleSubmit} className="mb-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[1fr_auto]">
        <input className="h-11 rounded-md border border-slate-300 px-3" value={requestedName} onChange={(event) => setRequestedName(event.target.value)} placeholder="예: 말차라떼, 토마토 파스타" required />
        <Button type="submit" disabled={loading}>{loading ? "저장 중" : "요청 등록"}</Button>
      </form>
      {message ? <p className="mb-5 rounded-md bg-blue-50 p-3 text-sm font-semibold text-blue-700">{message}</p> : null}
      {requests.length === 0 ? <EmptyState title="아직 요청한 메뉴가 없습니다" description="먹고 싶은 메뉴를 입력해보세요." /> : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {requests.map((request) => (
          <article key={request.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">{request.requested_name}</h2>
            <p className="mt-2 text-sm text-slate-500">요청 횟수 {request.request_count}회</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}