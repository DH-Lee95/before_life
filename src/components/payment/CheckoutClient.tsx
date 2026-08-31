"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ANONYMOUS, loadTossPayments, type TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { Archive, Loader2 } from "lucide-react";

type PublicIntent = {
  profileId: string;
  orderId: string;
  packId: string;
  amountKrw: number;
  souls: number;
  status: string;
};

export function CheckoutClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";
  const [intent, setIntent] = useState<PublicIntent | null>(null);
  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);
  const [ready, setReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function prepare() {
      try {
        if (!/^[A-Za-z0-9_-]{6,64}$/.test(orderId)) throw new Error("유효하지 않은 주문입니다.");
        const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY?.trim();
        if (!clientKey) throw new Error("결제 환경이 아직 준비되지 않았습니다.");
        const response = await fetch(`/api/payment/intents?orderId=${encodeURIComponent(orderId)}`);
        const data = await response.json() as PublicIntent & { message?: string };
        if (!response.ok) throw new Error(data.message ?? "주문을 불러오지 못했습니다.");
        if (data.status !== "pending") throw new Error("이미 처리된 주문입니다.");

        const tossPayments = await loadTossPayments(clientKey);
        const paymentWidgets = tossPayments.widgets({ customerKey: ANONYMOUS });
        await paymentWidgets.setAmount({ currency: "KRW", value: data.amountKrw });
        await Promise.all([
          paymentWidgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
          paymentWidgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
        ]);
        if (active) {
          setIntent(data);
          setWidgets(paymentWidgets);
          setReady(true);
        }
      } catch (error) {
        if (active) setErrorMessage(error instanceof Error ? error.message : "결제를 준비하지 못했습니다.");
      }
    }
    void prepare();
    return () => { active = false; };
  }, [orderId]);

  async function requestPayment() {
    if (!widgets || !intent) return;
    try {
      setReady(false);
      await widgets.requestPayment({
        orderId: intent.orderId,
        orderName: `전생서랍 ${intent.souls}소울`,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (error) {
      setReady(true);
      setErrorMessage(error instanceof Error ? error.message : "결제창을 열지 못했습니다.");
    }
  }

  return (
    <section className="mx-auto w-full max-w-md py-6 text-archive-text">
      <Link href={intent ? `/result/${intent.profileId}` : "/"} className="inline-flex items-center gap-2 text-sm text-archive-muted">
        <Archive className="h-4 w-4 text-archive-rose" aria-hidden /> 전생 서랍
      </Link>
      <div className="mt-6 rounded-xl border border-archive-line bg-archive-card p-5">
        <p className="text-xs font-semibold text-archive-rose">소울 충전</p>
        <h1 className="mt-2 text-2xl font-semibold">{intent ? `${intent.souls}소울 충전` : "결제를 준비하고 있어요"}</h1>
        {intent ? <p className="mt-2 text-sm text-archive-body">결제 금액 {intent.amountKrw.toLocaleString("ko-KR")}원</p> : null}
      </div>
      <div id="payment-method" className="mt-4 overflow-hidden rounded-xl bg-white" />
      <div id="agreement" className="mt-4 overflow-hidden rounded-xl bg-white" />
      {errorMessage ? <p className="mt-4 rounded-lg border border-archive-danger/40 bg-archive-danger/10 p-4 text-sm text-archive-danger">{errorMessage}</p> : null}
      <button type="button" disabled={!ready || !intent} onClick={() => void requestPayment()} className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-archive-text text-sm font-semibold text-archive-bg disabled:opacity-40">
        {!intent ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {intent ? `${intent.amountKrw.toLocaleString("ko-KR")}원 결제하기` : "준비 중"}
      </button>
      <p className="mt-3 text-center text-[11px] leading-5 text-archive-muted">
        결제하면 <Link href="/terms" className="underline">이용약관</Link> 및 <Link href="/refund" className="underline">환불 안내</Link>에 동의한 것으로 봅니다.
      </p>
      {process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY?.startsWith("test_") ? (
        <p className="mt-3 text-center text-[11px] leading-5 text-archive-muted">테스트 키를 사용하면 실제 금액은 차감되지 않습니다.</p>
      ) : null}
    </section>
  );
}
