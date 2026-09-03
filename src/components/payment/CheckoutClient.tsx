"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Archive, Loader2 } from "lucide-react";

type PublicIntent = {
  profileId: string;
  orderId: string;
  packId: string;
  amountKrw: number;
  souls: number;
  status: string;
  checkoutUrl?: string;
};

export function CheckoutClient() {
  const orderId = useSearchParams().get("orderId") ?? "";
  const [intent, setIntent] = useState<PublicIntent | null>(null);
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function loadOrder() {
      try {
        if (!/^[A-Za-z0-9_-]{6,64}$/.test(orderId)) throw new Error("유효하지 않은 주문입니다.");
        const response = await fetch(`/api/payment/intents?orderId=${encodeURIComponent(orderId)}`);
        const data = await response.json() as PublicIntent & { message?: string };
        if (!response.ok) throw new Error(data.message ?? "주문을 불러오지 못했습니다.");
        if (data.status !== "pending") throw new Error("이미 처리된 주문입니다.");
        if (active) setIntent(data);
      } catch (caught) {
        if (active) setErrorMessage(caught instanceof Error ? caught.message : "결제를 준비하지 못했습니다.");
      }
    }
    void loadOrder();
    return () => { active = false; };
  }, [orderId]);

  async function requestPayment() {
    if (!intent || submitting) return;
    setErrorMessage("");
    if (intent.checkoutUrl) {
      window.open(intent.checkoutUrl, "_self");
      return;
    }
    if (!/^01\d[- ]?\d{3,4}[- ]?\d{4}$/.test(phone.trim())) {
      setErrorMessage("휴대폰 번호를 정확히 입력해 주세요.");
      return;
    }
    try {
      setSubmitting(true);
      const response = await fetch("/api/payment/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: intent.orderId, phone: phone.trim() }),
      });
      const data = await response.json() as { checkoutUrl?: string; message?: string };
      if (!response.ok || !data.checkoutUrl) throw new Error(data.message ?? "결제창을 열지 못했습니다.");
      window.open(data.checkoutUrl, "_self");
    } catch (caught) {
      setSubmitting(false);
      setErrorMessage(caught instanceof Error ? caught.message : "결제창을 열지 못했습니다.");
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
      {intent && !intent.checkoutUrl ? (
        <div className="mt-4 rounded-xl border border-archive-line bg-archive-card p-5">
          <label htmlFor="buyer-phone" className="text-sm font-semibold">휴대폰 번호</label>
          <input
            id="buyer-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="010-1234-5678"
            className="mt-3 h-12 w-full rounded-lg border border-archive-line bg-archive-bg px-4 text-base outline-none focus:border-archive-rose"
          />
          <p className="mt-2 text-xs leading-5 text-archive-muted">결제 안내에 필요한 번호이며 페이앱에만 전달되고 전생서랍에는 저장되지 않습니다.</p>
        </div>
      ) : null}
      {errorMessage ? <p className="mt-4 rounded-lg border border-archive-danger/40 bg-archive-danger/10 p-4 text-sm text-archive-danger">{errorMessage}</p> : null}
      <button type="button" disabled={!intent || submitting} onClick={() => void requestPayment()} className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-archive-text text-sm font-semibold text-archive-bg disabled:opacity-40">
        {!intent || submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {intent ? `${intent.amountKrw.toLocaleString("ko-KR")}원 결제하기` : "준비 중"}
      </button>
      <p className="mt-3 text-center text-[11px] leading-5 text-archive-muted">
        결제하면 <Link href="/terms" className="underline">이용약관</Link> 및 <Link href="/refund" className="underline">환불 안내</Link>에 동의한 것으로 봅니다.
      </p>
    </section>
  );
}
