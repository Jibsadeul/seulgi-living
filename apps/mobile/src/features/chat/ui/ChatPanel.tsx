import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useMarkdown, type MarkedStyles } from 'react-native-marked';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  type ChatMessage,
  type ChatSession,
  type ChatUserContext,
  useChatSessionMessages,
  useChatSessions,
  useCreateChatSession,
  useSendChatMessage,
} from '@/entities/chat';
import { useMemberStore } from '@/entities/members';
import { getSidoList, getSigunguList } from '@/entities/regions';
import { showAppToast } from '@/shared/ui/Toast';

const MAIN_COLOR = '#EF7722';
const TEXT_COLOR = '#1F2933';
const BORDER_COLOR = '#E8E1DA';
const CHAT_RETRY_MESSAGE = '답변을 생성하지 못했어요. 잠시 후 다시 시도해주세요.';
const LOADING_DOT_DELAYS = [0, 160, 320];

const markdownStyles: MarkedStyles = {
  text: {
    color: TEXT_COLOR,
    fontSize: 14,
    lineHeight: 23,
  },
  paragraph: {
    marginTop: 3,
    marginBottom: 11,
  },
  strong: {
    color: TEXT_COLOR,
    fontWeight: '800',
  },
  em: {
    color: TEXT_COLOR,
    fontStyle: 'italic',
  },
  list: {
    marginTop: 4,
    marginBottom: 12,
  },
  li: {
    color: TEXT_COLOR,
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 6,
  },
  h1: {
    color: TEXT_COLOR,
    fontSize: 21,
    lineHeight: 29,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 12,
  },
  h2: {
    color: TEXT_COLOR,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 10,
  },
  h3: {
    color: TEXT_COLOR,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 8,
  },
  codespan: {
    color: '#7C3A0D',
    backgroundColor: '#FFF3EA',
  },
  code: {
    backgroundColor: '#FFF7F1',
    borderRadius: 6,
    padding: 8,
  },
  link: {
    color: MAIN_COLOR,
    textDecorationLine: 'underline',
  },
};

const getDelay = (char: string) => {
  if (['.', '!', '?', '요', '다'].includes(char)) return 22 + Math.random() * 14;
  if ([',', '\n', ':'].includes(char)) return 8 + Math.random() * 8;
  if (char === ' ' && Math.random() < 0.2) return 5 + Math.random() * 5;
  if (Math.random() < 0.03) return 10 + Math.random() * 12;
  return 3 + Math.random() * 3;
};

function calculateAge(birthday: string | null) {
  if (!birthday) return null;

  const birthDate = new Date(`${birthday}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

  if (today < birthdayThisYear) {
    age -= 1;
  }

  return age > 0 ? age : null;
}

function buildUserContext(
  age: number | null,
  residence: string | null,
): ChatUserContext | undefined {
  const context: ChatUserContext = {};

  if (age !== null) {
    context.age = age;
  }

  if (residence) {
    context.residence = residence;
  }

  return Object.keys(context).length > 0 ? context : undefined;
}

function ModelMessageContent({ content, typing }: { content: string; typing: boolean }) {
  const markdown = useMarkdown(content, { styles: markdownStyles });

  return (
    <View>
      {markdown}
      {typing ? <Text style={styles.cursor}> |</Text> : null}
    </View>
  );
}

function LoadingDots() {
  const dotAnimations = useRef(LOADING_DOT_DELAYS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = dotAnimations.map((animation, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(LOADING_DOT_DELAYS[index]),
          Animated.timing(animation, {
            toValue: 1,
            duration: 220,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: 220,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.delay(1200 - LOADING_DOT_DELAYS[index] - 440),
        ]),
      ),
    );

    animations.forEach((animation) => animation.start());

    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [dotAnimations]);

  return (
    <View style={styles.loadingBubble}>
      {dotAnimations.map((animation, index) => (
        <Animated.View
          key={LOADING_DOT_DELAYS[index]}
          style={[
            styles.loadingDot,
            {
              backgroundColor: animation.interpolate({
                inputRange: [0, 1],
                outputRange: ['#C9BDB2', MAIN_COLOR],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

export function ChatPanel() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const birthday = useMemberStore((state) => state.birthday);
  const sidoId = useMemberStore((state) => state.sidoId);
  const sigunguId = useMemberStore((state) => state.sigunguId);

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [displaySessionId, setDisplaySessionId] = useState<string | null>(null);
  const [displayMessages, setDisplayMessages] = useState<ChatMessage[] | null>(null);
  const [isDraftChat, setIsDraftChat] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const sessionsQuery = useChatSessions();
  const messagesQuery = useChatSessionMessages(activeSessionId);
  const createSessionMutation = useCreateChatSession();
  const sendMessageMutation = useSendChatMessage();

  const sidoQuery = useQuery({
    queryKey: ['sido'],
    queryFn: getSidoList,
    enabled: Boolean(sidoId),
  });
  const sigunguQuery = useQuery({
    queryKey: ['sigungu', sidoId],
    queryFn: () => getSigunguList(sidoId ?? ''),
    enabled: Boolean(sidoId && sigunguId),
  });

  const sessions = sessionsQuery.data?.sessions ?? [];
  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [activeSessionId, sessions],
  );
  const serverMessages = messagesQuery.data?.messages ?? [];
  const activeMessages =
    displaySessionId === activeSessionId && displayMessages ? displayMessages : serverMessages;
  const age = useMemo(() => calculateAge(birthday), [birthday]);
  const residence = useMemo(() => {
    const sido = sidoQuery.data?.find((item) => item.id === sidoId);
    const sigungu = sigunguQuery.data?.find((item) => item.id === sigunguId);

    if (sido && sigungu) {
      return `${sido.name} ${sigungu.name}`;
    }

    return null;
  }, [sidoId, sidoQuery.data, sigunguId, sigunguQuery.data]);
  const userContext = useMemo(() => buildUserContext(age, residence), [age, residence]);

  useEffect(() => {
    if (!activeSessionId && !isDraftChat && sessions.length > 0) {
      setActiveSessionId(sessions[0].id);
    }
  }, [activeSessionId, isDraftChat, sessions]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (displaySessionId && displaySessionId !== activeSessionId) {
      setDisplayMessages(null);
      setDisplaySessionId(null);
    }
  }, [activeSessionId, displaySessionId]);

  useEffect(() => {
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(timer);
  }, [activeMessages.length, typingMessageId]);

  const typeText = (full: string, messageId: string, sessionId: string) => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    let displayed = 0;
    setTypingMessageId(messageId);

    const tick = () => {
      if (displayed >= full.length) {
        setTypingMessageId(null);
        setIsSending(false);
        setDisplayMessages(
          (prev) =>
            prev?.map((message) =>
              message.id === messageId ? { ...message, content: full } : message,
            ) ?? null,
        );
        return;
      }

      const chunkSize =
        Math.random() < 0.25
          ? 10 + Math.floor(Math.random() * 6)
          : 5 + Math.floor(Math.random() * 5);
      displayed = Math.min(displayed + chunkSize, full.length);
      const partial = full.slice(0, displayed);

      setDisplayMessages(
        (prev) =>
          prev?.map((message) =>
            message.id === messageId ? { ...message, content: partial } : message,
          ) ?? null,
      );

      typingTimerRef.current = setTimeout(tick, getDelay(full[displayed - 1]));
    };

    setDisplaySessionId(sessionId);
    typingTimerRef.current = setTimeout(tick, 160);
  };

  const handleNewChat = async () => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    setActiveSessionId(null);
    setDisplaySessionId(null);
    setDisplayMessages([]);
    setIsDraftChat(true);
    setInput('');
    setIsSending(false);
    setTypingMessageId(null);
    setIsHistoryOpen(false);
  };

  const handleSelectSession = (sessionId: string) => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    setActiveSessionId(sessionId);
    setDisplayMessages(null);
    setDisplaySessionId(null);
    setIsDraftChat(false);
    setIsSending(false);
    setTypingMessageId(null);
    setIsHistoryOpen(false);
  };

  const ensureSession = async (): Promise<ChatSession> => {
    if (activeSession) {
      return activeSession;
    }

    const response = await createSessionMutation.mutateAsync();
    setActiveSessionId(response.session.id);
    setIsDraftChat(false);
    return response.session;
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const previousSessionId = activeSessionId;
    setInput('');
    setIsSending(true);

    try {
      const session = await ensureSession();
      const createdAt = new Date().toISOString();
      const userMessage: ChatMessage = {
        id: `temp-user-${Date.now()}`,
        sessionId: session.id,
        role: 'user',
        content: trimmed,
        createdAt,
      };
      const modelMessage: ChatMessage = {
        id: `temp-model-${Date.now()}`,
        sessionId: session.id,
        role: 'model',
        content: '',
        createdAt,
      };
      const baseMessages = session.id === activeSessionId ? activeMessages : [];
      const optimisticMessages = [...baseMessages, userMessage, modelMessage];

      setActiveSessionId(session.id);
      setDisplaySessionId(session.id);
      setDisplayMessages(optimisticMessages);

      const response = await sendMessageMutation.mutateAsync({
        sessionId: session.id,
        message: trimmed,
        userContext,
      });
      const confirmedMessages = [
        ...baseMessages,
        response.userMessage,
        { ...response.modelMessage, content: '' },
      ];

      setDisplayMessages(confirmedMessages);
      typeText(response.modelMessage.content, response.modelMessage.id, session.id);
    } catch (error) {
      setInput(trimmed);
      setIsSending(false);
      setTypingMessageId(null);
      if (previousSessionId) {
        setActiveSessionId(previousSessionId);
        setDisplaySessionId(null);
        setDisplayMessages(null);
        setIsDraftChat(false);
      } else {
        setActiveSessionId(null);
        setDisplaySessionId(null);
        setDisplayMessages([]);
        setIsDraftChat(true);
      }
      showAppToast({ type: 'error', text: CHAT_RETRY_MESSAGE });
    }
  };

  const hasInput = input.trim().length > 0;
  const isCreatingSession = createSessionMutation.isPending;
  const isMessageLoading = messagesQuery.isLoading && Boolean(activeSessionId) && !displayMessages;
  const keyboardAvoidingEnabled = Platform.OS === 'ios' || isKeyboardVisible;
  const inputBottomPadding = isKeyboardVisible ? 8 : insets.bottom + 12;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enabled={keyboardAvoidingEnabled}
    >
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View>
          <Text style={styles.eyebrow}>Seulgi AI</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel="새 채팅"
            style={styles.headerButton}
            disabled={isCreatingSession}
            onPress={handleNewChat}
          >
            <Ionicons name="add" size={18} color={MAIN_COLOR} />
            <Text style={styles.headerButtonText}>새 채팅</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="이전 채팅 기록"
            style={[styles.iconButton, isHistoryOpen && styles.iconButtonActive]}
            onPress={() => setIsHistoryOpen((prev) => !prev)}
          >
            <Ionicons
              name="time-outline"
              size={21}
              color={isHistoryOpen ? '#FFFFFF' : TEXT_COLOR}
            />
          </Pressable>
          <Pressable
            accessibilityLabel="닫기"
            style={styles.iconButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={22} color={TEXT_COLOR} />
          </Pressable>
        </View>
      </View>

      {isHistoryOpen ? (
        <View style={styles.historyPanel}>
          <View style={styles.historyHeader}>
            <View style={styles.historyTitleRow}>
              <Text style={styles.historyTitle}>이전 채팅 기록</Text>
              <Text style={styles.historyLimit}>최대 5개 저장</Text>
            </View>
            <Text style={styles.historyCount}>{sessions.length}개</Text>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.historyList}
          >
            {sessionsQuery.isLoading ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyDescription}>채팅 기록을 불러오는 중입니다.</Text>
              </View>
            ) : sessionsQuery.isError ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>기록을 불러오지 못했어요</Text>
                <Text style={styles.emptyDescription}>잠시 후 다시 시도해주세요.</Text>
              </View>
            ) : sessions.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>이전 채팅이 없어요</Text>
                <Text style={styles.emptyDescription}>새 채팅을 시작해 질문을 남겨보세요.</Text>
              </View>
            ) : (
              sessions.map((session) => {
                const active = session.id === activeSession?.id;
                return (
                  <Pressable
                    key={session.id}
                    style={[styles.historyItem, active && styles.historyItemActive]}
                    onPress={() => handleSelectSession(session.id)}
                  >
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[styles.historyItemTitle, active && styles.historyItemTitleActive]}
                    >
                      {session.title || '새 채팅'}
                    </Text>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.historyPreview}>
                      {session.lastMessage || '아직 메시지가 없습니다.'}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      ) : null}

      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContent}
      >
        {isMessageLoading ? (
          <View style={styles.emptyChat}>
            <Text style={styles.emptyDescription}>메시지를 불러오는 중입니다.</Text>
          </View>
        ) : activeMessages.length === 0 ? (
          <View style={styles.emptyChat}>
            <View style={styles.emptyIcon}>
              <Ionicons name="sparkles-outline" size={28} color={MAIN_COLOR} />
            </View>
            <Text style={styles.emptyTitle}>무엇을 도와드릴까요?</Text>
            <Text style={styles.emptyDescription}>
              청년 정책이나 냉장고 재료로 만들 수 있는 레시피를 물어보세요.
            </Text>
          </View>
        ) : (
          activeMessages.map((message) => {
            const mine = message.role === 'user';
            const typing = typingMessageId === message.id;
            return (
              <View
                key={message.id}
                style={[styles.messageRow, mine ? styles.messageRowUser : styles.messageRowModel]}
              >
                <View style={[styles.bubble, mine ? styles.userBubble : styles.modelBubble]}>
                  {message.content ? (
                    mine ? (
                      <Text style={[styles.messageText, styles.userMessageText]}>
                        {message.content}
                        {typing ? <Text style={styles.cursor}> |</Text> : null}
                      </Text>
                    ) : (
                      <ModelMessageContent content={message.content} typing={typing} />
                    )
                  ) : (
                    <LoadingDots />
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={[styles.inputWrap, { paddingBottom: inputBottomPadding }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="청년 정책이나 레시피를 물어보세요"
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={500}
          editable={!isSending}
          style={styles.input}
        />
        <Pressable
          accessibilityLabel="메시지 전송"
          style={[styles.sendButton, (!hasInput || isSending) && styles.sendButtonDisabled]}
          disabled={!hasInput || isSending}
          onPress={handleSend}
        >
          <Ionicons name="send" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    minHeight: 86,
    paddingHorizontal: 18,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE8E1',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  eyebrow: {
    fontSize: 18,
    color: MAIN_COLOR,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    height: 38,
    paddingHorizontal: 11,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#F5C8A8',
    backgroundColor: '#FFF7F1',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerButtonText: {
    color: MAIN_COLOR,
    fontSize: 12,
    fontWeight: '700',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F0EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: {
    backgroundColor: MAIN_COLOR,
  },
  historyPanel: {
    marginHorizontal: 14,
    marginTop: 12,
    maxHeight: 230,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  historyHeader: {
    height: 45,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1ECE7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyTitle: {
    color: TEXT_COLOR,
    fontSize: 14,
    fontWeight: '800',
  },
  historyTitleRow: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  historyLimit: {
    color: '#9A8D83',
    fontSize: 11,
    fontWeight: '600',
  },
  historyCount: {
    color: '#8A7B70',
    fontSize: 12,
  },
  historyList: {
    padding: 8,
    gap: 8,
  },
  historyItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 7,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#F0E9E1',
  },
  historyItemActive: {
    borderColor: '#F2B37F',
    backgroundColor: '#FFF3EA',
  },
  historyItemTitle: {
    color: TEXT_COLOR,
    fontSize: 13,
    fontWeight: '800',
  },
  historyItemTitleActive: {
    color: MAIN_COLOR,
  },
  historyPreview: {
    marginTop: 4,
    color: '#8A7B70',
    fontSize: 12,
  },
  messages: {
    flex: 1,
    backgroundColor: '#F8F7F4',
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
    gap: 12,
  },
  emptyChat: {
    marginTop: 72,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFF2E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyBox: {
    padding: 16,
    alignItems: 'center',
  },
  emptyTitle: {
    color: TEXT_COLOR,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyDescription: {
    marginTop: 8,
    color: '#7C7068',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  messageRow: {
    flexDirection: 'row',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowModel: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '84%',
    borderRadius: 8,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: MAIN_COLOR,
    borderTopRightRadius: 3,
  },
  modelBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE4DC',
    borderTopLeftRadius: 3,
  },
  messageText: {
    color: TEXT_COLOR,
    fontSize: 14,
    lineHeight: 21,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  cursor: {
    color: MAIN_COLOR,
    fontWeight: '800',
  },
  loadingBubble: {
    height: 21,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C9BDB2',
  },
  inputWrap: {
    paddingTop: 10,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: '#EFE8E1',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    maxHeight: 104,
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 13,
    paddingVertical: 11,
    color: TEXT_COLOR,
    fontSize: 14,
    lineHeight: 20,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MAIN_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D8CFC7',
  },
});
