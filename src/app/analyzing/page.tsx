import { Suspense } from "react";

import { AnalyzingClient } from "@/components/AnalyzingClient";

export default function AnalyzingPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 text-archive-text">
      <Suspense fallback={<p className="text-sm text-archive-body">기록을 확인하는 중</p>}>
        <AnalyzingClient />
      </Suspense>
    </main>
  );
}
