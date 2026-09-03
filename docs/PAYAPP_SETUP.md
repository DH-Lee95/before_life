# 페이앱 운영 연결

코드는 페이앱 REST 결제요청과 `feedbackurl` 검증 방식으로 준비되어 있다. 브라우저의 성공 이동만으로 소울을 지급하지 않고, 서버가 받은 완료 통보(`pay_state=4`)가 저장된 주문과 일치할 때만 지급한다.

## 1. 환경 변수

Vercel의 Preview와 Production 환경에 다음 값을 등록한다.

```bash
PAYAPP_USER_ID=판매자아이디
PAYAPP_LINK_KEY=설정화면의_연동KEY
PAYAPP_LINK_VALUE=설정화면의_연동VALUE
PAYAPP_MODE=test
NEXT_PUBLIC_SITE_URL=https://대표도메인
PAYAPP_OPEN_PAY_TYPES=card,kakaopay,naverpay,applepay,payco,tosspay
```

`PAYAPP_LINK_KEY`와 `PAYAPP_LINK_VALUE`는 클라이언트에 노출하면 안 된다. `NEXT_PUBLIC_SITE_URL`은 끝의 `/` 없이 실제 대표 도메인으로 설정한다. `PAYAPP_MODE`는 전생서랍의 사업자정보 공개 여부를 검사하기 위한 값이며 페이앱 샌드박스 전환값이 아니다. 페이앱 계정에서 실제 청구 여부를 반드시 확인한다. 상점 심사와 실결제 준비가 끝난 뒤 사업자 공개정보를 모두 채우고 `PAYAPP_MODE=live`로 변경한다.

## 2. 데이터베이스

애플리케이션 배포 전에 `supabase/migrations/20260903000100_payapp_payment_provider.sql`을 운영 Supabase에 적용한다. 이 마이그레이션은 결제창 URL 저장 컬럼을 추가하고 신규 주문의 기본 provider를 `payapp`으로 바꾼다.

## 3. 페이앱 설정

- 판매자 관리 사이트의 설정 화면에서 연동 KEY와 VALUE를 확인한다.
- 결제수단과 정산 정보를 신청·확정한다.
- 결제요청마다 코드가 `feedbackurl`을 전달하므로 공통 통보 URL은 필수가 아니다. 공통 통보 URL도 사용한다면 동일한 `/api/payment/webhook`을 지정해도 멱등 처리된다.
- 부분 취소는 소울을 자동 환산하지 않는다. 운영 로그의 `PayApp partial cancellation requires manual soul reconciliation` 항목을 확인해 수동 처리한다.

## 4. 출시 전 확인

1. 페이앱 계정의 결제 가능 상태를 확인한 뒤 1,000원 주문의 결제창이 열리는지 확인한다. 실제 결제가 가능한 계정이라면 테스트 과정에서도 청구될 수 있다.
2. 완료 통보 후 성공 화면이 `1소울이 충전됐어요`로 바뀌는지 확인한다.
3. 성공 화면 새로고침과 동일 통보 재전송에도 소울이 한 번만 지급되는지 확인한다.
4. 전액 취소 후 소울이 한 번만 회수되는지 확인한다.
5. Vercel 로그에 결제 요청/feedback 검증 오류가 없는지 확인한다.
6. 실결제를 직접 승인·취소한 뒤에만 `PAYAPP_MODE=live` 상태로 공개한다.
