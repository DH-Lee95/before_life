import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "개인정보처리방침 | 전생 서랍" };

export default function PrivacyPage() {
  return (
    <LegalPage title="개인정보처리방침">
      <LegalSection title="1. 처리하는 정보와 목적">
        <p>무료 결과 생성을 위해 생년월일, 선택 입력인 출생시간, 성별, 질문 답변을 처리합니다. 결과 재현과 보관을 위해 전생 프로필, 생성 결과, 익명 세션 식별자와 결과 접근 토큰의 해시를 처리합니다.</p>
        <p>카카오 로그인 시 계정 식별정보를, 결제 시 주문번호·결제키·금액·결제 상태를 처리합니다. 결제 안내를 위해 입력한 휴대폰 번호는 페이앱에 전달하며 전생서랍 데이터베이스에는 저장하지 않습니다. 서비스 개선과 보안 목적의 접속·이용 기록, 광고 유입 정보가 생성될 수 있습니다.</p>
      </LegalSection>
      <LegalSection title="2. 처리 및 보유 기간">
        <p>서비스 결과와 계정 정보는 이용 목적 달성 또는 삭제 요청 시까지 보관합니다. 다만 계약·청약철회 및 대금결제 기록은 5년, 소비자 불만·분쟁 기록은 3년, 표시·광고 기록은 6개월 등 관계 법령에서 정한 기간 동안 별도 보관할 수 있습니다.</p>
      </LegalSection>
      <LegalSection title="3. 처리위탁과 외부 서비스">
        <p>서비스 운영을 위해 Supabase(데이터베이스·인증), Vercel(호스팅), 페이앱(결제), Kakao(로그인), OpenAI(유료 이야기 문장 생성)를 이용합니다. OpenAI에는 생년월일 원문이나 카카오 계정정보를 보내지 않고, 이야기 작성에 필요한 압축된 전생 설정만 전달합니다.</p>
        <p>국외 처리 또는 이전이 필요한 경우 관계 법령에 따른 고지와 보호조치를 적용하며, 구체적인 처리 국가·시점·방법·보유기간은 정식 운영 환경과 계약을 확정한 뒤 본 방침에 반영합니다.</p>
      </LegalSection>
      <LegalSection title="4. 쿠키와 요청 제한">
        <p>결과 접근과 로그인 상태 유지를 위해 HTTP-only 쿠키를 사용합니다. 과도한 요청을 막기 위해 접속 IP를 서버에서 즉시 HMAC 해시로 변환하며 IP 원문은 요청 제한 저장소에 보관하지 않습니다.</p>
      </LegalSection>
      <LegalSection title="5. 이용자의 권리">
        <p>이용자는 자신의 개인정보에 대한 열람, 정정, 삭제, 처리정지와 동의 철회를 요청할 수 있습니다. 법령상 보존 의무가 있는 정보는 해당 기간 동안 분리 보관될 수 있습니다.</p>
      </LegalSection>
      <LegalSection title="6. 파기와 안전조치">
        <p>보유기간이 끝난 정보는 복구하기 어려운 방법으로 파기합니다. 접근권한 제한, 비밀 키의 서버 보관, 전송구간 암호화, 데이터베이스 접근통제와 요청 제한을 적용합니다.</p>
      </LegalSection>
      <LegalSection title="7. 개인정보 보호책임자">
        <p>개인정보 관련 문의와 권리 행사는 하단의 개인정보 보호책임자 및 고객문의 채널로 접수할 수 있습니다.</p>
      </LegalSection>
    </LegalPage>
  );
}
