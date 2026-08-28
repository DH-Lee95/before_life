import { Suspense } from "react";

import { CheckoutClient } from "@/components/payment/CheckoutClient";

export default function CheckoutPage() {
  return (
    <main className="min-h-dvh px-5 text-archive-text">
      <Suspense fallback={<p className="py-12 text-center text-sm text-archive-body">결제를 준비하는 중</p>}>
        <CheckoutClient />
      </Suspense>
    </main>
  );
}
