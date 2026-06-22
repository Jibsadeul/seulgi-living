import { GoogleGenAI, HarmBlockThreshold, HarmCategory, ThinkingLevel } from '@google/genai';
import { MongoClient, type Collection, type Db } from 'mongodb';
import {
  chatSessionListResponseSchema,
  chatSessionMessagesResponseSchema,
  chatTestRequestSchema,
  chatTestResponseSchema,
  createChatSessionResponseSchema,
  sendChatMessageRequestSchema,
  sendChatMessageResponseSchema,
  type ChatMessage,
  type ChatSession,
  type ChatSessionListResponse,
  type ChatSessionMessagesResponse,
  type ChatTestResponse,
  type ChatUserContext,
  type CreateChatSessionResponse,
  type SendChatMessageResponse,
} from '@repo/contract';
import { AppError, errors } from '@/shared/lib/error';

type GoogleServiceAccountCredentials = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

type ChatSessionDocument = {
  _id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessage: string | null;
};

type ChatMessageDocument = {
  _id: string;
  sessionId: string;
  userId: string;
  role: 'user' | 'model';
  content: string;
  createdAt: Date;
};

const CHAT_MODEL = 'gemini-3.1-flash-lite';
const DEFAULT_PROJECT_ID = 'jibsadeul';
const DEFAULT_LOCATION = 'global';
const DATASTORE =
  'projects/jibsadeul/locations/global/collections/default_collection/dataStores/seulgi-living-ds-v3';
const CHAT_SESSIONS_COLLECTION = 'chat_sessions';
const CHAT_MESSAGES_COLLECTION = 'chat_messages';
const MAX_STORED_CHAT_SESSIONS = 5;

let mongoClientPromise: Promise<MongoClient> | null = null;

const systemInstruction = `# 역할
너는 청년 정책과 레시피 정보를 안내하는 도우미야. 연결된 데이터 스토어(정책, 레시피)에 있는 내용만을 근거로 답변해.

# 핵심 규칙
- 반드시 데이터 스토어 검색 결과에 있는 정보만으로 답변해. 검색 결과에 없는 내용은 절대 지어내지 마.
- 검색 결과에서 답을 찾을 수 없으면, 모른다고 솔직히 말하고 "관련 정보를 찾지 못했습니다"라고 안내해. 추측하거나 일반 상식으로 답을 채우지 마.
- 정책의 신청 기간, 나이 조건, 지원 내용, 신청 URL 등 구체적 수치나 조건은 검색 결과에 적힌 그대로만 전달해. 임의로 바꾸거나 보태지 마.
- 청년 정책 질문에서 application_url 값이 있으면 함께 안내해 없으면 신청 URL을 언급하지 마.

# 답변 범위
- 청년 정책과 레시피에 관한 질문에만 답해.
- 그 외 주제는 "저는 청년 정책과 레시피 정보만 안내할 수 있어요"라고 정중히 안내하고 답하지 마.

# 답변 방식
- 친근하고 명확한 한국어로 답해.
- 여러 항목을 안내할 때는 정책명/레시피명을 기준으로 정리해서 보여줘.
- 사용자가 나이나 지역을 알려주면, 그 조건에 맞는 정책을 우선해서 안내해.
- '데이터 스토어'는 직접 언급하지 마. 예시: (데이터 스토어에 있는 레시피 중... -> 레시피 중)`;

function unwrapEnvJson(value: string) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function parseCredentialsJson(raw: string): GoogleServiceAccountCredentials {
  try {
    return JSON.parse(unwrapEnvJson(raw)) as GoogleServiceAccountCredentials;
  } catch {
    throw errors.validation('GOOGLE_CREDENTIALS_JSON 형식이 올바른 JSON이 아닙니다.');
  }
}

function getGoogleCredentials(): GoogleServiceAccountCredentials {
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    return parseCredentialsJson(process.env.GOOGLE_CREDENTIALS_JSON);
  }

  throw errors.validation('GOOGLE_CREDENTIALS_JSON이 설정되어 있지 않습니다.');
}

function buildUserContextText(userContext?: ChatUserContext) {
  const age = userContext?.age ? `나이: ${userContext.age}` : null;
  const residence = userContext?.residence ? `거주지: ${userContext.residence}` : null;
  const lines = [age, residence].filter(Boolean);

  if (lines.length === 0) {
    return '';
  }

  return `\n\n사용자 기본 정보:\n${lines.join('\n')}`;
}

function getMongoUri() {
  if (!process.env.MONGODB_URI) {
    throw new AppError(500, 'MONGODB_URI_MISSING', 'MONGODB_URI가 설정되어 있지 않습니다.');
  }

  return process.env.MONGODB_URI;
}

function getMongoDbName() {
  if (!process.env.MONGODB_DB_NAME) {
    throw new AppError(500, 'MONGODB_DB_NAME_MISSING', 'MONGODB_DB_NAME이 설정되어 있지 않습니다.');
  }

  return process.env.MONGODB_DB_NAME;
}

async function getMongoDb(): Promise<Db> {
  if (!mongoClientPromise) {
    mongoClientPromise = new MongoClient(getMongoUri()).connect();
  }

  const client = await mongoClientPromise;
  return client.db(getMongoDbName());
}

async function getChatCollections(): Promise<{
  sessions: Collection<ChatSessionDocument>;
  messages: Collection<ChatMessageDocument>;
}> {
  const db = await getMongoDb();

  return {
    sessions: db.collection<ChatSessionDocument>(CHAT_SESSIONS_COLLECTION),
    messages: db.collection<ChatMessageDocument>(CHAT_MESSAGES_COLLECTION),
  };
}

function toChatSession(document: ChatSessionDocument): ChatSession {
  return {
    id: document._id,
    title: document.title,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
    lastMessage: document.lastMessage,
  };
}

function toChatMessage(document: ChatMessageDocument): ChatMessage {
  return {
    id: document._id,
    sessionId: document.sessionId,
    role: document.role,
    content: document.content,
    createdAt: document.createdAt.toISOString(),
  };
}

function buildContents(messages: ChatMessageDocument[], userContext?: ChatUserContext) {
  const lastUserMessageIndex = messages.findLastIndex((message) => message.role === 'user');

  return messages.map((message, index) => ({
    role: message.role,
    parts: [
      {
        text:
          index === lastUserMessageIndex
            ? `${message.content}${buildUserContextText(userContext)}`
            : message.content,
      },
    ],
  }));
}

async function generateChatContent(messages: ChatMessageDocument[], userContext?: ChatUserContext) {
  const credentials = getGoogleCredentials();
  const ai = new GoogleGenAI({
    enterprise: true,
    project: process.env.GOOGLE_CLOUD_PROJECT ?? credentials.project_id ?? DEFAULT_PROJECT_ID,
    location: process.env.GOOGLE_CLOUD_LOCATION ?? DEFAULT_LOCATION,
    googleAuthOptions: {
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    },
  });

  const response = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents: buildContents(messages, userContext),
    config: {
      maxOutputTokens: 2048,
      temperature: 0.1,
      topP: 0.2,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.MINIMAL,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
      ],
      tools: [
        {
          retrieval: {
            vertexAiSearch: {
              datastore: DATASTORE,
            },
          },
        },
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
    },
  });

  if (!response.text) {
    throw new AppError(502, 'AI_EMPTY_RESPONSE', 'AI 응답 텍스트가 비어 있습니다.');
  }

  return response.text;
}

async function generateChatContentOrThrow502(
  messages: ChatMessageDocument[],
  userContext?: ChatUserContext,
) {
  try {
    return await generateChatContent(messages, userContext);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(502, 'AI_GENERATION_FAILED', 'AI 응답 생성에 실패했습니다.');
  }
}

async function findOwnedSession(sessionId: string, userId: string) {
  const { sessions } = await getChatCollections();
  const session = await sessions.findOne({ _id: sessionId, userId });

  if (!session) {
    throw errors.notFound('채팅 세션을 찾을 수 없습니다.');
  }

  return session;
}

export async function createChatSession(userId: string): Promise<CreateChatSessionResponse> {
  const { sessions } = await getChatCollections();
  const now = new Date();
  const session: ChatSessionDocument = {
    _id: crypto.randomUUID(),
    userId,
    title: '',
    createdAt: now,
    updatedAt: now,
    lastMessage: null,
  };

  await sessions.insertOne(session);

  return createChatSessionResponseSchema.parse({
    session: toChatSession(session),
  });
}

export async function listChatSessions(userId: string): Promise<ChatSessionListResponse> {
  const { sessions } = await getChatCollections();
  const documents = await sessions
    .find({ userId, title: { $ne: '' }, lastMessage: { $ne: null } })
    .sort({ updatedAt: -1 })
    .limit(MAX_STORED_CHAT_SESSIONS)
    .toArray();

  return chatSessionListResponseSchema.parse({
    sessions: documents.map(toChatSession),
  });
}

async function pruneOldChatSessions(userId: string) {
  const { sessions, messages } = await getChatCollections();
  const staleSessions = await sessions
    .find({ userId, title: { $ne: '' }, lastMessage: { $ne: null } })
    .sort({ updatedAt: -1 })
    .skip(MAX_STORED_CHAT_SESSIONS)
    .project<{ _id: string }>({ _id: 1 })
    .toArray();

  if (staleSessions.length === 0) {
    return;
  }

  const staleSessionIds = staleSessions.map((session) => session._id);

  await messages.deleteMany({ userId, sessionId: { $in: staleSessionIds } });
  await sessions.deleteMany({ userId, _id: { $in: staleSessionIds } });
}

async function rollbackFailedChatMessage({
  userId,
  session,
  userMessageId,
  modelMessageId,
}: {
  userId: string;
  session: ChatSessionDocument;
  userMessageId: string;
  modelMessageId?: string;
}) {
  try {
    const { sessions, messages } = await getChatCollections();

    await messages.deleteOne({ _id: userMessageId, userId, sessionId: session._id });
    if (modelMessageId) {
      await messages.deleteOne({ _id: modelMessageId, userId, sessionId: session._id });
    }

    if (!session.title && session.lastMessage === null) {
      await sessions.deleteOne({ _id: session._id, userId });
      return;
    }

    await sessions.updateOne(
      { _id: session._id, userId },
      {
        $set: {
          title: session.title,
          updatedAt: session.updatedAt,
          lastMessage: session.lastMessage,
        },
      },
    );
  } catch (rollbackError) {
    console.error('Failed to rollback chat message after AI generation failure.', rollbackError);
  }
}

export async function getChatSessionMessages(
  userId: string,
  sessionId: string,
): Promise<ChatSessionMessagesResponse> {
  const { messages } = await getChatCollections();
  const session = await findOwnedSession(sessionId, userId);
  const messageDocuments = await messages
    .find({ sessionId, userId })
    .sort({ createdAt: 1 })
    .toArray();

  return chatSessionMessagesResponseSchema.parse({
    session: toChatSession(session),
    messages: messageDocuments.map(toChatMessage),
  });
}

export async function sendChatSessionMessage(
  userId: string,
  sessionId: string,
  payload: unknown,
): Promise<SendChatMessageResponse> {
  const request = sendChatMessageRequestSchema.parse(payload);
  const { sessions, messages } = await getChatCollections();
  const session = await findOwnedSession(sessionId, userId);
  const now = new Date();
  const userMessageDocument: ChatMessageDocument = {
    _id: crypto.randomUUID(),
    sessionId,
    userId,
    role: 'user',
    content: request.message,
    createdAt: now,
  };

  await messages.insertOne(userMessageDocument);

  const nextTitle = session.title || request.message;
  let modelMessageId: string | undefined;

  try {
    await sessions.updateOne(
      { _id: sessionId, userId },
      {
        $set: {
          title: nextTitle,
          updatedAt: now,
          lastMessage: request.message,
        },
      },
    );

    const contextMessages = await messages
      .find({ sessionId, userId })
      .sort({ createdAt: 1 })
      .toArray();
    const modelContent = await generateChatContentOrThrow502(contextMessages, request.userContext);
    const modelCreatedAt = new Date();
    const modelMessageDocument: ChatMessageDocument = {
      _id: crypto.randomUUID(),
      sessionId,
      userId,
      role: 'model',
      content: modelContent,
      createdAt: modelCreatedAt,
    };
    modelMessageId = modelMessageDocument._id;

    await messages.insertOne(modelMessageDocument);

    const updatedSessionDocument: ChatSessionDocument = {
      ...session,
      title: nextTitle,
      updatedAt: modelCreatedAt,
      lastMessage: modelContent,
    };

    await sessions.updateOne(
      { _id: sessionId, userId },
      {
        $set: {
          title: updatedSessionDocument.title,
          updatedAt: updatedSessionDocument.updatedAt,
          lastMessage: updatedSessionDocument.lastMessage,
        },
      },
    );
    await pruneOldChatSessions(userId);

    return sendChatMessageResponseSchema.parse({
      userMessage: toChatMessage(userMessageDocument),
      modelMessage: toChatMessage(modelMessageDocument),
      session: toChatSession(updatedSessionDocument),
    });
  } catch (error) {
    await rollbackFailedChatMessage({
      userId,
      session,
      userMessageId: userMessageDocument._id,
      modelMessageId,
    });

    throw error;
  }
}

export async function testChatMessage(payload: unknown): Promise<ChatTestResponse> {
  const request = chatTestRequestSchema.parse(payload);
  const createdAt = new Date();
  const content = await generateChatContentOrThrow502(
    [
      {
        _id: crypto.randomUUID(),
        sessionId: crypto.randomUUID(),
        userId: 'test',
        role: 'user',
        content: request.message,
        createdAt,
      },
    ],
    request.userContext,
  );

  return chatTestResponseSchema.parse({
    message: request.message,
    modelMessage: {
      role: 'model',
      content,
    },
  });
}
