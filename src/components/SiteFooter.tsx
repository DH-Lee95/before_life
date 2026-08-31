import Link from "next/link";

import { readBusinessInformation } from "@/config/business";

export function SiteFooter() {
  const business = readBusinessInformation();
  return (
    <footer className="mx-auto w-full max-w-md border-t border-archive-line px-5 py-7 text-[11px] leading-5 text-archive-muted">
      <nav className="flex flex-wrap gap-x-4 gap-y-1" aria-label="운영 정책">
        <Link href="/terms">이용약관</Link>
        <Link href="/privacy" className="font-semibold text-archive-body">개인정보처리방침</Link>
        <Link href="/refund">환불 안내</Link>
      </nav>
      {business.complete ? (
        <div className="mt-4 space-y-0.5">
          <p>{business.name} · 대표 {business.representative}</p>
          <p>사업자등록번호 {business.registrationNumber} · 통신판매업 {business.mailOrderRegistrationNumber}</p>
          <p>{business.address}</p>
          <p>고객문의 {business.supportEmail} · {business.supportPhone}</p>
          <p>개인정보 보호책임자 {business.privacyOfficerName}</p>
        </div>
      ) : (
        <p className="mt-4">현재 테스트 운영 중이며 실제 결제는 제공하지 않습니다.</p>
      )}
      <p className="mt-3">전생 서랍의 결과는 오락과 자기성찰을 위한 콘텐츠이며 사실을 증명하는 감정 결과가 아닙니다.</p>
    </footer>
  );
}
