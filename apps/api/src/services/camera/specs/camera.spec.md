# camera 분석 백엔드 명세

## 목적

camera service는 이미지와 source에 맞는 프롬프트를 선택하고 Gemini 응답을 공통 DTO로 정규화한다.

## 책임

- source에 따라 영수증/식재료 프롬프트를 선택한다.
- 공통 Gemini 호출 함수에 `base64`, `mimeType`, `prompt`를 전달한다.
- Gemini 응답 텍스트를 JSON으로 파싱한다.
- 파싱 결과를 contract schema로 검증한다.

## 규칙

- Gemini 호출 함수는 source별로 중복 구현하지 않는다.
- 프롬프트만 `RECEIPT`와 `INGREDIENT`에 따라 달라진다.
- `INGREDIENT` 결과는 item `price`를 모두 `null`로 정규화한다.
- contract 검증 실패는 400 오류로 반환한다.
- 이번 범위에서는 DB 저장을 수행하지 않는다.

## 검증 기준

- 같은 Gemini 호출 함수로 영수증/식재료 분석을 모두 처리할 수 있다.
- source별 응답이 공통 schema를 통과한다.
- 식재료 응답에 숫자 `price`가 들어와도 서버에서 `null`로 정규화되거나 검증 실패로 차단된다.
