"use client";

import { FormEvent, useEffect, useMemo, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";

import { questions } from "@/config/questions";
import type { AnswerMap, SoulInput } from "@/types/soul";
import { initialTestFormState, isTestFormState, testFormReducer } from "./testFormState";

const DRAFT_KEY = "soul:test-draft";

export function TestForm() {
  const router = useRouter();
  const [formState, dispatch] = useReducer(testFormReducer, initialTestFormState);
  const { step, nickname, birthDate, birthTime, answers } = formState;
  const [isRestored, setIsRestored] = useState(false);
  const [today, setToday] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const currentQuestion = questions[step - 1];
  const progress = useMemo(() => Math.round((step / (questions.length + 1)) * 100), [step]);

  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (isTestFormState(parsed)) dispatch({ type: "restore", state: parsed });
      }
    } catch {
      sessionStorage.removeItem(DRAFT_KEY);
    } finally {
      setIsRestored(true);
    }
  }, []);

  useEffect(() => {
    if (isRestored) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(formState));
  }, [formState, isRestored]);

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
        dispatch({ type: "next" });
      }
      return;
    }

    const answerMap = answers as AnswerMap;
    const payload: SoulInput = {
      nickname,
      birthDate,
      ...(birthTime ? { birthTime } : {}),
      answers: answerMap,
    };

    setIsSubmitting(true);
    try {
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "complete_questionnaire" }),
      }).catch(() => undefined);

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
      sessionStorage.removeItem(DRAFT_KEY);
      sessionStorage.setItem("soul:last-result", resultPath);
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
              성향과 대표 전생, 남은 영향까지 모두 무료로 보여드립니다. 출생시간은 선택 입력입니다.
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">닉네임</span>
            <input
              value={nickname}
              onChange={(event) => dispatch({ type: "set_field", field: "nickname", value: event.target.value })}
              className="h-12 w-full rounded-lg border border-archive-line bg-archive-panel px-4 text-sm outline-none focus:border-archive-rose"
              placeholder="예: 서연"
              autoComplete="nickname"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">생년월일</span>
            <input
              value={birthDate}
              onChange={(event) => dispatch({ type: "set_field", field: "birthDate", value: event.target.value })}
              className="h-12 w-full rounded-lg border border-archive-line bg-archive-panel px-4 text-sm outline-none focus:border-archive-rose"
              type="date"
              max={today || undefined}
            />
          </label>

          <div>
            <label htmlFor="birth-time" className="mb-2 block text-sm font-medium">출생시간 선택</label>
            <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-2">
              <input
                id="birth-time"
                value={birthTime}
                onChange={(event) => dispatch({ type: "set_field", field: "birthTime", value: event.target.value })}
                className="h-12 w-full rounded-lg border border-archive-line bg-archive-panel px-4 text-sm outline-none focus:border-archive-rose"
                type="time"
              />
              <button
                type="button"
                aria-pressed={!birthTime}
                onClick={() => dispatch({ type: "set_field", field: "birthTime", value: "" })}
                className={`flex h-12 items-center justify-center gap-1.5 rounded-lg border text-sm transition ${
                  !birthTime
                    ? "border-archive-rose bg-archive-card text-archive-text"
                    : "border-archive-line bg-archive-panel text-archive-body"
                }`}
              >
                {!birthTime ? <Check className="h-4 w-4 text-archive-rose" aria-hidden /> : null}
                모름
              </button>
            </div>
            <p className="mt-2 text-xs text-archive-muted">시간을 모르면 결과에 ‘모름’으로 반영됩니다.</p>
          </div>
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
                  onClick={() => dispatch({ type: "set_answer", questionId: currentQuestion.id, answerId: option.id })}
                  aria-pressed={selected}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-4 text-left text-sm transition ${
                    selected
                      ? "border-archive-rose bg-archive-card text-archive-text"
                      : "border-archive-line bg-archive-panel text-archive-body"
                  }`}
                >
                  <span>{option.label}</span>
                  {selected ? <Check className="h-4 w-4 shrink-0 text-archive-rose" aria-hidden /> : null}
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

      <div className="sticky bottom-4 z-10 flex gap-3 rounded-xl bg-archive-bg/95 p-1 backdrop-blur-sm">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => dispatch({ type: "previous" })}
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
