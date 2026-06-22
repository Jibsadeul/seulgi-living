# camera 분석 API 명세

## 목적

카메라 분석 테스트 화면에서 사용하는 분석 요청 API를 정의한다.

모든 요청/응답 타입은 `packages/contract`의 Zod 스키마를 단일 진실로 사용한다.

분석 결과 저장 API는 `camera-result-save-api.spec.md`를 참고한다.

## 이미지 분석

`POST /api/ai/camera`

영수증 또는 식재료 이미지를 받아 Gemini 분석 결과를 공통 camera 결과 구조로 반환한다.

### 요청 본문

| 필드     | 타입                    | 필수   | 설명                     |
| -------- | ----------------------- | ------ | ------------------------ |
| source   | `RECEIPT \| INGREDIENT` | 예     | 촬영 소스                |
| imageUri | string                  | 아니오 | mobile 디버깅용 원본 URI |
| mimeType | string                  | 예     | 이미지 MIME 타입         |
| base64   | string                  | 예     | base64 이미지            |

### 응답

```ts
{
  source: 'RECEIPT' | 'INGREDIENT';
  date: timestamp | null;
  items: Array<{
    name: string;
    category: FridgeCategory;
    quantity: number;
    unit: string;
    price: number | null;
  }>;
}

FridgeCategory =
  'VEGETABLE' |
  'FRUIT' |
  'MEAT' |
  'SEAFOOD' |
  'EGG_DAIRY' |
  'GRAIN_NOODLE' |
  'PROCESSED' |
  'SAUCE_SEASONING' |
  'OTHER';
```

### 규칙

- `source=RECEIPT`면 영수증 프롬프트를 사용한다.
- `source=RECEIPT`면 영수증에서 구매일 또는 결제일을 찾아 `date`로 반환한다.
- `source=RECEIPT`에서 날짜를 읽을 수 없으면 `date=null`로 반환한다.
- `source=INGREDIENT`면 식재료 프롬프트를 사용한다.
- `source=INGREDIENT` 결과는 `date=null`로 반환한다.
- `source=INGREDIENT` 결과는 모든 item의 `price`를 `null`로 반환한다.
- Gemini 원본 응답은 서버에서 contract schema로 검증한 뒤만 반환한다.

### 오류

| 상태 | 조건                                   |
| ---- | -------------------------------------- |
| 400  | 요청 형식 오류 또는 응답 스키마 불일치 |
| 500  | Gemini 호출 실패 또는 서버 내부 오류   |
