# camera 분석 데이터 명세

## 목적

camera entity는 영수증/식재료 이미지 분석 결과를 공통 데이터 구조로 관리한다.

## 범위

### entities/camera

- 카메라 분석 결과의 단일 데이터 구조를 정의한다.
- `source` 값과 `FridgeCategory` 값은 contract 스키마를 그대로 따른다.
- mobile은 Gemini를 직접 호출하지 않고 API 응답만 파싱한다.

## 데이터 구조

```ts
{
  source: 'RECEIPT' | 'INGREDIENT';
  items: Array<{
    name: string;
    category:
      | 'VEGETABLE'
      | 'FRUIT'
      | 'MEAT'
      | 'SEAFOOD'
      | 'EGG_DAIRY'
      | 'GRAIN_NOODLE'
      | 'PROCESSED'
      | 'SAUCE_SEASONING'
      | 'OTHER';
    quantity: number;
    unit: string;
    price: number | null;
  }>;
}
```

## 규칙

- 카메라 메뉴에서 `영수증 촬영`을 선택하면 결과의 `source`는 `RECEIPT`다.
- 카메라 메뉴에서 `식재료 촬영`을 선택하면 결과의 `source`는 `INGREDIENT`다.
- `INGREDIENT` 결과의 모든 item은 `price=null`이어야 한다.
- `RECEIPT` 결과의 item `price`는 숫자 또는 `null`을 허용한다.
- `quantity`는 0보다 큰 숫자여야 한다.
- `unit`은 빈 문자열일 수 없다.
- `category`는 지정된 enum 값만 허용한다.

## API 연동

- entity는 분석 요청 mutation과 응답 schema 파싱을 제공한다.
- 이미지 전송 payload에는 `source`, `imageUri`, `mimeType`, `base64`를 포함한다.
- 편집/저장 모델은 이번 범위에서 제외하고 테스트 출력 모델만 우선 제공한다.

## 검증 기준

- mobile이 API 응답을 contract schema로 파싱할 수 있다.
- `INGREDIENT` 응답에 `price` 숫자가 포함되면 검증 실패로 처리한다.
- 결과 화면은 `source`와 `items`를 그대로 렌더링할 수 있다.
