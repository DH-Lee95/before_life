import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "환불 안내 | 전생 서랍" };

export default function RefundPage() {
  return (
    <LegalPage title="환불 안내">
      <LegalSection title="1. 환불 요청">
        <p>결제일로부터 7일 이내이고 사용하지 않은 소울은 고객문의 채널로 환불을 요청할 수 있습니다. 주문 확인을 위해 결제 일시, 주문번호와 카카오 계정 확인을 요청할 수 있습니다.</p>
      </LegalSection>
      <LegalSection title="2. 이미 사용한 소울">
        <p>소울을 사용해 이미 열린 유료 기록은 디지털 콘텐츠의 제공이 시작된 것으로 보아 단순 변심에 의한 청약철회가 제한될 수 있습니다. 결제 화면에서 이 사실을 확인할 수 있도록 안내합니다.</p>
      </LegalSection>
      <LegalSection title="3. 오류와 미제공 콘텐츠">
        <p>소울이 차감됐지만 콘텐츠가 제공되지 않았거나 중복 결제가 확인되면 이용 기록을 확인해 콘텐츠를 복구하거나 소울 복원 또는 결제 취소를 진행합니다.</p>
      </LegalSection>
      <LegalSection title="4. 법정 권리">
        <p>콘텐츠의 하자, 표시 내용과 다른 제공 등 관계 법령에서 정한 사유가 있는 경우에는 위 제한과 관계없이 법령에 따른 권리를 행사할 수 있습니다.</p>
      </LegalSection>
      <LegalSection title="5. 처리 방법">
        <p>환불이 승인되면 원래 결제수단을 통해 처리합니다. 카드사나 결제수단 사정에 따라 실제 환급까지 시간이 걸릴 수 있습니다.</p>
      </LegalSection>
    </LegalPage>
  );
}
