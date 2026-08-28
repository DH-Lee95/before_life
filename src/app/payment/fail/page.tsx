import Link from "next/link";
import { X } from "lucide-react";

type PaymentFailPageProps = {
  searchParams: Promise<{ code?: string }>;
};

export default async function PaymentFailPage({ searchParams }: PaymentFailPageProps) {
  const { code = "" } = await searchParams;
  const canceled = code === "PAY_PROCESS_CANCELED";
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 text-archive-text">
      <section className="w-full max-w-md text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-archive-rose/10 text-archive-rose"><X className="h-6 w-6" aria-hidden /></span>
        <h1 className="mt-5 text-2xl font-semibold">{canceled ? "결제가 취소됐어요" : "결제를 완료하지 못했어요"}</h1>
        <p className="mt-3 text-sm leading-6 text-archive-body">{canceled ? "실제로 청구된 금액은 없습니다." : "잠시 후 결과 화면에서 다시 시도해주세요."}</p>
        <Link href="/" className="mt-7 flex h-13 items-center justify-center rounded-lg bg-archive-text text-sm font-semibold text-archive-bg">결과로 돌아가기</Link>
      </section>
    </main>
  );
}
