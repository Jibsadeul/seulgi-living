# chat API 명세

## 목적

모바일 AI 챗 기능에서 사용하는 세션 생성, 세션 목록 조회, 세션 메시지 조회, 메시지 전송 API를 정의한다.

모든 요청/응답 타입은 `packages/contract`의 Zod 스키마를 단일 진실로 사용한다.

## 공통 규칙

- 모든 API는 로그인 사용자를 전제로 한다.
- 인증된 사용자 ID를 기준으로 채팅 세션과 메시지 접근 권한을 제한한다.
- 다른 사용자의 세션 ID로 조회하거나 메시지를 전송할 수 없다.
- Google API key와 MongoDB 연결 정보는 API 서버 환경변수에서만 사용한다.
- 모바일 앱은 Google API 또는 MongoDB에 직접 접근하지 않는다.
- API 응답은 실제 스트리밍을 하지 않고 완성된 JSON 응답을 한 번에 반환한다.

## 환경변수

| 이름                   | 필수 | 설명                                            |
| ---------------------- | ---- | ----------------------------------------------- |
| `GOOGLE_CLOUD_API_KEY` | 예   | `@google/genai` 호출에 사용하는 API key         |
| `MONGODB_URI`          | 예   | MongoDB Atlas 연결 문자열                       |
| `MONGODB_DB_NAME`      | 예   | 채팅 세션/메시지를 저장할 MongoDB database 이름 |

## 데이터 타입

### ChatRole

```ts
type ChatRole = 'user' | 'model';
```

### ChatMessage

```ts
type ChatMessage = {
  id: string;
  sessionId: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
};
```

### ChatSession

```ts
type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessage: string | null;
};
```

## 새 세션 생성

`POST /api/ai/chat/sessions`

### 요청

요청 body는 비어 있어도 된다.

### 응답

```ts
{
  session: ChatSession;
}
```

### 규칙

- 세션 ID는 UUID로 생성한다.
- 최초 생성 시 `title`은 빈 문자열 또는 기본 제목으로 둔다.
- 첫 사용자 메시지가 저장될 때 세션 제목을 첫 질문 기반으로 갱신한다.

## 세션 목록 조회

`GET /api/ai/chat/sessions`

### 응답

```ts
{
  sessions: ChatSession[];
}
```

### 규칙

- 인증된 사용자의 세션만 반환한다.
- `updatedAt` 내림차순으로 정렬한다.
- 첫 메시지가 없는 빈 세션은 반환하지 않는다.
- 사용자별 최근 5개 세션만 반환한다.
- 5개 초과 기록은 메시지 전송 성공 후 서버에서 오래된 순으로 삭제한다.
- 사용자가 직접 선택해서 삭제하는 기능은 이번 범위에 포함하지 않는다.

## 세션 메시지 조회

`GET /api/ai/chat/sessions/:sessionId`

### 응답

```ts
{
  session: ChatSession;
  messages: ChatMessage[];
}
```

### 규칙

- 인증된 사용자의 세션만 조회할 수 있다.
- 메시지는 `createdAt` 오름차순으로 반환한다.
- 세션이 없거나 소유자가 다르면 404를 반환한다.

## 메시지 전송

`POST /api/ai/chat/sessions/:sessionId/messages`

### 요청

```ts
{
  message: string;
  userContext?: {
    age?: number | null;
    residence?: string | null;
  };
}
```

### 응답

```ts
{
  userMessage: ChatMessage;
  modelMessage: ChatMessage;
  session: ChatSession;
}
```

### 규칙

- `message`는 공백 제거 후 빈 문자열일 수 없다.
- 사용자 메시지를 먼저 MongoDB에 저장한다.
- 기존 세션 메시지와 `userContext`를 기반으로 Google GenAI 요청을 구성한다.
- AI 응답을 MongoDB에 저장한 뒤 응답 body로 반환한다.
- 첫 사용자 메시지라면 세션 `title`을 해당 질문으로 갱신한다.
- 제목은 원문을 저장하되, UI에서 말줄임 처리한다.
- Google 호출 실패 시 사용자 메시지 저장 여부는 구현 시 일관되게 처리한다.
  - 권장: 사용자 메시지는 저장하고, AI 응답 생성 실패를 502로 반환한다.
  - 클라이언트는 실패 상태를 표시하고 재시도할 수 있다.

## 오류

| 상태 | 조건                                                |
| ---- | --------------------------------------------------- |
| 400  | 요청 body 형식 오류, 빈 메시지                      |
| 401  | 인증되지 않은 요청                                  |
| 404  | 세션이 없거나 사용자의 세션이 아님                  |
| 500  | MongoDB 연결/저장 실패 등 서버 내부 오류            |
| 502  | Google GenAI 호출 실패 또는 유효한 텍스트 응답 없음 |

### 실패 시 저장 규칙

- AI 응답 생성 또는 AI 메시지 저장 실패 시 사용자 메시지는 채팅 기록에 남기지 않는다.
- 첫 메시지 처리 중 실패한 신규 세션은 삭제한다.
- 기존 세션에서 추가 메시지 처리 중 실패하면 실패 전 세션 미리보기 상태로 복구한다.

## 검증 기준

- 인증된 사용자만 자신의 채팅 세션 목록을 조회할 수 있다.
- 빈 세션은 채팅 기록으로 보지 않으며 목록에 반환되지 않는다.
- 사용자별 채팅 기록은 최근 5개까지만 저장된다.
- AI 응답까지 저장되지 않은 실패 요청은 세션 목록과 메시지 목록에 남지 않는다.
- 첫 메시지 전송 후 세션 제목이 첫 질문 기반으로 갱신된다.
- 메시지 전송 응답은 사용자 메시지와 AI 메시지를 함께 반환한다.
- API 응답은 스트리밍이 아닌 JSON으로 완료 응답을 반환한다.
- Google API key와 MongoDB URI는 클라이언트 번들에 노출되지 않는다.
