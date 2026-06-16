# Header 컴포넌트 spec

## 목적

앱 전체에서 사용하는 공통 헤더 컴포넌트. 화면 유형에 따라 3가지 variant를 제공한다.

---

## Variant 정의

| variant   | 좌측          | 중앙/타이틀        | 우측               | 사용 화면                              |
| --------- | ------------- | ------------------ | ------------------ | -------------------------------------- |
| `default` | 없음          | 타이틀 (왼쪽 정렬) | 없음               | 탭 루트 화면 (홈, 레시피, 청년정책 등) |
| `back`    | 뒤로가기 버튼 | 타이틀 (왼쪽 정렬) | 없음               | 일반 스택 화면                         |
| `detail`  | 뒤로가기 버튼 | 타이틀 (왼쪽 정렬) | 스크랩 + 공유 버튼 | 정책 상세, 레시피 상세                 |

---

## Props

```typescript
interface HeaderProps {
  title: string;
  variant?: 'default' | 'back' | 'detail'; // 기본값: 'default'
}
```

- `onScrap`, `onShare` 콜백은 1차에서 구현하지 않음 (껍데기만)

---

## 레이아웃 스펙

- 높이: 64pt (design.md 기준)
- 배경색: `#FFFFFF` (surface-default)
- 좌우 패딩: 16pt
- Safe Area top: `useSafeAreaInsets().top` 으로 동적 처리
- 타이틀: 왼쪽 정렬, 16pt, gray-90 (`#1D1D1D`), fontWeight 600

### 뒤로가기 버튼

- `useRouter().back()` 자동 연결
- 아이콘: `assets/icons/` 내 화살표 아이콘 사용 (없으면 텍스트 `←` 대체)
- 버튼과 타이틀 사이 간격: 8pt

### 스크랩 버튼 (`detail` 한정)

- 아이콘: 북마크 형태
- 동작: 미구현 (껍데기)

### 공유 버튼 (`detail` 한정)

- 아이콘: 공유 형태
- 동작: 미구현 (껍데기)
- 스크랩 버튼과 간격: 16pt

---

## 사용 예시

```tsx
// 탭 화면
<Header title="청년정책" />

// 일반 스택 화면
<Header title="정책 상세" variant="back" />

// 상세 화면 (공유/스크랩)
<Header title="정책 상세" variant="detail" />
```

---

## 배치 위치

- 파일: `apps/mobile/src/shared/ui/Header.tsx`
- 외부 export: `apps/mobile/src/shared/ui/index.ts` (배럴 추가)
