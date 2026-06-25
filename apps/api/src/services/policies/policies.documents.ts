import { type PolicyRequiredDocument } from '@repo/contract';

// 청년 정책에서 반복적으로 등장하는 서류 종류만 큐레이션한 키워드 → 발급기관 매핑
const DOCUMENT_AGENCY_MAP: { keywords: string[]; agencyName: string; agencyUrl: string }[] = [
  {
    keywords: ['주민등록등본', '주민등록초본'],
    agencyName: '정부24',
    agencyUrl: 'https://www.gov.kr',
  },
  {
    keywords: ['가족관계증명서'],
    agencyName: '정부24',
    agencyUrl: 'https://www.gov.kr',
  },
  {
    keywords: ['건강보험자격득실확인서'],
    agencyName: '정부24',
    agencyUrl: 'https://www.gov.kr',
  },
  {
    keywords: ['소득금액증명'],
    agencyName: '홈택스',
    agencyUrl: 'https://www.hometax.go.kr',
  },
  {
    keywords: ['등기부등본'],
    agencyName: '인터넷등기소',
    agencyUrl: 'https://www.iros.go.kr',
  },
  {
    keywords: ['재학증명서', '졸업증명서'],
    agencyName: '정부24',
    agencyUrl: 'https://www.gov.kr',
  },
];

// 원문에 "건강보험자격득실 확인서"처럼 키워드 중간에 공백이 섞여 들어오는 경우가 있어,
// 공백을 모두 제거하고 비교한다.
const stripSpaces = (text: string): string => text.replace(/\s/g, '');

// 섹션 제목(name) + 세부 조건(details) 전체에서 키워드를 찾는다 — 실제 서류명이
// 세부 조건 줄에만 있는 경우(예: "소득확인" 섹션의 "세무서발급 소득금액증명원")가 많다.
function findAgency(text: string): { agencyName: string; agencyUrl: string } | null {
  const normalized = stripSpaces(text);
  for (const entry of DOCUMENT_AGENCY_MAP) {
    if (entry.keywords.some((keyword) => normalized.includes(stripSpaces(keyword)))) {
      return { agencyName: entry.agencyName, agencyUrl: entry.agencyUrl };
    }
  }
  return null;
}

// 줄바꿈 없는 한 줄짜리 텍스트에서 이 표현들이 보이면 서류 목록이 아니라 안내 문장으로 판단한다.
// (예: "별도의 서류 제출은 불필요하며, 증빙 필요 시 서민금융진흥원에서 별도 안내 예정")
const SENTENCE_MARKER_PATTERN =
  /(불필요|필요\s*시|예정|바랍니다|확인해주시기|해주세요|입니다|습니다)/;

// 원문은 "□" 또는 "1." 같은 큰 글머리표로 시작하는 줄이 분류(예: "본인 확인 서류", "3. 증빙서류")이고,
// 그 아래 가/나/다, '①②③', '-', '※' 등은 해당 분류의 세부 조건이다. 세부 조건까지 전부 별도 카드로
// 쪼개면 한 정책에 카드가 수십 개 생겨서 오히려 읽기 어려워지므로, 큰 글머리표 단위로만 카드를 묶고
// 나머지는 그 카드 안의 글머리 목록으로 둔다.
const BOX_OR_DIGIT_PATTERN = /^(?:[□]|\d+[.)])\s*/;

// 원형 숫자(①②③...). "1./2./3."처럼 더 큰 글머리표가 전혀 없는 원문에서는 원형 숫자 자체가
// 최상위 목록이다(예: "①…②…③…" 9개가 곧 서류 9개). 반면 더 큰 글머리표가 있으면 그 아래 세부
// 조건으로 쓰인다(예: "3. 증빙서류" 아래 "①…②…" — POLICY-039 정신건강 사례).
const CIRCLED_NUMBER_PATTERN = /^[①-⑳㉑-㉟]\s*/;

// 원문에 더 큰 글머리표(□/숫자)가 있으면 그걸 섹션 마커로 쓰고, 없으면 원형 숫자를 섹션
// 마커로 승격한다. 둘 다 없으면 평면 나열로 처리되도록 BOX_OR_DIGIT_PATTERN을 그대로 반환한다
// (어차피 매칭되는 줄이 없어 `hasSectionMarker`가 false가 된다).
function resolveSectionPattern(lines: string[]): RegExp {
  if (lines.some((line) => BOX_OR_DIGIT_PATTERN.test(line))) return BOX_OR_DIGIT_PATTERN;
  if (lines.some((line) => CIRCLED_NUMBER_PATTERN.test(line))) return CIRCLED_NUMBER_PATTERN;
  return BOX_OR_DIGIT_PATTERN;
}

// 한 줄에 이 표현이 있으면 쉼표가 "서류 나열"이 아니라 "둘 중 하나를 고르라"는 의미다.
// (예: "주민등록증, 운전면허증, 여권 중 택1" — 쉼표로 쪼개면 대안 3개가 별도 서류 3건으로 잘못 분리된다.)
const CHOICE_MARKER_PATTERN = /중\s*택\s*\d*|택일|중\s*하나/;

// 쉼표/、 기준으로 분리하되, 괄호(`()`/`（）`) 안에 있는 구분자는 무시한다.
function splitOutsideParens(text: string): string[] {
  const items: string[] = [];
  let depth = 0;
  let current = '';

  for (const char of text) {
    if (char === '(' || char === '（') depth += 1;
    if (char === ')' || char === '）') depth = Math.max(0, depth - 1);

    if (depth === 0 && (char === ',' || char === '、')) {
      items.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  items.push(current);

  return items;
}

const COLON_PATTERN = /[:：]/;

// 콜론(:) 뒤(실제 서류명) 부분에서만 쉼표 분리를 적용한다. 콜론 앞부분(조건)은 쉼표가 있어도 통째로 유지한다.
function splitLine(line: string): string[] {
  if (CHOICE_MARKER_PATTERN.test(line)) return [line];

  const colonIndex = line.search(COLON_PATTERN);
  if (colonIndex === -1) return splitOutsideParens(line);

  const prefix = line.slice(0, colonIndex + 1);
  const restItems = splitOutsideParens(line.slice(colonIndex + 1));

  if (restItems.length <= 1) return [line];
  return restItems.map((item) => `${prefix}${item}`.trim());
}

// sbmsnDcmntCn 원문(자유 형식 텍스트)을 항목 리스트로 만들고, 매칭되는 발급기관 링크를 붙인다.
export function parseRequiredDocuments(raw: string | undefined | null): PolicyRequiredDocument[] {
  if (!raw || raw.trim() === '') return [];

  const lines = raw
    .split(/[\n\r]/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length <= 1 && SENTENCE_MARKER_PATTERN.test(raw)) {
    return [{ name: raw.trim() }];
  }

  // 섹션 마커(□/숫자, 없으면 원형숫자)가 전혀 없는 원문(예: 한 줄에 쉼표로 서류 5개를 나열한 경우)은
  // 섹션 묶기 대상이 아니라 평면적인 서류 나열이므로, 쉼표/콜론 기준 분리로 처리한다.
  const sectionPattern = resolveSectionPattern(lines);
  const hasSectionMarker = lines.some((line) => sectionPattern.test(line));
  if (!hasSectionMarker) {
    const items = lines
      .flatMap((line) => splitLine(line))
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    return items.map((name) => {
      const agency = findAgency(name);
      return { name, ...(agency && agency) };
    });
  }

  const sections: { name: string; detailLines: string[] }[] = [];

  for (const line of lines) {
    if (sectionPattern.test(line)) {
      sections.push({ name: line.replace(sectionPattern, '').trim(), detailLines: [] });
    } else if (sections.length > 0) {
      sections[sections.length - 1].detailLines.push(line);
    } else {
      // 섹션 마커 없이 시작하는 줄이 첫 줄에 섞여 있는 경우(드묾) — 그 줄 자체를 섹션 제목으로 둔다.
      sections.push({ name: line, detailLines: [] });
    }
  }

  return sections.map(({ name, detailLines }) => {
    const details = detailLines.length > 0 ? detailLines.join('\n') : undefined;
    const agency = findAgency(details ? `${name}\n${details}` : name);
    return {
      name,
      ...(details && { details }),
      ...(agency && agency),
    };
  });
}
