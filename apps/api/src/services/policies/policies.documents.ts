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

function findAgency(documentName: string): { agencyName: string; agencyUrl: string } | null {
  for (const entry of DOCUMENT_AGENCY_MAP) {
    if (entry.keywords.some((keyword) => documentName.includes(keyword))) {
      return { agencyName: entry.agencyName, agencyUrl: entry.agencyUrl };
    }
  }
  return null;
}

// 줄바꿈 없는 한 줄짜리 텍스트에서 이 표현들이 보이면 서류 목록이 아니라 안내 문장으로 판단한다.
// (예: "별도의 서류 제출은 불필요하며, 증빙 필요 시 서민금융진흥원에서 별도 안내 예정" — 쉼표로 쪼개면
// 문장이 두 개의 가짜 서류 항목으로 갈라진다.)
const SENTENCE_MARKER_PATTERN =
  /(불필요|필요\s*시|예정|바랍니다|확인해주시기|해주세요|입니다|습니다)/;

// 쉼표/、 기준으로 분리하되, 괄호(­`()`/`（）`) 안에 있는 구분자는 무시한다.
// (예: "주민등록초본(신청월 발급분, 최근 5년간 주소 및 신고일 포함)" — 괄호 안 쉼표까지 자르면
// "최근 5년간 주소 및 신고일 포함)"가 별도 서류 항목으로 잘못 분리된다.)
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

// sbmsnDcmntCn 원문(자유 형식 텍스트)을 항목 리스트로 분리하고, 매칭되는 발급기관 링크를 붙인다.
export function parseRequiredDocuments(raw: string | undefined | null): PolicyRequiredDocument[] {
  if (!raw || raw.trim() === '') return [];

  const lines = raw
    .split(/[\n\r]/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length <= 1 && SENTENCE_MARKER_PATTERN.test(raw)) {
    return [{ name: raw.trim() }];
  }

  const items = lines
    .flatMap((line) => splitOutsideParens(line))
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return items.map((name) => {
    const agency = findAgency(name);
    return agency ? { name, ...agency } : { name };
  });
}
