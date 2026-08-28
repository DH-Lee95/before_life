"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

import { questions } from "@/config/questions";
import type { AnswerId, AnswerMap, QuestionId, SoulInput } from "@/types/soul";

type DraftAnswers = Partial<Record<QuestionId, AnswerId>>;

export function TestForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [answers, setAnswers] = useState<DraftAnswers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const currentQuestion = questions[step - 1];
  const progress = useMemo(() => Math.round((step / (questions.length + 1)) * 100), [step]);

  function canContinue(): boolean {
    if (step === 0) {
      return nickname.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(birthDate);
    }

    return currentQuestion ? Boolean(answers[currentQuestion.id]) : false;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (step < questions.length) {
      if (canContinue()) {
        setStep((value) => value + 1);
      }
      return;
    }

    const answerMap = answers as AnswerMap;
    const payload: SoulInput = {
      nickname,
      birthDate,
      birthTime,
      answers: answerMap,
    };

    setIsSubmitting(true);
    try {
      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "complete_questionnaire" }),
      });

      const response = await fetch("/api/soul/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message ?? "분석을 완료하지 못했습니다.");
      }

      const data = (await response.json()) as { profileId: string; resultToken: string };
      const resultPath = `/result/${data.profileId}?token=${encodeURIComponent(data.resultToken)}`;
      router.push(`/analyzing?next=${encodeURIComponent(resultPath)}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "다시 시도해주세요.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <header>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-6 inline-flex items-center gap-2 text-sm text-archive-muted"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          처음으로
        </button>
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-archive-panel">
          <div className="h-full rounded-full bg-archive-rose transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-archive-muted">
          {step + 1} / {questions.length + 1}
        </p>
      </header>

      {step === 0 ? (
        <section className="space-y-5">
          <div>
            <p className="text-sm text-archive-rose">기본 정보</p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight">전생 서랍을 열기 위한 정보를 입력해주세요.</h1>
            <p className="mt-3 text-sm leading-6 text-archive-body">
              무료 결과에는 위치와 직업 정도만 공개됩니다. 출생시간은 선택 입력입니다.
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">닉네임</span>
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              className="h-12 w-full rounded-lg border border-archive-line bg-archive-panel px-4 text-sm outline-none focus:border-archive-rose"
              placeholder="예: 서연"
              autoComplete="nickname"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">생년월일</span>
            <input
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
              className="h-12 w-full rounded-lg border border-archive-line bg-archive-panel px-4 text-sm outline-none focus:border-archive-rose"
              type="date"
              max="2026-08-18"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">출생시간 선택</span>
            <input
              value={birthTime}
              onChange={(event) => setBirthTime(event.target.value)}
              className="h-12 w-full rounded-lg border border-archive-line bg-archive-panel px-4 text-sm outline-none focus:border-archive-rose"
              type="time"
            />
          </label>
        </section>
      ) : (
        <section className="space-y-5">
          <div>
            <p className="text-sm text-archive-rose">질문 {step}</p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight">{currentQuestion?.title}</h1>
            <p className="mt-3 text-sm leading-6 text-archive-body">{currentQuestion?.helper}</p>
          </div>

          <div className="space-y-2">
            {currentQuestion?.options.map((option) => {
              const selected = answers[currentQuestion.id] === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setAnswers((value) => ({ ...value, [currentQuestion.id]: option.id }))}
                  className={`w-full rounded-lg border px-4 py-4 text-left text-sm transition ${
                    selected
                      ? "border-archive-rose bg-archive-card text-archive-text"
                      : "border-archive-line bg-archive-panel text-archive-body"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {errorMessage ? (
        <p className="rounded-lg border border-archive-danger/50 bg-archive-danger/10 px-4 py-3 text-sm text-archive-danger">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((value) => value - 1)}
            className="flex h-13 w-14 items-center justify-center rounded-lg border border-archive-line bg-archive-panel"
            aria-label="이전 질문"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
        <button
          type="submit"
          disabled={!canContinue() || isSubmitting}
          className="flex h-13 min-h-13 flex-1 items-center justify-center gap-2 rounded-lg bg-archive-text px-5 text-sm font-semibold text-archive-bg disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              분석 중
            </>
          ) : step === questions.length ? (
            <>
              결과 보기
              <ArrowRight className="h-4 w-4" aria-hidden />
            </>
          ) : (
            <>
              다음
              <ArrowRight className="h-4 w-4" aria-hidden />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
