import { Suspense } from "react";

import { PaymentSuccessClient } from "@/components/payment/PaymentSuccessClient";

export default function PaymentSuccessPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 text-archive-text">
      <div className="w-full max-w-md">
        <Suspense fallback={<p className="text-center text-sm text-archive-body">결제를 확인하는 중</p>}>
          <PaymentSuccessClient />
        </Suspense>
      </div>
    </main>
  );
}
