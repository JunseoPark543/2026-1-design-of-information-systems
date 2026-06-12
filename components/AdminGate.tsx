"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

const ADMIN_ACCESS_KEY = "tasteops-admin-authorized";
const DEFAULT_ADMIN_CODE = "admin2026";

function getExpectedCode() {
  return process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE || DEFAULT_ADMIN_CODE;
}

export function AdminGate({ children }: { children: ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [checked, setChecked] = useState(false);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setAuthorized(window.localStorage.getItem(ADMIN_ACCESS_KEY) === "true");
    setChecked(true);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.trim() !== getExpectedCode()) {
      setMessage("관리자 접근 코드가 올바르지 않습니다.");
      return;
    }

    window.localStorage.setItem(ADMIN_ACCESS_KEY, "true");
    setAuthorized(true);
    setMessage("");
  }

  if (!checked) return null;
  if (authorized) return <>{children}</>;

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 text-blue-700">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-950">관리자 권한 확인</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">매출과 메뉴 관리 화면은 관리자 접근 코드가 필요합니다.</p>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            접근 코드
            <input className="h-11 rounded-md border border-slate-300 px-3 font-normal" value={code} onChange={(event) => setCode(event.target.value)} type="password" required />
          </label>
          {message ? <p className="rounded-md bg-rose-50 p-3 text-sm font-medium text-rose-700">{message}</p> : null}
          <Button type="submit">관리자 화면 열기</Button>
        </form>
      </Card>
    </div>
  );
}