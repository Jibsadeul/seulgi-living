## UI 디자인 스펙 가이드

iPhone 17 기준 최종 확정본

---

### 1. iPhone 17 디바이스 기준

| 항목              | 값                                   |
| ----------------- | ------------------------------------ |
| 화면 크기         | 6.3인치 Super Retina XDR OLED        |
| 해상도 (물리픽셀) | 2622 × 1206 px                       |
| 논리 해상도       | 874 × 402 pt (CSS 기준)              |
| 배율 (DPR)        | @3x (1pt = 3px)                      |
| Dynamic Island    | 상단 상태바 54pt, Safe Area top 62pt |
| Safe Area bottom  | 34pt (홈 인디케이터 포함)            |
| 전체 높이         | 852pt                                |

> 단위 기준: 모든 스펙은 논리 단위(pt)로 표기합니다. Figma 작업 시 pt = px로 설정 후 export 시 @3x 적용.

---

### 2. 헤더 · Top App Bar

| 항목                | 값                                   |
| ------------------- | ------------------------------------ |
| 높이                | 64pt                                 |
| 너비                | 100%                                 |
| 배경색              | `#FFFFFF` (순백색) — 확정            |
| 좌우 패딩           | 16pt                                 |
| 상단 총 점유        | 62pt (Safe Area) + 64pt (바) = 126pt |
| Dynamic Island 대응 | Safe Area top 62pt 자동 확보 필수    |

컬럼 구성: 좌 · 메뉴 아이콘 / 중 · 서비스 타이틀 (중앙 강조) / 우 · 알림 아이콘
타이틀 중앙 배치로 브랜드 강조, 양 끝 아이콘으로 한 손 조작 균형 확보.

---

### 3. 푸터 · Bottom Navigation Bar

| 항목             | 값                                   |
| ---------------- | ------------------------------------ |
| 바 높이          | 72pt                                 |
| Safe Area bottom | 34pt (고정값 — iPhone 17 기준)       |
| 하단 총 점유     | 72 + 34 = 106pt ★ 기존 96px에서 수정 |
| 너비             | 100%                                 |
| 배경색           | `#FFFFFF` (상단 라운드 카드 스타일)  |
| 상단 패딩        | 8pt                                  |
| 하단 패딩        | Safe Area 자동 대응 (34pt)           |
| 그림자           | 0 -4px 12px rgba(0, 0, 0, 0.05)      |

5개 섹션: 탭1 / 탭2 / AI Camera (중앙 원형 64×64pt, `#EF7722`, 돌출 ~24pt) / 탭3 / 탭4

---

### 4. 디자인 시스템

**컬러**

- 브랜드 액션 컬러: `#EF7722` (오렌지)
- 페이지 배경: `#F8F9FF` (오프화이트 블루톤)
- 헤더 / 푸터 배경: `#FFFFFF` (순백색)

**타이포그래피**

- 폰트: 42dot Sans
- 제목: 20pt 이상 / 소제목: 16pt / 본문: 13pt

**간격 시스템**

- 기준 그리드: 8pt
- 마진: 16pt / 20pt

**컴포넌트 규격**

- 카드 라운드: 12~16pt
- 상단바: 64pt / 하단 네비게이션: 72pt (Safe Area 별도) / AI Camera 버튼: 64×64pt 원형

---

### 5. iPhone 17 기준 수정 사항

| 항목                       | 기존 스펙         | iPhone 17 기준          | 상태 |
| -------------------------- | ----------------- | ----------------------- | ---- |
| 헤더 높이                  | 64px              | 64pt                    | 유지 |
| Status Bar / Safe Area top | 미명시            | 62pt (Dynamic Island)   | 추가 |
| 헤더 총 점유 (상단)        | 64px              | 62 + 64 = 126pt         | 수정 |
| 하단 네비 바 높이          | 72px              | 72pt                    | 유지 |
| Safe Area bottom           | 약 20~34px (범위) | 34pt (고정)             | 수정 |
| 하단 총 점유               | 약 96px           | 72 + 34 = 106pt         | 수정 |
| 콘텐츠 유효 높이           | 미명시            | 852 − 126 − 106 = 620pt | 추가 |
| AI Camera 버튼             | 64×64px           | 64×64pt                 | 유지 |
| 좌우 패딩                  | 16px              | 16pt                    | 유지 |

> 상태 범례: 유지 = 수치 동일, 단위만 pt 통일 / 수정 = iPhone 17 실측값으로 변경 / 추가 = 기존 미명시 항목 신규 추가

---

### 6. 컬러 팔레트

기준 이미지: `local/design/팔레트.png`

#### Main

| 토큰     | NativeWind | HEX       | 용도                                  |
| -------- | ---------- | --------- | ------------------------------------- |
| Main 100 | `main-100` | `#EF7722` | 브랜드 메인, 주요 CTA, AI Camera 버튼 |
| Main 70  | `main-70`  | `#F4A065` | 메인 컬러 보조 강조                   |
| Main 50  | `main-50`  | `#F7BB91` | 선택/강조 배경                        |
| Main 30  | `main-30`  | `#FBD7BD` | 약한 강조 배경                        |
| Main 10  | `main-10`  | `#FEF2E9` | 가장 약한 메인 틴트 배경              |

#### Background

Background 계열은 NativeWind에서 `bg-*` 유틸리티와 이름이 겹치지 않도록 `surface` 토큰으로 사용한다.

| 토큰       | NativeWind        | HEX       | 용도                  |
| ---------- | ----------------- | --------- | --------------------- |
| Bg Default | `surface-default` | `#FFFFFF` | 기본 화면 배경        |
| Bg Card    | `surface-card`    | `#F8F9FF` | 카드형 기본 배경      |
| Bg Confirm | `surface-confirm` | `#979593` | 확인/비활성 보조 배경 |

#### Point

| 토큰      | NativeWind  | HEX       | 용도                               |
| --------- | ----------- | --------- | ---------------------------------- |
| Point 100 | `point-100` | `#BA1A1A` | 에러, 삭제, 위험 강조              |
| Point 50  | `point-50`  | `#DD8D8D` | 약한 에러/위험 배경 또는 보조 강조 |

#### Tag Background

| 토큰       | NativeWind   | HEX       |
| ---------- | ------------ | --------- |
| Tag Pink   | `tag-pink`   | `#FFE2E5` |
| Tag Blue   | `tag-blue`   | `#DCE9FF` |
| Tag Green  | `tag-green`  | `#E1F5EE` |
| Tag Orange | `tag-orange` | `#FFF0E6` |
| Tag Yellow | `tag-yellow` | `#FAEEDA` |
| Tag Grey   | `tag-grey`   | `#F0F0F0` |

#### Tag Text

| 토큰            | NativeWind       | HEX       |
| --------------- | ---------------- | --------- |
| Tag Text Pink   | `tagText-pink`   | `#ED3241` |
| Tag Text Blue   | `tagText-blue`   | `#2563EB` |
| Tag Text Green  | `tagText-green`  | `#085041` |
| Tag Text Orange | `tagText-orange` | `#EF7722` |
| Tag Text Yellow | `tagText-yellow` | `#633806` |
| Tag Text Grey   | `tagText-grey`   | `#555555` |

#### Grayscale

| 토큰    | NativeWind        | HEX       | 용도                      |
| ------- | ----------------- | --------- | ------------------------- |
| White   | `surface-default` | `#FFFFFF` | 흰색 배경                 |
| Gray 5  | `gray-5`          | `#F8F8F8` | 가장 약한 회색 배경       |
| Gray 10 | `gray-10`         | `#F0F0F0` | 구분 배경, 태그 회색 배경 |
| Gray 20 | `gray-20`         | `#E4E4E4` | 약한 보더                 |
| Gray 30 | `gray-30`         | `#D8D8D8` | 일반 보더                 |
| Gray 40 | `gray-40`         | `#C6C6C6` | 비활성 보더               |
| Gray 50 | `gray-50`         | `#8E8E8E` | 보조 텍스트               |
| Gray 60 | `gray-60`         | `#717171` | 중간 강조 텍스트          |
| Gray 70 | `gray-70`         | `#555555` | 기본 보조 텍스트          |
| Gray 80 | `gray-80`         | `#2D2D2D` | 주요 본문 텍스트          |
| Gray 90 | `gray-90`         | `#1D1D1D` | 최상위 제목/강조 텍스트   |

NativeWind 클래스에서는 용도 접두사를 붙여 사용한다. 예: `bg-main-100`, `text-gray-90`, `border-gray-20`, `bg-surface-card`, `text-tagText-pink`.
