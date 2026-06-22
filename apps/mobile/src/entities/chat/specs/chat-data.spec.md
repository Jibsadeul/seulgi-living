# chat 데이터 명세

## 목적

모바일 chat entity는 AI 챗 세션과 메시지 데이터를 API와 연동하고, 화면/feature에서 사용할 수 있는 타입과 query/mutation을 제공한다.

## 범위

### entities/chat

- chat 세션 타입을 정의한다.
- chat 메시지 타입을 정의한다.
- 세션 생성 mutation을 제공한다.
- 세션 목록 query를 제공한다.
- 세션 메시지 query를 제공한다.
- 메시지 전송 mutation을 제공한다.
- API 응답은 `@repo/contract` Zod 스키마를 기준으로 검증한다.

## 데이터 구조

### ChatRole

```ts
type ChatRole = 'user' | 'model';
```

### ChatMessage

```ts
type ChatMessage = {
  id: string;
  sessionId: string;
  role: ChatRole;
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

### ChatUserContext

```ts
type ChatUserContext = {
  age?: number | null;
  residence?: string | null;
};
```

## API 연동

- `POST /api/ai/chat/sessions`
  - 첫 메시지를 보내기 직전에 새 세션을 생성한다.
- `GET /api/ai/chat/sessions`
  - 로그인 사용자의 최근 채팅 기록 목록을 조회한다.
  - 서버는 첫 메시지가 있는 세션만 최대 5개 반환한다.
- `GET /api/ai/chat/sessions/:sessionId`
  - 특정 세션의 메시지를 조회한다.
- `POST /api/ai/chat/sessions/:sessionId/messages`
  - 사용자 메시지를 전송하고 AI 응답을 받는다.

## 사용자 컨텍스트

- 메시지 전송 시 Zustand에 저장된 사용자 나이와 거주지를 함께 보낸다.
- store 경로와 필드명은 구현 시 기존 member/auth 관련 Zustand store를 확인해 맞춘다.
- 나이 또는 거주지 값이 없으면 해당 필드는 `null` 또는 생략한다.
- 모바일은 개인화 문구를 직접 만들지 않고, API에 컨텍스트만 전달한다.

## 클라이언트 상태

chat UI에서 필요한 최소 상태:

- 현재 열린 세션 ID
- 현재 세션 메시지 목록
- 세션 목록
- 메시지 전송 loading 상태
- AI 답변 타이핑 애니메이션 상태
- 에러 메시지

서버에 저장된 채팅 기록이 단일 진실이다. 모바일 로컬 상태는 화면 표시와 타이핑 애니메이션을 위한 임시 상태로만 사용한다.

## 캐시 규칙

- 세션 목록 query key는 chat 도메인 key 하위에 둔다.
- 세션 메시지 query key는 `sessionId`를 포함한다.
- 첫 메시지를 보내기 위해 새 세션을 생성한 후 세션 목록 캐시를 갱신한다.
- 메시지 전송 성공 후 현재 세션 메시지와 세션 목록 캐시를 갱신한다.
- 메시지 전송 실패 후 현재 세션 메시지와 세션 목록은 실패 요청이 반영되지 않은 서버 상태를 기준으로 다시 표시한다.
- 채팅 기록 삭제는 이번 범위에 없으므로 삭제 mutation은 만들지 않는다.

## 검증 기준

- 모바일은 Google API를 직접 호출하지 않는다.
- 모바일은 MongoDB에 직접 접근하지 않는다.
- 메시지 전송 payload에 나이/거주지 컨텍스트를 포함할 수 있다.
- API 응답은 contract schema 검증을 통과한 데이터만 화면에 전달된다.
- 메시지 전송 성공 후 사용자 메시지와 AI 메시지가 같은 세션에 표시된다.
- 새 채팅 버튼만 누른 빈 대화는 서버 기록으로 저장하거나 세션 목록에 표시하지 않는다.
- 세션 목록은 서버 기준 최근 5개를 초과하지 않는다.
- 메시지 전송 실패 시 실패한 사용자 메시지는 기록에 남지 않는다.
