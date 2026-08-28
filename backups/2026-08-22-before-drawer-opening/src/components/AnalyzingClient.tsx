"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Archive } from "lucide-react";

export function AnalyzingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      router.replace(next);
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [next, router]);

  return (
    <section className="w-full max-w-md text-center">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-lg border border-archive-line bg-archive-panel">
        <Archive className="h-6 w-6 text-archive-rose" aria-hidden />
      </div>
      <h1 className="text-2xl font-semibold">전생 서랍을 정리하고 있어요</h1>
      <p className="mt-3 text-sm leading-6 text-archive-body">
        입력값을 정리하고, 가장 선명하게 남아 있는 기록을 찾는 중입니다.
      </p>
      <div className="mt-8 h-2 overflow-hidden rounded-full bg-archive-panel">
        <div className="h-full w-2/3 animate-pulse rounded-full bg-archive-rose" />
      </div>
    </section>
  );
}
