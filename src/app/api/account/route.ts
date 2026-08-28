import { NextResponse } from "next/server";
import { getAccountRepository } from "@/lib/auth/accountRepository";
import { getAuthenticatedUser } from "@/lib/auth/serverClient";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ authenticated: false, balance: 0 });
  const metadata = user.user_metadata as Record<string, unknown>;
  const nickname = [metadata.nickname, metadata.name, metadata.preferred_username]
    .find((value): value is string => typeof value === "string" && value.trim().length > 0);
  const balance = await getAccountRepository().getBalance(user.id);
  return NextResponse.json({ authenticated: true, ...(nickname ? { nickname } : {}), balance });
}
