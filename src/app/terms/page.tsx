import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "이용약관 | 전생 서랍" };

export default function TermsPage() {
  return (
    <LegalPage title="이용약관">
      <LegalSection title="1. 서비스의 목적">
        <p>전생 서랍은 사용자가 입력한 정보와 답변을 바탕으로 오락과 자기성찰을 위한 콘텐츠를 제공합니다. 결과는 실제 전생, 운명 또는 미래를 증명하지 않으며 의학·법률·재무 등 전문적인 판단을 대신하지 않습니다.</p>
      </LegalSection>
      <LegalSection title="2. 계정과 결과 보관">
        <p>무료 결과는 로그인 없이 만들 수 있습니다. 유료 결제와 기록 열람에는 카카오 로그인이 필요하며, 이용자는 본인의 계정과 접속 수단을 안전하게 관리해야 합니다.</p>
      </LegalSection>
      <LegalSection title="3. 소울과 유료 콘텐츠">
        <p>소울은 전생 서랍 안에서 유료 기록을 여는 데 사용하는 서비스 전용 단위입니다. 결제 전에 상품별 소울 수량과 가격을 표시하며, 서버에서 확인한 소울 잔액만 유효합니다.</p>
        <p>소울을 사용해 기록을 열면 해당 계정에서 다시 볼 수 있습니다. 생성 오류로 콘텐츠가 제공되지 않으면 소울이 차감되지 않도록 처리합니다.</p>
      </LegalSection>
      <LegalSection title="4. 이용 제한">
        <p>자동화 도구를 이용한 과도한 요청, 결제 조작, 타인의 결과나 계정에 대한 무단 접근, 서비스 운영 방해 행위를 금지합니다. 필요한 경우 요청 제한 또는 이용 제한 조치를 할 수 있습니다.</p>
      </LegalSection>
      <LegalSection title="5. 서비스 변경과 장애">
        <p>안정적인 운영을 위해 기능이나 콘텐츠 구성을 변경할 수 있습니다. 장애가 발생하면 복구에 노력하며, 유료 콘텐츠가 정상 제공되지 않은 경우 확인 후 재제공 또는 환불 기준에 따른 조치를 합니다.</p>
      </LegalSection>
      <LegalSection title="6. 문의와 약관 변경">
        <p>서비스 문의는 하단 고객문의 채널로 접수할 수 있습니다. 중요한 약관 변경은 적용 전에 서비스 화면을 통해 알립니다.</p>
      </LegalSection>
    </LegalPage>
  );
}
