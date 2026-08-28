"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Archive, ChevronRight, LockKeyhole, RotateCcw } from "lucide-react";

import type { LockedContentConfig } from "@/config/contentTypes";
import type { FreeResultContent, SoulContent, SoulProfile } from "@/types/soul";

type ResultPayload = {
  profile: SoulProfile;
  freeContent: SoulContent;
  lockedContentTypes: LockedContentConfig[];
};

type ResultViewProps = {
  profileId: string;
  token: string;
};

export function ResultView({ profileId, token }: ResultViewProps) {
  const [payload, setPayload] = useState<ResultPayload | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedLockedTitle, setSelectedLockedTitle] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadResult() {
      if (!token) {
        setErrorMessage("결과 조회 토큰이 없습니다. 테스트를 다시 진행해주세요.");
        return;
      }

      const response = await fetch(`/api/soul/result/${profileId}?token=${encodeURIComponent(token)}`);
      if (!response.ok) {
        setErrorMessage("결과를 찾을 수 없습니다. 같은 브라우저에서 다시 시도해주세요.");
        return;
      }

      const data = (await response.json()) as ResultPayload;
      if (isMounted) {
        setPayload(data);
      }
    }

    void loadResult();

    return () => {
      isMounted = false;
    };
  }, [profileId, token]);

  const freeResult = useMemo(() => {
    return payload?.freeContent.content as FreeResultContent | undefined;
  }, [payload]);

  async function handleLockedClick(title: string, contentType: string) {
    setSelectedLockedTitle(title);
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "click_locked_content", profileId, contentType }),
    });
  }

  if (!payload || !freeResult) {
    return (
      <section className="flex min-h-[70dvh] flex-col justify-center text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-archive-line bg-archive-panel">
          <Archive className="h-5 w-5 text-archive-rose" aria-hidden />
        </div>
        <h1 className="text-xl font-semibold">전생 서랍을 여는 중</h1>
        <p className="mt-3 text-sm leading-6 text-archive-body">
          {errorMessage || "저장된 결과를 불러오고 있습니다."}
        </p>
        {errorMessage ? (
          <Link
            href="/test"
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-archive-text px-5 text-sm font-semibold text-archive-bg"
          >
            다시 분석하기
            <RotateCcw className="h-4 w-4" aria-hidden />
          </Link>
        ) : null}
      </section>
    );
  }

  return (
    <section className="space-y-6 pb-8">
      <header className="space-y-5">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-archive-muted">
          <Archive className="h-4 w-4 text-archive-rose" aria-hidden />
          전생 서랍
        </Link>
        <div>
          <p className="text-sm text-archive-rose">{payload.profile.displaySoulId}</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight">전생 서랍 {payload.profile.discoveryPercent}% 열림</h1>
          <p className="mt-3 text-sm leading-6 text-archive-body">{freeResult.summary}</p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-archive-panel">
          <div className="h-full rounded-full bg-archive-rose" style={{ width: `${payload.profile.discoveryPercent}%` }} />
        </div>
      </header>

      <section className="rounded-lg border border-archive-line bg-archive-card p-5">
        <p className="text-xs font-medium text-archive-muted">생년월일 기반 성향</p>
        <h2 className="mt-2 text-xl font-semibold leading-8">{freeResult.natureSummary.headline}</h2>
        <div className="mt-4 space-y-2 text-sm leading-6 text-archive-body">
          {freeResult.natureSummary.signals.map((signal) => (
            <p key={signal}>{signal}</p>
          ))}
        </div>
        <p className="mt-4 border-t border-archive-line pt-4 text-sm leading-6 text-archive-body">
          {freeResult.natureSummary.pastLifeBridge}
        </p>
      </section>

      <article className="rounded-lg border border-archive-line bg-archive-panel p-5">
        <p className="text-xs text-archive-muted">대표 전생 기록</p>
        <h2 className="mt-2 text-xl font-semibold">{freeResult.title}</h2>
        <dl className="mt-5 space-y-4 text-sm">
          <div className="border-t border-archive-line pt-4">
            <dt className="text-archive-muted">위치</dt>
            <dd className="mt-1 text-base text-archive-text">{freeResult.sections.location}</dd>
          </div>
          <div>
            <dt className="text-archive-muted">직업</dt>
            <dd className="mt-1 text-base text-archive-text">{freeResult.sections.occupation}</dd>
          </div>
        </dl>
        <p className="mt-5 text-sm leading-7 text-archive-body">{freeResult.sections.atmosphere}</p>
      </article>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-xs text-archive-muted">희미한 추가 기록</p>
            <h2 className="mt-1 text-lg font-semibold">아직 선명하지 않은 서랍</h2>
          </div>
          <span className="text-xs text-archive-muted">2개 감지</span>
        </div>
        <div className="space-y-2">
          {freeResult.sections.faintRecords.map((record) => (
            <div key={record.label} className="rounded-lg border border-archive-line bg-archive-panel p-4">
              <p className="text-sm font-semibold">{record.label}</p>
              <p className="mt-2 text-sm leading-6 text-archive-body">{record.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3">
          <p className="text-xs text-archive-muted">잠긴 기록</p>
          <h2 className="mt-1 text-lg font-semibold">1 Soul로 하나씩 열 수 있어요</h2>
        </div>
        <div className="space-y-2">
          {payload.lockedContentTypes.map((contentType) => (
            <button
              key={contentType.id}
              type="button"
              onClick={() => void handleLockedClick(contentType.title, contentType.id)}
              className="flex w-full items-center gap-3 rounded-lg border border-archive-line bg-archive-panel p-4 text-left transition hover:border-archive-rose"
            >
              <LockKeyhole className="h-4 w-4 shrink-0 text-archive-lavender" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{contentType.title}</span>
                <span className="mt-1 block text-xs leading-5 text-archive-muted">{contentType.hint}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-archive-muted" aria-hidden />
            </button>
          ))}
        </div>
      </section>

      {selectedLockedTitle ? (
        <section className="rounded-lg border border-archive-rose/50 bg-archive-card p-5">
          <p className="text-xs text-archive-rose">Phase 2 결제 흐름</p>
          <h2 className="mt-2 text-lg font-semibold">{selectedLockedTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-archive-body">
            이 기록은 로그인 후 Soul Pack을 구매하면 열 수 있습니다. 실제 결제에서는 카카오페이, 네이버페이,
            카드, 휴대폰 결제를 PG 위젯으로 연결합니다.
          </p>
        </section>
      ) : null}

      <p className="text-center text-[11px] leading-5 text-archive-muted">
        전생 서랍은 AI 기반 엔터테인먼트 스토리텔링 서비스입니다.
      </p>
    </section>
  );
}
