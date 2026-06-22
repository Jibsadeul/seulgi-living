# chat 백엔드 명세

## 목적

chat service는 MongoDB에 채팅 세션/메시지를 저장하고, `@google/genai`로 AI 답변을 생성한다. AI 답변은 Vertex AI Search retrieval 결과를 근거로 청년 정책과 레시피 범위에서만 생성한다.

## 책임

- 인증된 사용자 ID 기준으로 세션을 생성하고 조회한다.
- 채팅 메시지를 MongoDB에 저장한다.
- 사용자 나이와 거주지 컨텍스트를 AI 요청에 포함한다.
- Google GenAI 요청을 구성하고 응답 텍스트를 반환한다.
- 세션 제목과 마지막 메시지 정보를 갱신한다.

## MongoDB 접근

- MongoDB 접근은 API 서버 내부에서 `mongodb` 공식 드라이버로 구현한다.
- 기존 `packages/db` Prisma datasource는 PostgreSQL이므로 MongoDB용 Prisma client를 만들지 않는다.
- MongoDB client는 서버 런타임에서 재사용 가능한 singleton 형태로 관리한다.
- 환경변수:
  - `MONGODB_URI`
  - `MONGODB_DB_NAME`

## 컬렉션 초안

### `chat_sessions`

```ts
{
  _id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessage: string | null;
}
```

### `chat_messages`

```ts
{
  _id: string;
  sessionId: string;
  userId: string;
  role: 'user' | 'model';
  content: string;
  createdAt: Date;
}
```

## 세션 규칙

- 세션 ID와 메시지 ID는 UUID를 사용한다.
- 세션은 인증된 사용자 ID와 함께 저장한다.
- 세션 목록은 `updatedAt` 내림차순으로 조회한다.
- 세션 목록에는 첫 메시지를 보낸 기록만 포함한다.
- `title`이 비어 있거나 `lastMessage`가 `null`인 빈 세션은 채팅 기록으로 보지 않는다.
- 세션 제목은 첫 사용자 질문을 기준으로 저장한다.
- 첫 질문이 매우 길어도 저장값은 원문을 유지하고, 표시 생략은 모바일 UI에서 처리한다.
- 사용자별 채팅 기록은 최근 5개만 저장한다.
- 5개를 초과하면 `updatedAt` 기준 오래된 세션과 해당 세션의 메시지를 함께 삭제한다.
- 사용자가 직접 선택해서 삭제하는 기능은 이번 범위에 포함하지 않는다.

## AI 호출 규칙

- API 서버는 `@google/genai`의 `GoogleGenAI`를 사용한다.
- 모델은 `gemini-3.1-flash-lite`를 사용한다.
- `GOOGLE_CLOUD_API_KEY`로 SDK를 초기화한다.
- retrieval 도구는 아래 datastore를 사용한다.

```text
projects/jibsadeul/locations/global/collections/default_collection/dataStores/seulgi-living-ds-v3
```

- 첫 구현에서는 실제 streaming API를 클라이언트에 노출하지 않는다.
- 서버는 완성된 답변 텍스트를 만든 뒤 JSON 응답으로 반환한다.
- 사용자가 제공한 이전 대화 메시지를 `contents`에 포함해 세션 맥락을 유지한다.
- 대화 맥락은 현재 세션의 메시지만 사용한다.

## 시스템 프롬프트 규칙

기본 시스템 프롬프트는 다음 방향을 따른다.

- 역할: 청년 정책과 레시피 정보를 안내하는 도우미
- 근거: 연결된 데이터스토어 검색 결과만 사용
- 금지: 검색 결과에 없는 내용 추측 금지
- 범위: 청년 정책과 레시피 외 질문은 정중히 거절
- 말투: 친근하고 명확한 한국어
- 개인화: 사용자 나이와 거주지를 조건으로 포함

사용자 컨텍스트가 있을 경우 프롬프트에 다음 정보를 추가한다.

- 나이: `{age}`
- 거주지: `{residence}`

사용자 질문에 나이 또는 지역 조건이 직접 포함되어 있으면, 질문에 포함된 조건을 우선한다.

## 저장 순서

메시지 전송 처리 순서:

1. 세션 소유자가 인증된 사용자와 일치하는지 확인한다.
2. 사용자 메시지를 검증한다.
3. 사용자 메시지를 MongoDB에 저장한다.
4. 세션 제목이 비어 있으면 첫 질문으로 갱신한다.
5. 현재 세션의 기존 메시지를 조회한다.
6. Google GenAI 요청을 구성한다.
7. AI 응답 텍스트를 생성한다.
8. AI 메시지를 MongoDB에 저장한다.
9. 세션 `updatedAt`, `lastMessage`를 갱신한다.
10. 사용자별 최근 5개를 초과한 오래된 세션과 메시지를 삭제한다.
11. 사용자 메시지, AI 메시지, 세션 정보를 반환한다.

## 오류 처리

- 요청 검증 실패는 400으로 반환한다.
- 인증 실패는 401로 반환한다.
- 세션이 없거나 소유자가 다르면 404로 반환한다.
- MongoDB 연결 또는 저장 실패는 500으로 반환한다.
- Google GenAI 호출 실패는 502로 반환한다.
- Google 응답에 텍스트가 없으면 502로 반환한다.
- AI 응답 생성 또는 AI 메시지 저장 실패 시 방금 저장한 사용자 메시지는 삭제한다.
- 신규 빈 세션의 첫 메시지 처리 중 실패하면 해당 세션도 삭제한다.
- 기존 세션의 추가 메시지 처리 중 실패하면 세션 `title`, `lastMessage`, `updatedAt`은 실패 전 값으로 복구한다.

## 검증 기준

- MongoDB 컬렉션은 사용자별 세션과 메시지를 분리해서 조회할 수 있다.
- 세션 소유자 검증 없이 메시지 조회/전송이 불가능하다.
- 첫 질문이 세션 제목으로 저장된다.
- 빈 세션은 세션 목록에 반환되지 않는다.
- 사용자별 채팅 기록은 최근 5개를 초과하지 않는다.
- AI 응답까지 성공적으로 저장되지 않은 사용자 메시지는 채팅 기록에 남지 않는다.
- AI 호출은 API 서버에서만 수행된다.
- 모바일로 전달되는 응답에는 Google API key, datastore 상세 인증 정보, MongoDB 연결 정보가 포함되지 않는다.
