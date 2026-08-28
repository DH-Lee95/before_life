"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

type Confirmation = { profileId: string; purchasedSouls: number; balance: number };

export function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function confirm() {
      try {
        const paymentKey = searchParams.get("paymentKey") ?? "";
        const orderId = searchParams.get("orderId") ?? "";
        const amount = Number(searchParams.get("amount"));
        if (!paymentKey || !orderId || !Number.isSafeInteger(amount)) throw new Error("결제 정보가 올바르지 않습니다.");
        const response = await fetch("/api/payment/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });
        const data = await response.json() as Confirmation & { message?: string };
        if (!response.ok) throw new Error(data.message ?? "결제 승인을 완료하지 못했습니다.");
        if (active) setConfirmation(data);
      } catch (error) {
        if (active) setErrorMessage(error instanceof Error ? error.message : "결제 승인을 완료하지 못했습니다.");
      }
    }
    void confirm();
    return () => { active = false; };
  }, [searchParams]);

  if (errorMessage) {
    return <PaymentMessage title="결제 확인이 필요해요" body={errorMessage} href="/" linkLabel="처음으로 돌아가기" />;
  }
  if (!confirmation) {
    return (
      <section className="text-center text-archive-text">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-archive-rose" aria-hidden />
        <h1 className="mt-5 text-2xl font-semibold">결제를 확인하고 있어요</h1>
        <p className="mt-3 text-sm text-archive-body">이 화면을 닫지 말고 잠시만 기다려주세요.</p>
      </section>
    );
  }
  return (
    <section className="text-center text-archive-text">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-archive-green/15 text-archive-green"><Check className="h-6 w-6" aria-hidden /></span>
      <h1 className="mt-5 text-2xl font-semibold">{confirmation.purchasedSouls}소울이 충전됐어요</h1>
      <p className="mt-3 text-sm text-archive-body">현재 잔액은 {confirmation.balance}소울입니다.</p>
      <Link href={`/result/${confirmation.profileId}`} className="mt-7 flex h-13 items-center justify-center rounded-lg bg-archive-text text-sm font-semibold text-archive-bg">결과로 돌아가기</Link>
    </section>
  );
}

function PaymentMessage({ title, body, href, linkLabel }: { title: string; body: string; href: string; linkLabel: string }) {
  return (
    <section className="text-center text-archive-text">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-archive-body">{body}</p>
      <Link href={href} className="mt-7 flex h-13 items-center justify-center rounded-lg bg-archive-text text-sm font-semibold text-archive-bg">{linkLabel}</Link>
    </section>
  );
}
