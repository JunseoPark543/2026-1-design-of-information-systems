"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/Card";
import { PageHeader, PageShell } from "@/components/PageShell";
import { formatCurrency } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { fetchMenus } from "@/lib/supabase-queries";
import type { Menu } from "@/lib/types";

type FormState = { id?: number; name: string; category: string; price: string; description: string; is_active: boolean };
const initialForm: FormState = { name: "", category: "", price: "", description: "", is_active: true };

export default function AdminMenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadMenus() {
    setMenus(await fetchMenus());
  }

  useEffect(() => {
    loadMenus().catch((error) => setMessage(error.message));
  }, []);

  function updateField(name: keyof FormState, value: string | boolean) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function editMenu(menu: Menu) {
    setForm({
      id: menu.id,
      name: menu.name,
      category: menu.category,
      price: String(menu.price),
      description: menu.description ?? "",
      is_active: menu.is_active,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function getAdminClient() {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();

    if (auth.user) return { supabase, ok: true as const };

    const { data, error } = await supabase.auth.signInAnonymously({
      options: { data: { name: "데모 관리자", gender: "선택 안 함" } },
    });

    if (error || !data.user) {
      return {
        supabase,
        ok: false as const,
        message: "메뉴 관리를 위해 Supabase Auth의 Anonymous sign-ins 설정을 켜주세요.",
      };
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      name: "데모 관리자",
      gender: "선택 안 함",
    });

    if (profileError) {
      return { supabase, ok: false as const, message: profileError.message };
    }

    return { supabase, ok: true as const };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const client = await getAdminClient();
    if (!client.ok) {
      setLoading(false);
      setMessage(client.message);
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      description: form.description.trim() || null,
      is_active: form.is_active,
    };

    const { error } = form.id
      ? await client.supabase.from("menus").update(payload).eq("id", form.id)
      : await client.supabase.from("menus").insert(payload);

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(form.id ? "메뉴가 수정되었습니다." : "메뉴가 추가되었습니다.");
    setForm(initialForm);
    await loadMenus();
  }

  async function deleteMenu(id: number) {
    if (!window.confirm("메뉴를 삭제할까요? 주문 이력이 있는 메뉴는 삭제 대신 비활성 처리를 권장합니다.")) return;

    setMessage("");
    const client = await getAdminClient();
    if (!client.ok) {
      setMessage(client.message);
      return;
    }

    const { error } = await client.supabase.from("menus").delete().eq("id", id);

    if (error) {
      setMessage(`${error.message} 주문 이력이 있는 메뉴라면 삭제 대신 수정에서 비활성 처리해주세요.`);
      return;
    }

    setMessage("메뉴가 삭제되었습니다.");
    await loadMenus();
  }

  return (
    <PageShell>
      <PageHeader title="관리자 메뉴 관리" description="메뉴 추가, 수정, 삭제, 활성 상태 변경을 할 수 있습니다. MVP에서는 데모 관리자 세션을 자동으로 시작합니다." />
      <form onSubmit={handleSubmit} className="mb-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_1fr_140px]">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          메뉴명
          <input className="h-11 rounded-md border border-slate-300 px-3 font-normal" value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          카테고리
          <input className="h-11 rounded-md border border-slate-300 px-3 font-normal" value={form.category} onChange={(event) => updateField("category", event.target.value)} required />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          가격
          <input className="h-11 rounded-md border border-slate-300 px-3 font-normal" type="number" min="0" value={form.price} onChange={(event) => updateField("price", event.target.value)} required />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700 lg:col-span-2">
          설명
          <input className="h-11 rounded-md border border-slate-300 px-3 font-normal" value={form.description} onChange={(event) => updateField("description", event.target.value)} />
        </label>
        <label className="flex items-center gap-2 pt-6 text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={form.is_active} onChange={(event) => updateField("is_active", event.target.checked)} />
          활성 메뉴
        </label>
        <div className="flex gap-2 lg:col-span-3">
          <Button type="submit" disabled={loading}>{loading ? "저장 중" : form.id ? "메뉴 수정" : "메뉴 추가"}</Button>
          {form.id ? <Button type="button" variant="ghost" onClick={() => setForm(initialForm)}>취소</Button> : null}
        </div>
      </form>
      {message ? <p className="mb-5 rounded-md bg-blue-50 p-3 text-sm font-semibold text-blue-700">{message}</p> : null}
      {menus.length === 0 ? <EmptyState title="등록된 메뉴가 없습니다" description="상단 폼에서 메뉴를 추가하세요." /> : null}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr_1fr] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 md:grid">
          <span>메뉴</span><span>카테고리</span><span>가격</span><span>상태</span><span>관리</span>
        </div>
        {menus.map((menu) => (
          <div key={menu.id} className="grid gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0 md:grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr_1fr] md:items-center">
            <div>
              <p className="font-bold text-slate-950">{menu.name}</p>
              <p className="mt-1 text-sm text-slate-500">{menu.description}</p>
            </div>
            <p className="text-sm font-semibold text-slate-700">{menu.category}</p>
            <p className="text-sm font-semibold text-slate-700">{formatCurrency(menu.price)}</p>
            <span className={`w-fit rounded-md px-2 py-1 text-xs font-bold ${menu.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{menu.is_active ? "활성" : "비활성"}</span>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => editMenu(menu)}>수정</Button>
              <Button type="button" variant="danger" onClick={() => deleteMenu(menu.id)}>삭제</Button>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}