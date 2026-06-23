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

// sbmsnDcmntCn 원문(자유 형식 텍스트)을 줄바꿈/쉼표 기준으로 항목 리스트로 분리하고, 매칭되는 발급기관 링크를 붙인다.
export function parseRequiredDocuments(raw: string | undefined | null): PolicyRequiredDocument[] {
  if (!raw || raw.trim() === '') return [];

  const items = raw
    .split(/[\n,、]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return items.map((name) => {
    const agency = findAgency(name);
    return agency ? { name, ...agency } : { name };
  });
}
