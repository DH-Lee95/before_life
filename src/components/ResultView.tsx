"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, BookOpen, Brain, Check, Coins, Gift, Heart, Loader2, LockKeyhole, RefreshCw, RotateCcw, Share2, TrendingUp } from "lucide-react";

import { contentCosts, referralReward, soulPacks, type SoulPack } from "@/config/pricing";
import { asIdentity } from "@/lib/content/koreanGrammar";
import { clearPendingResultAction, readPendingResultAction, savePendingResultAction } from "@/lib/auth/pendingResultAction";
import type { DeepDiveRecord, FreeResultContent, LockedContentType, PublicSoulProfile, SoulContent, StoryNarrative, WholeLifeNarrative } from "@/types/soul";

type ResultPayload = {
  profile: PublicSoulProfile;
  freeContent: SoulContent;
  unlockedContents?: SoulContent[];
  account: { authenticated: boolean; nickname?: string; balance: number };
};

type ResultViewProps = {
  profileId: string;
  token?: string;
};

const RESULT_TOKEN_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

function getResultToken(profileId: string, legacyToken = ""): string {
  const url = new URL(window.location.href);
  const addressToken = url.searchParams.get("token") ?? new URLSearchParams(url.hash.slice(1)).get("token") ?? "";
  const token = [legacyToken, addressToken, sessionStorage.getItem(`soul:result-token:${profileId}`) ?? ""]
    .find((candidate) => RESULT_TOKEN_PATTERN.test(candidate)) ?? "";

  if (token) sessionStorage.setItem(`soul:result-token:${profileId}`, token);
  return token;
}

function cleanLegacyTokenFromAddress(profileId: string) {
  const url = new URL(window.location.href);
  if (url.searchParams.has("token") || new URLSearchParams(url.hash.slice(1)).has("token")) {
    window.history.replaceState(null, "", `/result/${profileId}`);
  }
}

export function ResultView({ profileId, token: legacyToken = "" }: ResultViewProps) {
  const router = useRouter();
  const [payload, setPayload] = useState<ResultPayload | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [authErrorMessage, setAuthErrorMessage] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [shareMessage, setShareMessage] = useState("");
  const [purchaseMessage, setPurchaseMessage] = useState("");
  const [purchasingPackId, setPurchasingPackId] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [wholeLifePreview, setWholeLifePreview] = useState<WholeLifeNarrative | null>(null);
  const [openedRecords, setOpenedRecords] = useState<Partial<Record<LockedContentType, StoryNarrative>>>({});
  const [unlockingContentType, setUnlockingContentType] = useState("");
  const [previewStatus, setPreviewStatus] = useState<"idle" | "loading" | "error">("idle");
  const [previewMessage, setPreviewMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadResult() {
      try {
        setErrorMessage("");
        const resultToken = getResultToken(profileId, legacyToken);
        const response = await fetch(
          `/api/soul/result/${profileId}`,
          resultToken ? { headers: { "X-Result-Token": resultToken } } : undefined,
        );
        if (!response.ok) throw new Error("result request failed");

        const data = (await response.json()) as ResultPayload;
        if (isMounted) {
          cleanLegacyTokenFromAddress(profileId);
          setPayload(data);
          const restoredRecords: Partial<Record<LockedContentType, StoryNarrative>> = {};
          for (const unlocked of data.unlockedContents ?? []) {
            if (unlocked.contentType === "whole_life") {
              setWholeLifePreview(unlocked.content as WholeLifeNarrative);
            } else if (unlocked.contentType !== "free_summary") {
              restoredRecords[unlocked.contentType] = unlocked.content as StoryNarrative;
            }
          }
          setOpenedRecords(restoredRecords);
          const currentUrl = new URL(window.location.href);
          if (currentUrl.searchParams.get("auth") === "failed") {
            setAuthErrorMessage(authFailureMessage(currentUrl.searchParams.get("reason")));
          }
          trackEvent("view_free_result", profileId);
        }
      } catch {
        if (isMounted) setErrorMessage("결과를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      }
    }

    void loadResult();
    return () => { isMounted = false; };
  }, [legacyToken, loadAttempt, profileId]);

  const freeResult = useMemo(() => {
    return payload?.freeContent.content as FreeResultContent | undefined;
  }, [payload]);

  const orderedRecords = useMemo(() => {
    return [...(freeResult?.sections.records ?? [])].sort((a, b) => Number(b.isUnlocked) - Number(a.isUnlocked));
  }, [freeResult]);
  const unlockedRecords = orderedRecords.filter(
    (record): record is Extract<DeepDiveRecord, { isUnlocked: true }> => record.isUnlocked,
  );
  const lockedRecords = orderedRecords.filter(
    (record): record is Extract<DeepDiveRecord, { isUnlocked: false }> => !record.isUnlocked,
  );

  useEffect(() => {
    if (!payload?.account.authenticated) return;
    const pending = readPendingResultAction(profileId);
    if (!pending) return;
    if (pending.kind === "purchase") {
      const pack = soulPacks.find((candidate) => candidate.id === pending.packId);
      if (pack) requestPurchase(pack);
      else clearPendingResultAction(profileId);
    } else {
      clearPendingResultAction(profileId);
    }
    // The action functions intentionally use the latest loaded result state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload?.account.authenticated, profileId]);

  if (!payload || !freeResult) {
    return (
      <section className="flex min-h-[70dvh] flex-col justify-center text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-archive-line bg-archive-panel">
          <Archive className="h-5 w-5 text-archive-rose" aria-hidden />
        </div>
        <h1 className="text-xl font-semibold">전생 서랍을 여는 중</h1>
        <p className="mt-3 text-sm leading-6 text-archive-body">{errorMessage || "저장된 결과를 불러오고 있습니다."}</p>
        {errorMessage ? (
          <div className="mt-6 flex gap-2">
            <button type="button" onClick={() => setLoadAttempt((value) => value + 1)} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-archive-line bg-archive-panel px-4 text-sm font-semibold">
              다시 불러오기 <RefreshCw className="h-4 w-4" aria-hidden />
            </button>
            <Link href="/test" className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-archive-text px-4 text-sm font-semibold text-archive-bg">
              새로 분석 <RotateCcw className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        ) : null}
      </section>
    );
  }

  async function shareResult() {
    const resultToken = getResultToken(profileId, legacyToken);
    const shareUrl = new URL(`/result/${profileId}`, window.location.origin);
    if (resultToken) shareUrl.hash = `token=${encodeURIComponent(resultToken)}`;
    const shareData = { title: "나의 전생 서랍", text: freeResult?.summary, url: shareUrl.toString() };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareMessage("공유했어요");
      } else {
        await navigator.clipboard.writeText(shareUrl.toString());
        setShareMessage("결과 링크를 복사했어요");
      }
      trackEvent("share_result", profileId);
    } catch {
      setShareMessage("공유를 완료하지 못했어요");
    }
  }

  function showPurchase(contentType?: string, message = "원하는 소울 묶음을 선택해 결제를 진행해주세요.") {
    setPurchaseMessage(message);
    trackEvent(contentType ? "click_locked_content" : "view_payment", profileId, contentType);
    const offer = document.getElementById("deep-archive-offer");
    if (offer && typeof offer.scrollIntoView === "function") {
      offer.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function requireKakaoLogin(
    action: Parameters<typeof savePendingResultAction>[1],
    message: string,
  ) {
    if (!window.confirm(message)) return;
    savePendingResultAction(profileId, action);
    setPurchaseMessage("카카오 로그인으로 이동하고 있어요…");
    window.location.assign(`/auth/login?next=${encodeURIComponent(`/result/${profileId}`)}`);
  }

  async function unlockContent(contentType: "whole_life" | LockedContentType) {
    if (!payload?.account.authenticated) {
      requireKakaoLogin(
        { kind: "unlock", contentType },
        "유료 콘텐츠를 이용하려면 카카오 로그인이 필요합니다. 카카오로 로그인하시겠습니까?",
      );
      return;
    }
    const cost = contentType === "whole_life" ? contentCosts.wholeLife : contentCosts.deepRecord;
    if (payload.account.balance < cost) {
      clearPendingResultAction(profileId);
      showPurchase(contentType, `${cost}소울이 필요합니다. 아래에서 필요한 만큼 충전해주세요.`);
      return;
    }
    try {
      setUnlockingContentType(contentType);
      setPurchaseMessage("기록을 복원하고 있어요…");
      const response = await fetch("/api/soul/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, contentType }),
      });
      const data = await response.json() as {
        content?: StoryNarrative | WholeLifeNarrative;
        code?: string;
        message?: string;
        balance?: number;
      };
      if (response.status === 401 && data.code === "AUTH_REQUIRED") {
        requireKakaoLogin(
          { kind: "unlock", contentType },
          "로그인 상태가 만료됐습니다. 카카오로 다시 로그인하시겠습니까?",
        );
        return;
      }
      if (response.status === 402 && data.code === "INSUFFICIENT_SOUL") {
        clearPendingResultAction(profileId);
        showPurchase(contentType, data.message ?? "소울이 부족합니다. 아래에서 필요한 만큼 충전해주세요.");
        return;
      }
      if (!response.ok || !data.content) throw new Error(data.message ?? "기록을 열지 못했습니다.");

      if (contentType === "whole_life") setWholeLifePreview(data.content as WholeLifeNarrative);
      else setOpenedRecords((records) => ({ ...records, [contentType]: data.content as StoryNarrative }));
      clearPendingResultAction(profileId);
      setPayload((current) => current ? {
        ...current,
        account: { ...current.account, balance: data.balance ?? current.account.balance },
      } : current);
      setPurchaseMessage(`기록을 열었습니다. 남은 소울은 ${data.balance ?? 0}개입니다.`);
      trackEvent("unlock_content", profileId, contentType);
    } catch (error) {
      setPurchaseMessage(error instanceof Error ? error.message : "기록을 열지 못했습니다.");
    } finally {
      setUnlockingContentType("");
    }
  }

  function requestPurchase(pack: SoulPack) {
    if (!payload?.account.authenticated) {
      requireKakaoLogin(
        { kind: "purchase", packId: pack.id },
        "소울을 충전하려면 카카오 로그인이 필요합니다. 카카오로 로그인하시겠습니까?",
      );
      return;
    }
    if (window.confirm(`${pack.souls}소울을 ${pack.priceKrw.toLocaleString("ko-KR")}원에 충전하시겠습니까?`)) {
      void purchasePack(pack.id);
    }
  }

  async function purchasePack(packId: string) {
    try {
      setPurchasingPackId(packId);
      setPurchaseMessage("결제 준비 중…");
      const resultToken = getResultToken(profileId, legacyToken);
      const response = await fetch("/api/payment/intents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(resultToken ? { "X-Result-Token": resultToken } : {}),
        },
        body: JSON.stringify({ profileId, packId }),
      });
      const data = await response.json() as { orderId?: string; message?: string; code?: string };
      if (response.status === 401 && data.code === "AUTH_REQUIRED") {
        requireKakaoLogin(
          { kind: "purchase", packId },
          "로그인 상태가 만료됐습니다. 카카오로 다시 로그인하시겠습니까?",
        );
        return;
      }
      if (!response.ok || !data.orderId) throw new Error(data.message ?? "결제를 준비하지 못했습니다.");
      const pending = readPendingResultAction(profileId);
      if (pending?.kind === "purchase") clearPendingResultAction(profileId);
      router.push(`/payment/checkout?orderId=${encodeURIComponent(data.orderId)}`);
    } catch (error) {
      setPurchasingPackId("");
      setPurchaseMessage(error instanceof Error ? error.message : "결제를 준비하지 못했습니다.");
    }
  }

  async function shareInvitation() {
    const inviteUrl = new URL(window.location.origin);
    inviteUrl.searchParams.set("ref", profileId);
    const shareData = {
      title: "전생 서랍 초대",
      text: "나의 전생을 확인하고, 당신의 가장 선명한 전생 기록도 열어보세요.",
      url: inviteUrl.toString(),
    };

    try {
      if (navigator.share) await navigator.share(shareData);
      else await navigator.clipboard.writeText(inviteUrl.toString());
      setInviteMessage("초대 링크를 준비했어요");
    } catch {
      setInviteMessage("초대 링크를 공유하지 못했어요");
    }
  }

  async function generateWholeLifePreview() {
    try {
      setPreviewStatus("loading");
      setPreviewMessage("AI가 유년기부터 말년기까지 한 사람의 생애를 잇고 있습니다. 약 30초 정도 걸릴 수 있어요.");
      const response = await fetch("/api/soul/story-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, token: getResultToken(profileId, legacyToken), contentType: "whole_life" }),
      });
      const data = await response.json() as { content?: WholeLifeNarrative; cached?: boolean; message?: string };
      if (!response.ok || !data.content) throw new Error(data.message || "preview request failed");

      setWholeLifePreview(data.content);
      setPreviewStatus("idle");
      setPreviewMessage(data.cached ? "저장된 AI 샘플을 다시 불러왔습니다." : "새 AI 샘플을 생성했습니다.");
    } catch {
      setPreviewStatus("error");
      setPreviewMessage("AI 샘플을 만들지 못했습니다. 개발 서버 설정을 확인한 뒤 다시 시도해주세요.");
    }
  }

  return (
    <section className="space-y-6 pb-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-archive-muted">
          <Archive className="h-4 w-4 text-archive-rose" aria-hidden /> 전생 서랍
        </Link>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-2 text-xs font-semibold ${payload.account.authenticated ? "bg-archive-green/15 text-archive-green" : "border border-archive-line bg-archive-panel text-archive-muted"}`}>
            {payload.account.authenticated ? "카카오 로그인됨" : "카카오 로그인 필요"}
          </span>
          {payload.account.authenticated ? (
            <span className="rounded-full bg-archive-rose/10 px-3 py-2 text-xs font-semibold text-archive-rose">{payload.account.balance}소울 보유</span>
          ) : null}
          <button type="button" onClick={shareResult} className="inline-flex h-9 items-center gap-2 rounded-full border border-archive-line bg-archive-panel px-3 text-xs font-semibold text-archive-body">
            <Share2 className="h-3.5 w-3.5" aria-hidden /> 결과 공유
          </button>
        </div>
      </header>
      {authErrorMessage ? (
        <div role="alert" className="rounded-lg border border-archive-rose/35 bg-archive-rose/5 px-4 py-3 text-sm leading-6 text-archive-rose">
          {authErrorMessage}
        </div>
      ) : null}
      {shareMessage ? <p className="text-right text-xs text-archive-muted" aria-live="polite">{shareMessage}</p> : null}

      <article className="relative overflow-hidden rounded-2xl bg-archive-text p-6 text-archive-bg shadow-[0_18px_45px_rgba(46,36,24,0.18)]">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border border-archive-bg/10" aria-hidden />
        <p className="text-xs font-semibold tracking-[0.16em] text-archive-card">대표 전생 기록</p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight">당신은<br />{asIdentity(freeResult.sections.occupation)}</h1>
        <p className="mt-4 text-sm leading-7 text-archive-bg/80">{freeResult.summary}</p>
        <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-archive-bg/15 pt-5 text-sm">
          <div><dt className="text-xs text-archive-bg/55">생활 공간</dt><dd className="mt-1 leading-6">{freeResult.sections.location}</dd></div>
          <div><dt className="text-xs text-archive-bg/55">기록 번호</dt><dd className="mt-1">{payload.profile.displaySoulId}</dd></div>
        </dl>
      </article>

      <section className="rounded-lg border border-archive-line bg-archive-card p-5">
        <p className="text-xs font-medium text-archive-muted">생년월일 기반 성향</p>
        <h2 className="mt-2 text-xl font-semibold leading-8">{freeResult.natureSummary.headline}</h2>
        <div className="mt-4 space-y-2 text-sm leading-6 text-archive-body">
          {freeResult.natureSummary.signals.slice(0, 3).map((signal) => <p key={signal}>· {signal}</p>)}
        </div>
        <p className="mt-4 border-t border-archive-line pt-4 text-sm leading-7 text-archive-body">{freeResult.natureSummary.pastLifeBridge}</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <InsightCard icon={<Brain className="h-4 w-4" aria-hidden />} label="숨은 본능" text={freeResult.natureSummary.hiddenInstinct} />
        <InsightCard icon={<Heart className="h-4 w-4" aria-hidden />} label="끌리는 사람" text={freeResult.natureSummary.attractionPattern} />
        <InsightCard icon={<TrendingUp className="h-4 w-4" aria-hidden />} label="성공의 흐름" text={freeResult.sections.success} />
      </section>

      <section className="rounded-xl border border-archive-line bg-archive-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-archive-rose">가장 선명한 기록 · 무료 공개</p>
            <h2 className="mt-1 text-xl font-semibold">깊은 기록 1/6 열림</h2>
          </div>
          <span className="rounded-full bg-archive-green/15 px-3 py-1 text-xs font-semibold text-archive-green">무료</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-archive-body">당신의 답변과 가장 가까운 기록을 먼저 복원했습니다. 나머지는 원하는 순서로 살펴볼 수 있습니다.</p>

        <div className="mt-5 space-y-3">
          {unlockedRecords.map((record) => <UnlockedRecord key={record.id} record={record} />)}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-archive-rose/35 bg-archive-card">
        <div className="bg-archive-text p-5 text-archive-bg">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-archive-card"><BookOpen className="h-4 w-4" aria-hidden /><p className="text-xs font-semibold">긴 이야기 · 약 {freeResult.sections.wholeLife.readingTimeMinutes}분</p></div>
            <span className="rounded-full bg-archive-bg/10 px-3 py-1 text-xs font-semibold">{freeResult.sections.wholeLife.soulCost}소울</span>
          </div>
          <h2 className="mt-3 text-xl font-semibold">{freeResult.sections.wholeLife.title}</h2>
          <p className="mt-2 text-sm leading-6 text-archive-bg/70">{freeResult.sections.wholeLife.description}</p>
        </div>
        <div className="p-5">
          <ol className="space-y-3">
            {freeResult.sections.wholeLife.chapterPreviews.map((chapter, index) => (
              <li key={chapter.stage} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-archive-panel text-[11px] font-semibold text-archive-rose">{index + 1}</span>
                <div><p className="text-xs font-semibold text-archive-rose">{chapter.stage}</p><p className="mt-0.5 text-sm text-archive-body">{chapter.title}</p></div>
              </li>
            ))}
          </ol>
          {wholeLifePreview ? (
            <p className="mt-5 rounded-lg bg-archive-green/15 px-4 py-3 text-center text-sm font-semibold text-archive-green">전생의 일생이 열렸어요</p>
          ) : (
            <button type="button" disabled={Boolean(unlockingContentType)} onClick={() => void unlockContent("whole_life")} className="mt-5 h-11 w-full rounded-lg bg-archive-text text-sm font-semibold text-archive-bg disabled:cursor-wait disabled:opacity-60">
              {unlockingContentType === "whole_life" ? "전생의 일생 복원 중…" : `전생의 일생 열기 · ${contentCosts.wholeLife}소울`}
            </button>
          )}
          {process.env.NODE_ENV !== "production" ? (
            <div className="mt-3 rounded-lg border border-dashed border-archive-rose/40 bg-archive-rose/5 p-3">
              <p className="text-[11px] leading-5 text-archive-muted">로컬 개발 전용 · 첫 생성에만 실제 OpenAI 비용이 발생하며 이후에는 캐시를 사용합니다.</p>
              <button type="button" disabled={previewStatus === "loading"} onClick={generateWholeLifePreview} className="mt-2 h-10 w-full rounded-lg border border-archive-rose/30 bg-archive-card text-xs font-semibold text-archive-rose disabled:cursor-wait disabled:opacity-60">
                {previewStatus === "loading" ? "AI 일생을 생성하는 중…" : "개발용 AI 일생 미리보기"}
              </button>
              {previewMessage ? <p className={`mt-2 text-center text-[11px] leading-5 ${previewStatus === "error" ? "text-archive-rose" : "text-archive-muted"}`} aria-live="polite">{previewMessage}</p> : null}
            </div>
          ) : null}
          <p className="mt-2 text-center text-[11px] leading-5 text-archive-muted">단편을 합친 글이 아니라, 유년기부터 말년기까지 이어지는 별도의 장편 기록입니다.</p>
        </div>
      </section>

      {wholeLifePreview ? <WholeLifeStory story={wholeLifePreview} /> : null}

      <section className="rounded-xl border border-archive-line bg-archive-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-archive-rose">원하는 장면부터 선택</p>
            <h2 className="mt-1 text-xl font-semibold">아직 잠긴 깊은 기록 5개</h2>
          </div>
          <span className="rounded-full bg-archive-rose/10 px-3 py-1 text-xs font-semibold text-archive-rose">각 1소울</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-archive-body">전체 생애보다 궁금한 한 장면이 있다면 사랑, 재산, 마지막 날처럼 원하는 주제만 골라 열 수 있습니다.</p>
        <div className="mt-5 space-y-3">
          {lockedRecords.map((record) => {
            const opened = openedRecords[record.id];
            return opened
              ? <UnlockedRecord key={record.id} record={{ ...opened, id: record.id, isUnlocked: true }} />
              : <LockedRecord key={record.id} record={record} disabled={Boolean(unlockingContentType)} opening={unlockingContentType === record.id} onOpen={() => void unlockContent(record.id)} />;
          })}
        </div>
      </section>

      <section id="deep-archive-offer" className="rounded-xl bg-archive-text p-5 text-archive-bg">
        <div className="flex items-center gap-2 text-archive-card"><Coins className="h-4 w-4" aria-hidden /><p className="text-xs font-semibold">원하는 만큼 골라 여는 단위</p></div>
        <h2 className="mt-3 text-xl font-semibold">소울 충전</h2>
        <p className="mt-2 text-sm leading-6 text-archive-bg/70">깊은 기록은 1소울, 시간순으로 이어지는 전생의 일생은 2소울이 필요합니다.</p>
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-archive-bg/15 bg-archive-bg/5 p-3">
          <p className="text-xs leading-5 text-archive-bg/70">충전한 소울은 카카오 계정에 안전하게 보관됩니다.</p>
          <span className="shrink-0 text-xs font-semibold">
            {payload.account.authenticated ? `${payload.account.balance}소울 보유` : "결제 시 카카오 로그인"}
          </span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {soulPacks.map((pack) => (
            <button
              key={pack.id}
              type="button"
              disabled={Boolean(purchasingPackId)}
              onClick={() => requestPurchase(pack)}
              className={`relative rounded-lg border p-4 text-left disabled:cursor-wait disabled:opacity-60 ${pack.souls === 7 ? "border-archive-card bg-archive-bg text-archive-text" : "border-archive-bg/15 bg-archive-bg/5 text-archive-bg"}`}
            >
              {pack.badge ? <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${pack.souls === 7 ? "bg-archive-rose/15 text-archive-rose" : "bg-archive-bg/10 text-archive-card"}`}>{pack.badge}</span> : null}
              <strong className="block text-lg">{pack.souls}소울</strong>
              <span className={`mt-1 block text-sm ${pack.souls === 7 ? "text-archive-body" : "text-archive-bg/65"}`}>{pack.priceKrw.toLocaleString("ko-KR")}원</span>
              <span className={`mt-2 block text-[11px] leading-4 ${pack.souls === 7 ? "text-archive-muted" : "text-archive-bg/50"}`}>{pack.description}</span>
            </button>
          ))}
        </div>
        {purchaseMessage ? <p className="mt-4 text-xs leading-5 text-archive-bg/65" aria-live="polite">{purchaseMessage}</p> : null}
      </section>

      <section className="rounded-xl border border-archive-line bg-archive-panel p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-archive-rose/10 text-archive-rose"><Gift className="h-4 w-4" aria-hidden /></span>
          <div>
            <p className="text-xs font-semibold text-archive-rose">첫 초대 보상</p>
            <h2 className="mt-1 text-lg font-semibold">친구 한 명을 초대하면 {referralReward.souls}소울</h2>
            <p className="mt-2 text-sm leading-6 text-archive-body">초대받은 친구가 처음으로 무료 결과를 끝까지 확인하면 보상이 지급됩니다. 계정당 한 번만 받을 수 있어요.</p>
          </div>
        </div>
        <button type="button" onClick={shareInvitation} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-archive-line bg-archive-card text-sm font-semibold">
          <Share2 className="h-4 w-4" aria-hidden /> 친구에게 초대 링크 보내기
        </button>
        {inviteMessage ? <p className="mt-2 text-center text-xs text-archive-muted" aria-live="polite">{inviteMessage}</p> : null}
        <p className="mt-2 text-center text-[11px] leading-5 text-archive-muted">보상 지급은 로그인·부정 초대 방지 기능이 연결되는 정식 출시부터 적용됩니다.</p>
      </section>

      <section className="flex gap-3">
        <Link href="/test" className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-archive-line bg-archive-panel px-4 text-sm font-semibold text-archive-body">
          <RotateCcw className="h-4 w-4" aria-hidden /> 다시 분석하기
        </Link>
      </section>

      <p className="text-center text-[11px] leading-5 text-archive-muted">전생 서랍은 AI 기반 엔터테인먼트 스토리텔링 서비스입니다.</p>
      {unlockingContentType ? <UnlockingDialog /> : null}
    </section>
  );
}

function UnlockingDialog() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-archive-text/55 px-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="전생 기록을 여는 중">
      <section className="w-full max-w-sm rounded-2xl border border-archive-card/30 bg-archive-card p-6 text-center text-archive-text shadow-2xl">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-archive-rose/10 text-archive-rose">
          <Archive className="h-6 w-6" aria-hidden />
        </span>
        <h2 className="mt-5 text-xl font-semibold">서랍에서 기록을 꺼내고 있어요</h2>
        <p className="mt-3 text-sm leading-6 text-archive-body">당신의 전생에 맞춰 이야기를 정리하고 있습니다. 잠시만 기다려주세요.</p>
        <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-archive-rose" aria-live="polite">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> 기록을 복원하는 중
        </div>
      </section>
    </div>
  );
}

function WholeLifeStory({ story }: { story: WholeLifeNarrative }) {
  return (
    <article className="rounded-xl border border-archive-rose/40 bg-archive-card p-5">
      <p className="text-xs font-semibold text-archive-rose">개발용 AI 생성 결과 · 약 {story.readingTimeMinutes}분</p>
      <h2 className="mt-2 text-2xl font-semibold leading-9">{story.title}</h2>
      <p className="mt-5 text-[15px] leading-8 text-archive-body">{story.opening}</p>
      <div className="mt-8 space-y-9">
        {story.chapters.map((chapter) => (
          <section key={chapter.stage}>
            <p className="text-xs font-semibold text-archive-rose">{chapter.stage}</p>
            <h3 className="mt-1 text-lg font-semibold">{chapter.title}</h3>
            <div className="mt-4 space-y-4">
              {chapter.paragraphs.map((paragraph, index) => <p key={`${chapter.stage}-${index}`} className="text-sm leading-8 text-archive-body">{paragraph}</p>)}
            </div>
          </section>
        ))}
      </div>
      <aside className="mt-8 rounded-lg border border-archive-line bg-archive-panel p-4">
        <p className="text-xs font-semibold text-archive-rose">현생에 남은 의미</p>
        <p className="mt-2 text-sm leading-8 text-archive-body">{story.presentMeaning}</p>
      </aside>
    </article>
  );
}

function UnlockedRecord({ record }: { record: Extract<DeepDiveRecord, { isUnlocked: true }> }) {
  return (
    <details open className="group rounded-lg border border-archive-rose/40 bg-archive-panel">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 [&::-webkit-details-marker]:hidden">
        <span><span className="block text-sm font-semibold">{record.title}</span><span className="mt-1 block text-xs text-archive-muted">약 {record.readingTimeMinutes}분 · 전체 기록</span></span>
        <Check className="h-4 w-4 text-archive-green" aria-hidden />
      </summary>
      <article className="border-t border-archive-line px-4 pb-5 pt-4">
        <p className="text-[15px] leading-8 text-archive-body">{record.opening}</p>
        <div className="mt-7 space-y-7">
          {record.chapters.map((chapter) => (
            <section key={chapter.title}>
              <h3 className="text-base font-semibold text-archive-text">{chapter.title}</h3>
              <div className="mt-3 space-y-3">{chapter.paragraphs.map((paragraph, index) => <p key={`${chapter.title}-${index}`} className="text-sm leading-8 text-archive-body">{paragraph}</p>)}</div>
            </section>
          ))}
        </div>
        <aside className="mt-7 rounded-lg border border-archive-line bg-archive-card p-4">
          <p className="text-xs font-semibold text-archive-rose">현생에 남은 의미</p>
          <p className="mt-2 text-sm leading-8 text-archive-body">{record.presentMeaning}</p>
        </aside>
      </article>
    </details>
  );
}

function LockedRecord({ record, disabled, opening, onOpen }: { record: Extract<DeepDiveRecord, { isUnlocked: false }>; disabled: boolean; opening: boolean; onOpen: () => void }) {
  return (
    <article className="rounded-lg border border-archive-line bg-archive-panel p-4">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-sm font-semibold">{record.title}</p><p className="mt-1 text-xs text-archive-muted">약 {record.readingTimeMinutes}분 · 잠긴 기록</p></div>
        <LockKeyhole className="h-4 w-4 text-archive-rose" aria-hidden />
      </div>
      <p className="mt-3 text-sm leading-6 text-archive-body">{record.preview}</p>
      <p className="mt-2 text-xs leading-5 text-archive-muted">{record.hint}</p>
      <button type="button" disabled={disabled} onClick={onOpen} className="mt-4 h-10 w-full rounded-lg border border-archive-line bg-archive-card text-xs font-semibold text-archive-text disabled:cursor-wait disabled:opacity-60">{opening ? "기록 복원 중…" : `이 기록 열기 · ${contentCosts.deepRecord}소울`}</button>
    </article>
  );
}

function InsightCard({ icon, label, text }: { icon: React.ReactNode; label: string; text: string }) {
  return (
    <article className="rounded-lg border border-archive-line bg-archive-panel p-4">
      <div className="flex items-center gap-2 text-archive-rose">{icon}<p className="text-xs font-semibold tracking-wide">{label}</p></div>
      <p className="mt-3 text-sm leading-7 text-archive-body">{text}</p>
    </article>
  );
}

function trackEvent(name: "view_free_result" | "click_locked_content" | "view_payment" | "unlock_content" | "share_result", profileId: string, contentType?: string) {
  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, profileId, ...(contentType ? { contentType } : {}) }),
  }).catch(() => undefined);
}

function authFailureMessage(reason: string | null) {
  if (reason === "start") return "카카오 로그인을 시작하지 못했습니다. 잠시 후 다시 시도해주세요.";
  if (reason === "provider") return "카카오 로그인이 취소됐거나 인증 정보를 받지 못했습니다. 다시 시도해주세요.";
  if (reason === "exchange") return "카카오 인증을 앱 로그인으로 연결하지 못했습니다. 다시 시도해주세요.";
  if (reason === "account") return "카카오 계정 정보를 확인하지 못했습니다. 다시 시도해주세요.";
  if (reason === "session") return "로그인은 됐지만 현재 결과와 계정을 연결하지 못했습니다. 다시 시도해주세요.";
  return "카카오 로그인을 완료하지 못했습니다. 다시 한 번 시도해주세요.";
}
