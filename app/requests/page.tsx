"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/Card";
import { PageHeader, PageShell } from "@/components/PageShell";
import { createClient } from "@/lib/supabase/client";
import { fetchMyRequests, getCurrentProfileId } from "@/lib/supabase-queries";
import type { MenuRequest } from "@/lib/types";

export default function RequestsPage() {
  const router = useRouter();
  const [requestedName, setRequestedName] = useState("");
  const [requests, setRequests] = useState<MenuRequest[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadRequests() {
    const profileId = await getCurrentProfileId();
    if (!profileId) return;
    setRequests(await fetchMyRequests(profileId));
  }

  useEffect(() => {
    loadRequests().catch((error) => setMessage(error.message));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const normalizedName = requestedName.trim();
    if (!normalizedName) {
      setLoading(false);
      setMessage("요청할 메뉴명을 입력해주세요.");
      return;
    }

    const profileId = await getCurrentProfileId();
    if (!profileId) {
      setLoading(false);
      setMessage("회원정보 등록 후 메뉴 요청을 저장할 수 있습니다.");
      router.push("/signup");
      return;
    }

    const supabase = createClient();
    const { data: existing, error: findError } = await supabase
      .from("menu_requests")
      .select("id, request_count")
      .eq("user_id", profileId)
      .ilike("requested_name", normalizedName)
      .maybeSingle();

    if (findError) {
      setLoading(false);
      setMessage(findError.message);
      return;
    }

    const mutation = existing
      ? supabase.from("menu_requests").update({ request_count: existing.request_count + 1 }).eq("id", existing.id)
      : supabase.from("menu_requests").insert({ user_id: profileId, requested_name: normalizedName, request_count: 1 });

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
      <PageHeader title="원하는 메뉴 요청" description="먹고 싶은 메뉴를 남기면 맞춤 추천과 관리자 신메뉴 후보 분석에 반영됩니다." />
      <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-blue-200 bg-blue-50/60 p-5 shadow-sm">
        <label className="grid gap-2 text-sm font-bold text-slate-800">
          요청할 메뉴명
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input className="h-12 rounded-md border border-slate-300 bg-white px-3 font-normal" value={requestedName} onChange={(event) => setRequestedName(event.target.value)} placeholder="예: 말차라떼, 토마토 파스타" required />
            <Button type="submit" disabled={loading} className="h-12 px-6">{loading ? "저장 중" : "메뉴 요청하기"}</Button>
          </div>
        </label>
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
