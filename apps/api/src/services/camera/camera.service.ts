import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  cameraAnalyzeRequestSchema,
  cameraAnalyzeResponseSchema,
  fridgeCategorySchema,
  type CameraAnalysisSource,
  type CameraAnalyzeResponse,
} from '@repo/contract';
import { z } from 'zod';
import { errors } from '@/shared/lib/error';

const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? process.env.GEMINI_API_KEY ?? '';

function normalizeCategory(value: unknown) {
  const parsed = fridgeCategorySchema.safeParse(value);

  return parsed.success ? parsed.data : 'OTHER';
}

const looseGeminiItemSchema = z.object({
  name: z.preprocess((value) => (value == null ? '이름 미확인' : value), z.string().trim().min(1)),
  category: z.preprocess(normalizeCategory, fridgeCategorySchema),
  quantity: z.preprocess((value) => (value == null ? 1 : value), z.coerce.number().positive()),
  unit: z.preprocess(
    (value) => (value == null || value === '' ? '개' : value),
    z.string().trim().min(1),
  ),
  price: z.union([z.coerce.number().nonnegative(), z.null()]).optional().nullable(),
});

const looseGeminiResponseSchema = z.object({
  items: z.array(looseGeminiItemSchema),
});

const categoryGuide = [
  'VEGETABLE: 채소',
  'FRUIT: 과일',
  'MEAT: 육류',
  'SEAFOOD: 수산물',
  'EGG_DAIRY: 달걀·유제품',
  'GRAIN_NOODLE: 곡류·면',
  'PROCESSED: 가공식품',
  'SAUCE_SEASONING: 양념·소스',
  'OTHER: 기타',
].join('\n');

const commonOutputRule = `
반드시 설명, 마크다운, 코드블록 없이 순수 JSON 객체 하나만 반환한다.
반환 형식은 다음 구조를 정확히 따른다.
{
  "items": [
    {
      "name": "항목명",
      "category": "VEGETABLE",
      "quantity": 1,
      "unit": "개",
      "price": null
    }
  ]
}

category는 아래 enum 값 중 하나만 사용한다.
${categoryGuide}
`;

const prompts: Record<CameraAnalysisSource, string> = {
  RECEIPT: `
너는 영수증 이미지에서 장보기 항목을 추출하는 분석기다.
영수증의 구매 항목을 빠짐없이 찾아 name, category, quantity, unit, price를 반환한다.
price는 해당 항목의 총 금액을 숫자로 입력하고, 읽을 수 없으면 null로 둔다.
할인, 합계, 결제수단, 매장명은 items에 넣지 않는다.
${commonOutputRule}
`,
  INGREDIENT: `
너는 식재료 사진에서 냉장고에 등록할 식재료를 추출하는 분석기다.
사진에 보이는 식재료를 빠짐없이 찾아 name, category, quantity, unit을 반환한다.
식재료 사진은 가격 정보가 없으므로 모든 item의 price는 반드시 null로 둔다.
${commonOutputRule}
`,
};

function extractJsonObject(text: string): unknown {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start < 0 || end < start) {
    throw errors.validation('Gemini 응답에서 JSON 객체를 찾을 수 없습니다.');
  }

  try {
    return JSON.parse(text.slice(start, end + 1)) as unknown;
  } catch {
    throw errors.validation('Gemini 응답을 JSON으로 파싱할 수 없습니다.');
  }
}

function normalizeGeminiResponse(
  source: CameraAnalysisSource,
  value: unknown,
): CameraAnalyzeResponse {
  const parsed = looseGeminiResponseSchema.parse(value);

  return cameraAnalyzeResponseSchema.parse({
    source,
    items: parsed.items.map((item) => ({
      ...item,
      price: source === 'INGREDIENT' ? null : (item.price ?? null),
    })),
  });
}

async function generateImageAnalysis(base64: string, mimeType: string, prompt: string) {
  if (!GEMINI_API_KEY) {
    throw errors.validation('Gemini API 키가 설정되지 않았습니다.');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: prompt,
  });

  const result = await model.generateContent([
    {
      inlineData: {
        data: base64,
        mimeType,
      },
    },
  ]);

  return result.response.text();
}

export async function analyzeCameraImage(payload: unknown): Promise<CameraAnalyzeResponse> {
  const request = cameraAnalyzeRequestSchema.parse(payload);
  const text = await generateImageAnalysis(
    request.base64,
    request.mimeType,
    prompts[request.source],
  );
  const json = extractJsonObject(text);

  return normalizeGeminiResponse(request.source, json);
}
