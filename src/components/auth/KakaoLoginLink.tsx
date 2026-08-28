type Props = { next?: string; className?: string };

export function KakaoLoginLink({ next = "/", className = "" }: Props) {
  return <a href={`/auth/login?next=${encodeURIComponent(next)}`} className={className}>카카오로 계속하기</a>;
}
