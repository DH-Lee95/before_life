import Link from "next/link";
import { Archive, ChevronRight, LockKeyhole, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-dvh px-5 pb-10 pt-6 text-archive-text">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md flex-col">
        <header className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Archive className="h-4 w-4 text-archive-rose" aria-hidden />
            전생 서랍
          </div>
          <span className="rounded-full border border-archive-line px-3 py-1 text-[11px] text-archive-muted">
            무료 분석
          </span>
        </header>

        <section className="flex flex-1 flex-col justify-center py-10">
          <p className="mb-4 text-sm text-archive-rose">아직 열리지 않은 기록</p>
          <h1 className="text-[2.65rem] font-semibold leading-[1.08] tracking-normal">
            당신의 전생 서랍에는
            <br />
            어떤 기록이
            <br />
            남아 있을까요?
          </h1>
          <p className="mt-6 max-w-[22rem] text-[15px] leading-7 text-archive-body">
            생년월일과 7개의 질문으로 가장 선명하게 남아 있는 전생의 위치와 직업을 확인해보세요.
          </p>

          <Link
            href="/test"
            className="mt-9 flex h-14 items-center justify-center gap-2 rounded-lg bg-archive-text px-5 text-sm font-semibold text-archive-bg transition hover:bg-[#f0ded5]"
          >
            무료로 내 기록 열기
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>

        <section className="rounded-lg border border-archive-line bg-archive-panel p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-archive-muted">예시 결과</p>
              <p className="mt-1 text-base font-semibold">전생 서랍 18% 열림</p>
            </div>
            <Sparkles className="h-5 w-5 text-archive-lavender" aria-hidden />
          </div>
          <div className="space-y-3 text-sm text-archive-body">
            <div className="flex items-center justify-between border-t border-archive-line pt-3">
              <span>대표 기록</span>
              <span className="text-archive-text">19세기 말 북이탈리아</span>
            </div>
            <div className="flex items-center justify-between">
              <span>직업</span>
              <span className="text-archive-text">편지 대필가</span>
            </div>
            <div className="flex items-center justify-between text-archive-muted">
              <span className="flex items-center gap-1">
                <LockKeyhole className="h-3.5 w-3.5" aria-hidden />
                잠긴 기록
              </span>
              <span>그 사람 / 마지막 날 / 남은 영향</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
