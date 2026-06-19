# 청년 정책 메인 화면 UI 명세

> Figma 노드 `364:2074 (정책메인페이지)` 기준.
> 기능/데이터 명세는 `policy-main.spec.md`를 참조한다.

---

## 화면 기본

| 항목     | 값                                           |
| -------- | -------------------------------------------- |
| 프레임   | 402 × 874px                                  |
| 배경     | #FFFFFF                                      |
| 레이아웃 | column, gap: 19px                            |
| 효과     | box-shadow: 0px 4px 4px 0px rgba(0,0,0,0.25) |

---

## 공통 디자인 토큰

### 색상

| 토큰              | 값                                                                            | 사용처                         |
| ----------------- | ----------------------------------------------------------------------------- | ------------------------------ |
| 브랜드 주색       | #EF7722                                                                       | D-day 뱃지, CTA 텍스트, 아이콘 |
| 브랜드 연색       | #FFEBDC                                                                       | CTA 버튼 배경                  |
| 브랜드 그라디언트 | `linear-gradient(198deg, #FAC7A2 0%, #F5A368 11%, #F1653A 41%, #EF7722 100%)` | 배너 카드 테두리               |
| 텍스트 강         | #303030, #24252C, #000000                                                     | 헤더, 섹션 제목, 카드 본문     |
| 텍스트 중         | #574237                                                                       | 빠른 탐색 버튼 라벨            |
| 텍스트 약         | #8F9098, #868686, #71727A, #B2B2B2                                            | 칩 라벨, 기간 서브텍스트, 탭   |
| 테두리 기본       | #D4D6DD                                                                       | 검색바, 필터 칩                |
| 테두리 빠른탐색   | #DEC1B2                                                                       | 빠른 탐색 버튼                 |
| 카드 배지         | #C2C2C2                                                                       | 카테고리 뱃지 테두리           |
| 활성 탭           | #3C3C3C                                                                       | 하단 탭 활성 텍스트            |

### 타이포그래피

| 스타일             | 폰트                                             | 사용처                  |
| ------------------ | ------------------------------------------------ | ----------------------- |
| Lexend/SemiBold/19 | Lexend Deca SemiBold 19px                        | 헤더 타이틀 "정책"      |
| Lexend/SemiBold/14 | Lexend Deca SemiBold 14px                        | 배너 "바로가기" 버튼    |
| Noto/Medium/20     | Noto Sans Medium 20px, 28px lh                   | 배너 정책명             |
| Noto/Regular/14    | Noto Sans Regular 14px                           | 배너 부제, 카드 설명    |
| Noto/SemiBold/18   | Noto Sans SemiBold 18px                          | 섹션 제목               |
| Noto/SemiBold/17   | Noto Sans SemiBold 17px                          | 카드 정책명             |
| Noto/SemiBold/14   | Noto Sans SemiBold 14px                          | 카드 신청기간, CTA 버튼 |
| Noto/Regular/12    | Noto Sans Regular 12px                           | 카드 카테고리 뱃지      |
| Noto/Medium/12     | Noto Sans Medium 12px, 16px lh, letterSpacing 2% | 필터 칩 텍스트          |
| Inter/Regular/12   | Inter Regular 12px, 150% lh                      | 검색바 placeholder      |
| Inter/Medium/10    | Inter Medium 10px, 12px lh                       | 빠른 탐색 버튼 라벨     |
| Noto/Regular/10    | Noto Sans Regular 10px                           | 하단 탭 라벨 (비활성)   |
| Noto/SemiBold/10   | Noto Sans SemiBold 10px                          | 하단 탭 라벨 (활성)     |
| Roboto/Regular/24  | Roboto Regular 24px, 32px lh                     | D-day 뱃지 숫자         |

---

## 섹션별 상세

### 1. 헤더

- 높이: 55px
- 타이틀 "정책": Lexend Deca SemiBold 19px, #303030

---

### 2. 마감 임박 배너 카드

- 크기: 362 × 206px, border-radius: 24px
- 배경: rgba(255,255,255,0.8)
- 테두리: 1px 오렌지 그라디언트
- 효과: box-shadow: 0px 2px 4px 0px rgba(240,170,133,1)

#### 텍스트 영역 (좌측)

| 요소   | 스타일                                         |
| ------ | ---------------------------------------------- |
| 부제   | Noto Sans Regular 14px, black, 최대 2줄        |
| 정책명 | Noto Sans Medium 20px, 28px line-height, black |

#### D-day 뱃지 (좌하단)

| 요소        | 스타일                                         |
| ----------- | ---------------------------------------------- |
| 알람 아이콘 | 32.81 × 32.81px, 오렌지                        |
| "D-{n}"     | Roboto Regular 24px, 32px line-height, #EF7722 |

#### 바로가기 버튼 (우하단, 108.27 × 35px)

| 요소        | 스타일                                          |
| ----------- | ----------------------------------------------- |
| 배경 이미지 | 썸네일 (border-radius: 9px)                     |
| 텍스트      | "바로가기" — Lexend Deca SemiBold 14px, #FFFFFF |
| 아이콘      | link-out 21.87 × 21.87px                        |

---

### 3. 검색바

- 크기: 368px width, hug height
- 레이아웃: row, gap: 8px, padding: 12px 16px
- border: 1px #D4D6DD, border-radius: 40px

| 요소             | 스타일                                       |
| ---------------- | -------------------------------------------- |
| 검색 아이콘      | 18 × 18px                                    |
| Placeholder      | Inter Regular 12px, 150% lh, #B2B2B2         |
| Placeholder 문구 | `월세, 통장, 대출 등 키워드를 검색해 보세요` |

---

### 4. 필터 칩 영역

- 레이아웃: row, overflow-scroll(x), gap: 7px, fill-width
- 맨 앞: 필터 아이콘 28 × 28px

#### 칩 스타일 (공통)

| 속성            | 값                                                        |
| --------------- | --------------------------------------------------------- |
| 레이아웃        | row, center, gap: 5px, padding: 6px 13px                  |
| 높이            | 28px, hug width                                           |
| border          | 1px #D4D6DD, border-radius: 9999px                        |
| 텍스트          | Noto Sans Medium 12px, 16px lh, letterSpacing 2%, #8F9098 |
| 드롭다운 아이콘 | 13 × 13px                                                 |

| 순서 | 라벨     |
| ---- | -------- |
| 1    | 카테고리 |
| 2    | 지역     |
| 3    | 지원유형 |
| 4    | 기간     |

---

### 5. 빠른 탐색

**섹션 제목**: Noto Sans SemiBold 18px, #24252C

**버튼 그리드**: row, gap: 20px, padding: 0 3px, 370 × 85px

| 버튼 | 라벨     |
| ---- | -------- |
| 🔥   | 마감임박 |
| 🏠   | 주거     |
| 🏦   | 금융     |
| 🔍   | 일자리   |
| 🤝   | 복지     |

- 버튼 배경: 55 × 55px, border-radius: 12px, border 1px #DEC1B2, 아이콘 28 × 28px
- 버튼 컨테이너: column, center, gap: 8px
- 라벨: Inter Medium 10px, 12px lh, #574237, 가운데 정렬

---

### 6. 맞춤 추천 섹션

**섹션 헤더**: Noto Sans SemiBold 18px, #24252C + 전구 아이콘 21 × 21px

**카드 캐러셀**: 전체 너비 608.38px (화면 밖으로 넘침 → 가로 스크롤)

#### 정책 카드 (단위)

- 크기: 295.38 × 232px, border-radius: 24px, bg #FFFFFF
- box-shadow: 0px 4px 7px 0px rgba(110,110,110,0.25)

```
┌─────────────────────────────┐
│ [일자리]                  ★ │ ← 뱃지 (x:27,y:16) + 북마크 (x:253,y:12)
│                             │
│ {설명 2줄 말줄임}           │ ← Noto Regular 14px
│ {정책명 말줄임}             │ ← Noto SemiBold 17px
│                             │
│ 신청기간 | {기간}           │ ← SemiBold 14px, 기간 부분 #868686
│                             │
│ [       자세히보기        ] │ ← absolute (x:25, y:180), 246 × 36px
└─────────────────────────────┘
```

| 요소            | 스타일                                                                                          |
| --------------- | ----------------------------------------------------------------------------------------------- |
| 카테고리 뱃지   | Noto Regular 12px, border 1px #C2C2C2, border-radius: 15px                                      |
| 북마크 아이콘   | 24 × 24px, 우상단 절대 위치                                                                     |
| 설명 텍스트     | Noto Sans Regular 14px, black, 2줄 말줄임                                                       |
| 정책명          | Noto Sans SemiBold 17px, black, 말줄임                                                          |
| 신청기간        | Noto Sans SemiBold 14px; 기간 값은 Regular, #868686                                             |
| 자세히보기 버튼 | bg #FFEBDC, text #EF7722 Noto SemiBold 14px, border 1px #EF7722, border-radius: 5px, 246 × 36px |

---

### 7. 하단 탭 바

- 높이: 72px, fill-width
- 배경 영역: border-radius: 22px 22px 0 0

#### 탭 아이템

- 레이아웃: column, center, gap: 5px, 48.24 × ~40px

| 탭       | 아이콘 | 텍스트 스타일                   |
| -------- | ------ | ------------------------------- |
| Home     | 20×20  | Noto Regular 10px, #71727A      |
| 요리     | 24×24  | Noto Regular 10px, #71727A      |
| **정책** | 20×20  | **Noto SemiBold 10px, #3C3C3C** |
| Map      | 19×20  | Noto Regular 10px, #71727A      |

#### 중앙 액션 버튼

- 크기: 45.01 × 44px
- box-shadow: 0px 2px 2px 0px rgba(239,119,34,1)
