"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

type PublicIntent = { profileId: string; orderId: string; souls: number; status: string; message?: string };
const MAX_ATTEMPTS = 20;

export function PaymentSuccessClient() {
  const orderId = useSearchParams().get("orderId") ?? "";
  const [intent, setIntent] = useState<PublicIntent | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;
    async function checkStatus() {
      try {
        if (!/^[A-Za-z0-9_-]{6,64}$/.test(orderId)) throw new Error("결제 정보가 올바르지 않습니다.");
        const response = await fetch(`/api/payment/intents?orderId=${encodeURIComponent(orderId)}`, { cache: "no-store" });
        const data = await response.json() as PublicIntent;
        if (!response.ok) throw new Error(data.message ?? "결제 상태를 확인하지 못했습니다.");
        if (!active) return;
        if (data.status === "approved") {
          setIntent(data);
          return;
        }
        if (data.status === "canceled" || data.status === "failed" || data.status === "expired") {
          throw new Error("결제가 완료되지 않았습니다. 결과 화면에서 다시 시도해 주세요.");
        }
        attempt += 1;
        if (attempt >= MAX_ATTEMPTS) throw new Error("결제 확인이 늦어지고 있습니다. 잠시 후 결과 화면에서 잔액을 확인해 주세요.");
        timer = setTimeout(() => void checkStatus(), 1500);
      } catch (caught) {
        if (active) setErrorMessage(caught instanceof Error ? caught.message : "결제 상태를 확인하지 못했습니다.");
      }
    }
    void checkStatus();
    return () => { active = false; if (timer) clearTimeout(timer); };
  }, [orderId]);

  if (errorMessage) return <PaymentMessage body={errorMessage} />;
  if (!intent) {
    return (
      <section className="text-center text-archive-text">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-archive-rose" aria-hidden />
        <h1 className="mt-5 text-2xl font-semibold">결제를 확인하고 있어요</h1>
        <p className="mt-3 text-sm text-archive-body">페이앱의 결제 완료 알림을 기다리고 있습니다.</p>
      </section>
    );
  }
  return (
    <section className="text-center text-archive-text">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-archive-green/15 text-archive-green"><Check className="h-6 w-6" aria-hidden /></span>
      <h1 className="mt-5 text-2xl font-semibold">{intent.souls}소울이 충전됐어요</h1>
      <p className="mt-3 text-sm text-archive-body">결제가 안전하게 확인되었습니다.</p>
      <Link href={`/result/${intent.profileId}`} className="mt-7 flex h-13 items-center justify-center rounded-lg bg-archive-text text-sm font-semibold text-archive-bg">결과로 돌아가기</Link>
    </section>
  );
}

function PaymentMessage({ body }: { body: string }) {
  return (
    <section className="text-center text-archive-text">
      <h1 className="text-2xl font-semibold">결제 확인이 필요해요</h1>
      <p className="mt-3 text-sm leading-6 text-archive-body">{body}</p>
      <Link href="/" className="mt-7 flex h-13 items-center justify-center rounded-lg bg-archive-text text-sm font-semibold text-archive-bg">처음으로 돌아가기</Link>
    </section>
  );
}
