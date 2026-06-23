# 설정 메뉴 바텀시트 spec

## 기능 정의

홈 헤더의 설정 버튼을 누르면 메뉴 바텀시트가 열린다. 4개 항목으로 계정 관련 액션과 내 레시피 진입점을 제공한다.

## UI 구조

```
설정 버튼 (HomeHeader)
  └→ SettingsMenuBottomSheet
       ├── 개인정보 수정
       ├── My 레시피       (버튼만, 미연결)
       ├── 로그아웃
       └── 회원탈퇴
```

## 각 항목 동작

| 항목          | 동작                                        |
| ------------- | ------------------------------------------- |
| 개인정보 수정 | 메뉴 닫고 기존 `MemberInfoBottomSheet` 열기 |
| My 레시피     | 미연결 (TODO)                               |
| 로그아웃      | Alert 확인 후 로그아웃 → 로그인 화면        |
| 회원탈퇴      | Alert 확인 후 탈퇴 → 로그인 화면            |

## 로직 이동 원칙

- 개인정보 수정 로직: `MemberInfoBottomSheet` 그대로 유지
- 로그아웃/회원탈퇴 로직: `MemberInfoBottomSheet` → `SettingsMenuBottomSheet`로 이동 (로직 변경 없음)

## 변경 범위

| 파일                                                          | 변경 내용                                                      |
| ------------------------------------------------------------- | -------------------------------------------------------------- |
| `src/features/member-settings/ui/SettingsMenuBottomSheet.tsx` | 신규 — 메뉴 바텀시트 (로그아웃/회원탈퇴 로직 포함)             |
| `src/features/member-settings/index.ts`                       | 신규 — 배럴 export                                             |
| `src/screens/members/ui/MemberInfoBottomSheet.tsx`            | edit 모드에서 로그아웃/회원탈퇴 섹션만 제거                    |
| `src/screens/home/ui/HomeScreen.tsx`                          | `isSettingsMenuOpen` 상태 추가, `SettingsMenuBottomSheet` 연결 |
