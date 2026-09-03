# 전생서랍 운영 출시 체크리스트

## 코드와 데이터베이스

- [ ] `supabase/migrations/` 전체 SQL을 파일명 순서대로 운영 프로젝트에 적용
- [ ] `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `OPENAI_API_KEY`를 Vercel Production에 설정
- [ ] `NEXT_PUBLIC_SITE_URL`을 최종 `https://` 도메인으로 설정
- [ ] 필요하면 별도의 임의 문자열을 `RATE_LIMIT_SECRET`으로 설정하고 재배포
- [ ] Vercel 로그에서 `rate limit request failed`, `Payment webhook reconciliation failed`, `Content unlock failed` 검색

## 인증과 도메인

- [ ] Vercel 프로젝트에 루트 도메인과 `www` 도메인을 연결하고 한쪽을 대표 도메인으로 리디렉션
- [ ] Supabase Auth Site URL을 대표 도메인으로 변경
- [ ] Supabase Auth Redirect URLs에 `https://대표도메인/auth/callback` 추가
- [ ] 카카오 로그인 후 원래 결과 화면으로 복귀하는지 새 브라우저에서 확인

## 페이앱

- [ ] 판매자 가입, 결제수단 신청, 정산 정보 등록 완료
- [ ] Vercel Production에 `PAYAPP_USER_ID`, `PAYAPP_LINK_KEY`, `PAYAPP_LINK_VALUE`, `PAYAPP_MODE=live` 설정
- [ ] 필요할 때 `PAYAPP_OPEN_PAY_TYPES`로 노출할 결제수단을 제한
- [ ] `NEXT_PUBLIC_SITE_URL`이 실제 HTTPS 대표 도메인과 정확히 일치하는지 확인
- [ ] 실제 1,000원 결제 1회 후 소울 1개가 한 번만 지급되는지 확인
- [ ] 결제 성공 페이지를 새로고침해도 중복 지급되지 않는지 확인
- [ ] 페이앱 관리자에서 결제를 전액 취소하고 feedback 콜백으로 구매 소울이 한 번만 회수되는지 확인
- [ ] 부분 취소는 자동 소울 환산을 하지 않으므로 사용하지 않고, 발생 시 Vercel 오류 로그를 보고 수동 조정

## 사용자 보호와 운영

- [ ] 이용약관, 개인정보처리방침, 환불 정책, 사업자 정보, 고객문의 채널 공개
- [ ] 전생 결과가 오락용 콘텐츠이며 사실·의학·법률 판단이 아니라는 안내 확인
- [ ] 계정 A의 유료 본문이 계정 B와 토큰만 가진 방문자에게 노출되지 않는지 확인
- [ ] 같은 유료 기록 동시 열기 요청에서 소울이 한 번만 차감되는지 확인
- [ ] OpenAI와 Supabase 사용량·비용 알림 설정
- [ ] 장애 시 광고를 중단하고 결제 버튼을 비활성화할 담당 절차 결정
