import Link from "next/link";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/SiteFooter";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="min-h-dvh text-archive-text">
      <article className="mx-auto w-full max-w-2xl px-5 py-10">
        <Link href="/" className="text-sm text-archive-rose">← 전생 서랍</Link>
        <h1 className="mt-6 text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-xs text-archive-muted">시행일: 2026년 8월 31일</p>
        <div className="mt-8 space-y-8 text-sm leading-7 text-archive-body">{children}</div>
      </article>
      <SiteFooter />
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-archive-text">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}
