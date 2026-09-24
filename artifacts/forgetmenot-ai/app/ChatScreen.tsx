import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';

const theme = {
  background: '#050506',
  mutedForeground: '#62626a',
  primary: '#00ffcc'
};

const tap = () => console.log("🔊 [TREATMENT] Tactile haptic press callback triggered successfully.");

function FGlobe({ size = 26 }: { size?: number }) {
  return (
    <View
      style={[
        styles.avatarGlowWrapper,
        {
          width: size,
          height: size,
          borderRadius: size / 2
        }
      ]}
    >
      <Feather name="coffee" size={size * 0.6} color="#00ffcc" />
    </View>
  );
}

function ScreenHeader({
  title,
  subtitle,
  onBack,
  right
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const safeInsets = useSafeAreaInsets();
  const insets = safeInsets || { top: 0, bottom: 0, left: 0, right: 0 };

  return (
    <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => {
            if (typeof onBack === 'function') onBack();
          }}
          style={styles.headerBackButton}
          hitSlop={12}
        >
          <Feather name="arrow-left" size={20} color="#ffffff" />
        </Pressable>

        <View style={styles.headerTitleContent}>
          <Text style={styles.headerTitleText}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitleText}>{subtitle}</Text>}
        </View>

        {right && <View style={styles.headerRightSlot}>{right}</View>}
      </View>
    </View>
  );
}

interface ChatMessage {
  id: string;
  from: 'user' | 'ai';
  text: string;
}

export default function ChatScreen({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      from: 'ai',
      text: 'Hey there! I’m Coffee AI. I’m looking between the lines of your routine. What’s on your mind today?'
    }
  ]);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    console.log("🖥️ [DIAGNOSTIC] ChatScreen rendered successfully.");
    console.log(`📱 Platform Target Detected: ${Platform.OS}`);
    console.log(
      `🔑 Available Keys Audit: EXPO_PUBLIC_GEMINI_API_KEY is ${
        process.env.EXPO_PUBLIC_GEMINI_API_KEY ? 'DEFINED ✅' : 'UNDEFINED ❌'
      }`
    );
  }, []);

  const scrollToBottom = (animated = true) => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    });
  };

  const handleVoiceOver = async (messageId: string, textToSpeak: string) => {
    tap();

    if (speakingId === messageId) {
      await Speech.stop();
      setSpeakingId(null);
      return;
    }

    await Speech.stop();
    setSpeakingId(messageId);

    Speech.speak(textToSpeak, {
      onDone: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
      onStopped: () => setSpeakingId(null)
    });
  };

  const send = async () => {
    if (isSending) return;

    const userPrompt = text.trim();
    if (!userPrompt) return;

    tap();

    setText('');
    setIsSending(true);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      from: 'user',
      text: userPrompt
    };

    setMessages((current) => [...current, userMessage]);
    scrollToBottom();

    try {
      const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

      if (
        !GEMINI_API_KEY ||
        GEMINI_API_KEY === 'YOUR_GOOGLE_PUBLIC_GEMINI_API_KEY'
      ) {
        throw new Error(
          'Missing EXPO_PUBLIC_GEMINI_API_KEY. Check your .env configuration.'
        );
      }

      /*
       * NOTE:
       * For Expo Web, a production app should call your own server/edge
       * function rather than expose a Gemini API key in the browser.
       * This keeps the existing client-side architecture working for now.
       */
      const targetUrl =
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent';

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are Coffee AI, an assistant inside ForgetMeNot AI.

      Your role is to help the user identify forgotten tasks, people, places, objects, commitments, and contextual omissions.

      Keep responses concise, useful, natural, and conversational.

      User message:
      ${userPrompt}`
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(
          `Gemini HTTP ${response.status}${errorText ? `: ${errorText.slice(0, 300)}` : ''}`
        );
      }

      const responseData = await response.json();

      let aiReplyText =
        "I received your context node, but I couldn't formulate a proper response matrix.";

      const candidateText =
        responseData?.candidates?.[0]?.content?.parts
          ?.map((part: any) => part?.text)
          .filter(Boolean)
          .join('\n')
          .trim();

      if (candidateText) {
        aiReplyText = candidateText;
      }

      setMessages((current) => [
        ...current,
        {
          id: `ai-${Date.now()}`,
          from: 'ai',
          text: aiReplyText
        }
      ]);
    } catch (error: any) {
      console.error('💥 [CHAT] Gemini request failed:', error);

      setMessages((current) => [
        ...current,
        {
          id: `err-${Date.now()}`,
          from: 'ai',
          text: `Transmission failed: ${
            error?.message || 'Check network endpoint configuration.'
          }`
        }
      ]);
    } finally {
      setIsSending(false);
      scrollToBottom();
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Coffee AI"
        subtitle="Your secondary context brain, awake and processing."
        onBack={onBack}
      />

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Background never receives touches. */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <ImageBackground
            source={require('../assets/images/CoffeeAI_ForgetMeNotAI.png')}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: 'rgba(5, 5, 6, 0.76)' }
            ]}
          />
        </View>

        {/* Scroll area has its own flex space. */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatScrollView}
          contentContainerStyle={styles.chatScroll}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === 'ios' ? 'interactive' : 'on-drag'
          }
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
          onContentSizeChange={() => {
            if (messages.length > 1 || isSending) {
              scrollToBottom();
            }
          }}
        >
          <View style={styles.chatIntro}>
            <FGlobe size={84} />

            <Text style={styles.chatIntroTitle}>
              A thought is a signal.
            </Text>

            <Text style={styles.chatIntroCopy}>
              Ask me what omissions you might be missing, or leave a thought
              here for later.
            </Text>
          </View>

          {messages.map((message) => {
            const isAi = message.from === 'ai';

            return (
              <View
                key={message.id}
                style={[
                  styles.messageRow,
                  !isAi && styles.messageRowUser
                ]}
              >
                {isAi && (
                  <View style={styles.messageAvatar}>
                    <FGlobe size={26} />
                  </View>
                )}

                <View
                  style={[
                    styles.messageBubble,
                    isAi ? styles.aiBubble : styles.userBubble
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      !isAi && styles.userMessageText
                    ]}
                  >
                    {message.text}
                  </Text>

                  {isAi && (
                    <Pressable
                      onPress={() =>
                        handleVoiceOver(message.id, message.text)
                      }
                      style={styles.voiceOverContainer}
                      hitSlop={8}
                    >
                      <Feather
                        name={
                          speakingId === message.id ? 'square' : 'volume-2'
                        }
                        size={12}
                        color="#00ffcc"
                      />
                      <Text style={styles.voiceOverTextText}>
                        {speakingId === message.id
                          ? 'Stop'
                          : 'Read Aloud'}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}

          {isSending && (
            <View style={styles.computingRow}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={styles.computingTextText}>
                Coffee AI is tracking context...
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Composer is a normal flex child and cannot be hidden by ScrollView. */}
        <View style={styles.chatComposer}>
          <TextInput
            testID="chat-input"
            value={text}
            onChangeText={setText}
            placeholder="Tell Coffee AI a thought…"
            placeholderTextColor={theme.mutedForeground}
            style={styles.chatInput}
            editable={!isSending}
            multiline={false}
            autoCorrect={true}
            autoCapitalize="sentences"
            returnKeyType="send"
            selectionColor={theme.primary}
            onFocus={() =>
              console.log('🔌 [CHAT] TextInput focused — typing enabled.')
            }
            onSubmitEditing={send}
          />

          <Pressable
            testID="send-message"
            accessibilityRole="button"
            accessibilityLabel="Send message"
            onPress={send}
            disabled={!text.trim() || isSending}
            hitSlop={6}
            style={[
              styles.sendButton,
              (!text.trim() || isSending) &&
                styles.sendButtonDisabled
            ]}
          >
            <Feather name="arrow-up" size={18} color="#050506" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#050506'
  },

  headerContainer: {
    backgroundColor: '#050506',
    borderBottomWidth: 1,
    borderColor: '#1c1c1f',
    paddingBottom: 14,
    paddingHorizontal: 20,
    width: '100%',
    flexShrink: 0
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%'
  },

  headerBackButton: {
    marginRight: 14,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121214',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1c1c1f'
  },

  headerTitleContent: {
    flex: 1,
    minWidth: 0
  },

  headerTitleText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5
  },

  headerSubtitleText: {
    color: '#8a8f98',
    fontSize: 12,
    marginTop: 2
  },

  headerRightSlot: {
    marginLeft: 12
  },

  aiOnline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 204, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 204, 0.15)'
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00ffcc',
    marginRight: 6
  },

  aiOnlineText: {
    color: '#00ffcc',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1
  },

  chatArea: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    position: 'relative',
    overflow: 'hidden'
  },

  chatScrollView: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    width: '100%',
    zIndex: 1
  },

  chatScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1
  },

  chatIntro: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
    paddingHorizontal: 20
  },

  avatarGlowWrapper: {
    backgroundColor: 'rgba(0, 255, 204, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 255, 204, 0.3)'
  },

  chatIntroTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8
  },

  chatIntroCopy: {
    color: '#8a8f98',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18
  },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    width: '85%',
    maxWidth: 760
  },

  messageRowUser: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    flexDirection: 'row-reverse'
  },

  messageAvatar: {
    marginRight: 10,
    marginBottom: 2
  },

  messageBubble: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    flexShrink: 1
  },

  aiBubble: {
    backgroundColor: '#121214',
    borderColor: '#1c1c1f',
    borderBottomLeftRadius: 4
  },

  userBubble: {
    backgroundColor: '#00ffcc',
    borderColor: '#00ffcc',
    borderBottomRightRadius: 4
  },

  messageText: {
    color: '#e4e4e7',
    fontSize: 14,
    lineHeight: 20
  },

  userMessageText: {
    color: '#050506',
    fontWeight: '600'
  },

  voiceOverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 8,
    opacity: 0.85
  },

  voiceOverTextText: {
    color: '#00ffcc',
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '600'
  },

  computingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8
  },

  computingTextText: {
    color: '#62626a',
    fontSize: 13
  },

  chatComposer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c0c0e',
    borderTopWidth: 1,
    borderColor: '#141417',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    minHeight: 68,
    width: '100%',
    flexShrink: 0,
    zIndex: 100,
    elevation: 100
  },

  chatInput: {
    flex: 1,
    minWidth: 0,
    height: 44,
    backgroundColor: '#121214',
    borderColor: '#1c1c1f',
    borderWidth: 1,
    borderRadius: 10,
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    zIndex: 101,
    elevation: 101,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          cursor: 'text'
        } as any)
      : {})
  },

  sendButton: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: 10,
    backgroundColor: '#00ffcc',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 102,
    elevation: 102
  },

  sendButtonDisabled: {
    backgroundColor: '#121214',
    opacity: 0.4
  }
});
