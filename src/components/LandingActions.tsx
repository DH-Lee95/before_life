"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";

import { getSafeResultPath } from "./AnalyzingClient";

export function LandingActions() {
  const [lastResult, setLastResult] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("soul:last-result");
    const safePath = getSafeResultPath(saved);
    if (safePath !== "/") setLastResult(safePath);

    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "landing_view" }),
    }).catch(() => undefined);
  }, []);

  function trackStart() {
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "start_test" }),
    }).catch(() => undefined);
  }

  return (
    <div className="mt-9 space-y-3">
      <Link
        href="/test"
        onClick={trackStart}
        className="flex h-14 items-center justify-center gap-2 rounded-lg bg-archive-text px-5 text-sm font-semibold text-archive-bg transition hover:bg-[#f0ded5]"
      >
        무료로 내 기록 열기
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
      {lastResult ? (
        <Link
          href={lastResult}
          className="flex h-12 items-center justify-center gap-2 rounded-lg border border-archive-line bg-archive-panel px-5 text-sm font-semibold text-archive-body"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          지난 기록 다시 열기
        </Link>
      ) : null}
    </div>
  );
}
