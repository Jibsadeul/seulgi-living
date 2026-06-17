const BASE_URL = 'https://www.youthcenter.go.kr/go/ythip/getPlcy';

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

interface YouthPolicyListResponse {
  resultCode: number;
  result: {
    pagging: {
      totCount: number;
      pageNum: number;
      pageSize: number;
    };
    youthPolicyList?: YouthPolicyRaw[];
  };
}

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
    next: { revalidate: 0 },
  });

  if (!response.ok) throw new Error(`Youth Policy API error: ${response.status}`);

  const data = (await response.json()) as YouthPolicyListResponse;

  return {
    policies: data.result?.youthPolicyList ?? [],
    totalCount: data.result?.pagging?.totCount ?? 0,
  };
}
