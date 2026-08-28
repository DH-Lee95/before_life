"use client";

import { useEffect, useState } from "react";
import { KakaoLoginLink } from "./KakaoLoginLink";

type Account = { authenticated: boolean; nickname?: string; balance: number };
type Props = { next?: string; compact?: boolean };

export function AccountStatus({ next = "/", compact = false }: Props) {
  const [account, setAccount] = useState<Account | null>(null);
  useEffect(() => {
    let active = true;
    fetch("/api/account", { cache: "no-store" })
      .then(async (response) => response.ok ? await response.json() as Account : null)
      .then((value) => { if (active) setAccount(value); })
      .catch(() => { if (active) setAccount({ authenticated: false, balance: 0 }); });
    return () => { active = false; };
  }, []);

  if (!account) return <span className="text-xs text-current/55">계정 확인 중</span>;
  if (!account.authenticated) {
    return (
      <KakaoLoginLink
        next={next}
        className={compact ? "text-xs font-semibold underline underline-offset-4" : "inline-flex h-10 items-center rounded-lg bg-[#FEE500] px-4 text-xs font-semibold text-[#191919]"}
      />
    );
  }
  return <span className="text-xs font-semibold">{account.balance}소울 보유</span>;
}
