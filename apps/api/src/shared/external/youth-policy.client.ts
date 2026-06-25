const BASE_URL = 'https://www.youthcenter.go.kr/go/ythip/getPlcy';

// 정책 원본 저장
export interface YouthPolicyRaw {
  plcyNo: string;
  plcyNm: string;
  plcyExplnCn?: string;
  plcyKywdNm?: string;
  plcyAprvSttsCd?: string;
  lclsfNm?: string;
  mclsfNm?: string;
  sprtTrgtMinAge?: string | number;
  sprtTrgtMaxAge?: string | number;
  sprtTrgtAgeLmtYn?: string;
  bizPrdBgngYmd?: string;
  bizPrdEndYmd?: string;
  aplyPrdSeCd?: string;
  aplyYmd?: string;
  aplyUrlAddr?: string;
  zipCd?: string;
  inqCnt?: string | number;
  lastMdfcnDt?: string;
}

// 정책 상세 원본 (실시간 단건 조회 — 목록 동기화용 YouthPolicyRaw보다 필드가 많음)
export interface YouthPolicyDetailRaw extends YouthPolicyRaw {
  plcySprtCn?: string;
  plcyAplyMthdCn?: string;
  srngMthdCn?: string;
  sbmsnDcmntCn?: string;
  etcMttrCn?: string;
  addAplyQlfcCndCn?: string;
  ptcpPrpTrgtCn?: string;
  sprvsnInstCdNm?: string;
  operInstCdNm?: string;
  refUrlAddr1?: string;
  refUrlAddr2?: string;
  earnCndSeCd?: string;
  earnMinAmt?: string | number;
  earnMaxAmt?: string | number;
  earnEtcCn?: string;
  sprtSclCnt?: string | number;
}

// 정책 api 응답 구조
interface YouthPolicyListResponse<T = YouthPolicyRaw> {
  resultCode: number;
  result: {
    pagging: {
      totCount: number;
      pageNum: number;
      pageSize: number;
    };
    youthPolicyList?: T[];
  };
}

// 정책 api 데이터 패치
export async function fetchYouthPolicies(
  pageNum: number,
  pageSize = 100,
): Promise<{ policies: YouthPolicyRaw[]; totalCount: number }> {
  const apiKey = process.env.YOUTH_POLICY_API_KEY;
  if (!apiKey) throw new Error('YOUTH_POLICY_API_KEY is not set');

  const params = new URLSearchParams({
    apiKeyNm: apiKey,
    pageNum: String(pageNum),
    pageSize: String(pageSize),
    pageType: '1',
    rtnType: 'json',
  });

  const response = await fetch(`${BASE_URL}?${params}`, {
    next: { revalidate: 0 }, // 캐싱옵션 -> 초 수만큼 캐시 유지
  });

  if (!response.ok) throw new Error(`Youth Policy API error: ${response.status}`);

  const data = (await response.json()) as YouthPolicyListResponse;

  return {
    policies: data.result?.youthPolicyList ?? [],
    totalCount: data.result?.pagging?.totCount ?? 0,
  };
}

// 정책 상세 단건 실시간 조회 (plcyNo로 필터링, BFF가 매 요청마다 호출)
// 온통청년 API가 동일 요청에 간헐적으로 400을 반환하는 현상이 확인되어(POLICY-038) 1회 재시도한다.
export async function fetchYouthPolicyDetail(plcyNo: string): Promise<YouthPolicyDetailRaw | null> {
  const apiKey = process.env.YOUTH_POLICY_API_KEY;
  if (!apiKey) throw new Error('YOUTH_POLICY_API_KEY is not set');

  const params = new URLSearchParams({
    apiKeyNm: apiKey,
    pageNum: '1',
    pageSize: '1',
    pageType: '1',
    rtnType: 'json',
    plcyNo,
  });

  const RETRY_DELAY_MS = 500;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));

    const response = await fetch(`${BASE_URL}?${params}`, {
      next: { revalidate: 1800 }, // 정책 내용은 30분 내 거의 안 바뀜 — 외부 API 호출 횟수를 사용자 수와 무관하게 줄임
    });

    if (response.ok) {
      const data = (await response.json()) as YouthPolicyListResponse<YouthPolicyDetailRaw>;
      return data.result?.youthPolicyList?.[0] ?? null;
    }

    const body = await response.text();
    lastError = new Error(`Youth Policy API error: ${response.status} ${body}`);
  }

  throw lastError;
}
