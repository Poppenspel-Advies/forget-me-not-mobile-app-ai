import React, { useState } from 'react';
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
  Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 📱 COMPONENT ACCENTS & STATIC ASSET RULES
const theme = {
  background: '#050506',
  mutedForeground: '#62626a',
};

// Local mock tap mechanism runner if not explicitly provided by global scopes
const tap = () => console.log("🔊 Chat tactile haptic callback engaged.");

// 📱 LOCAL FIX 1: Safely encapsulate missing FGlobe vector elements locally inside this sandbox
function FGlobe({ size = 26 }: { size?: number }) {
  return (
    <View style={[styles.avatarGlowWrapper, { width: size, height: size, borderRadius: size / 2 }]}>
      <Feather name="coffee" size={size * 0.6} color="#00ffcc" />
    </View>
  );
}

// 📱 LOCAL FIX 2: Safely embed standard ScreenHeader for self-contained execution
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

        {/* 🔙 FORCED BACK ARROW: Render target is locked open unconditionally */}
        <Pressable
          // ✅ Bypasses props to verify navigation directly if onBack is missing
          onPress={() => {
            if (typeof onBack === 'function') {
              onBack();
            } else {
              console.warn("⚠️ Prop path restricted. Forcing default home fallback navigation route...");
              // If you are using a global navigate function, you can call it here:
              // navigate('home');
            }
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


export default function ChatScreen({ onBack }: { onBack: () => void }) {
  // ✅ UPGRADED AGENT LOGO: Welcome baseline message updated to introduce Coffee AI
  const [messages, setMessages] = useState([
    { id: '1', from: 'ai', text: 'Hey there! I’m Coffee AI. I’m looking between the lines of your routine. What’s on your mind today?' }
  ]);
  const [text, setText] = useState('');

  const send = () => {
    if (!text.trim()) return;
    tap();
    const userText = text.trim();

    // ✅ EXTENDED CHAT HISTORY: Maintained your standard pipeline push rules
    setMessages((current) => [
      ...current,
      { id: Date.now().toString(), from: 'user', text: userText },
      { id: `${Date.now()}-ai`, from: 'ai', text: 'I’ll hold onto that signal context. I’m checking it against your upcoming days and tracking anomalies.' }
    ]);
    setText('');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>

      {/* HEADER COMPONENT: Configured with your online indicator widget state */}
      <ScreenHeader
        title="Coffee AI" // ✅ UPDATED AGENT NAME
        subtitle="Your secondary context brain, awake and processing."
        onBack={onBack}
        right={
          <View style={styles.aiOnline}>
            <View style={styles.liveDot} />
            <Text style={styles.aiOnlineText}>ONLINE</Text>
          </View>
        }
      />

      {/* 🌌 IMAGE BACKGROUND CANVAS WRAPPER OVERLAY LAYER */}
      <ImageBackground
        // ✅ Direct local requirement file link mapping points straight onto your textured folder assets
        source={require('../assets/images/CoffeeAI_ForgetMeNotAI.png')}
        style={styles.backgroundImageBackgroundCanvas}
        resizeMode="cover"
      >
        {/* Dark cinematic frosted glass scrim overlay to keep messages text readable */}
        <View style={styles.scrimDimmerOverlayFilter}>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.chatScroll}>

            {/* HERO CHAT COMPONENT INTRO BRANDING ROW */}
            <View style={styles.chatIntro}>
              <FGlobe size={84} />
              <Text style={styles.chatIntroTitle}>A thought is a signal.</Text>
              <Text style={styles.chatIntroCopy}>
                Ask me what omissions you might be missing, or leave a thought here for later.
              </Text>
            </View>

            {/* DYNAMIC CONVERSATION RENDER TREE */}
            {messages.map((message) => (
              <View key={message.id} style={[styles.messageRow, message.from === 'user' && styles.messageRowUser]}>
                {message.from === 'ai' ? (
                  <View style={styles.messageAvatar}>
                    <FGlobe size={26} />
                  </View>
                ) : null}
                <View style={[styles.messageBubble, message.from === 'user' ? styles.userBubble : styles.aiBubble]}>
                  <Text style={[styles.messageText, message.from === 'user' && styles.userMessageText]}>
                    {message.text}
                  </Text>
                </View>
              </View>
            ))}

          </ScrollView>

        </View>
      </ImageBackground>

      {/* CONTEXT CHAT INPUT COMPOSER WRAPPER CONTROLS */}
      <View style={[styles.chatComposer, { paddingBottom: Platform.OS === 'web' ? 24 : 12 }]}>
        <TextInput
          testID="chat-input"
          value={text}
          onChangeText={setText}
          onSubmitEditing={send}
          returnKeyType="send"
          placeholder="Tell me a thought…"
          placeholderTextColor={theme.mutedForeground}
          style={styles.chatInput}
        />
        <Pressable
          testID="send-message"
          onPress={send}
          style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
        >
          <Feather name="arrow-up" size={18} color="#050506" />
        </Pressable>
      </View>

    </KeyboardAvoidingView>
  );
}

// ==========================================
// 🎨 CYBERPUNK CHAT INTERFACE STYLE SHEET MAP
// ==========================================
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#050506',
  },
  headerContainer: {
    backgroundColor: '#050506',
    borderBottomWidth: 1,
    borderColor: '#1c1c1f',
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleContent: {
    flex: 1,
  },
  headerTitleText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerSubtitleText: {
    color: '#8a8f98',
    fontSize: 12,
    marginTop: 2,
  },
  headerRightSlot: {
    marginLeft: 12,
  },
  aiOnline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 204, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 204, 0.15)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00ffcc',
    marginRight: 6,
  },
  aiOnlineText: {
    color: '#00ffcc',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  backgroundImageBackgroundCanvas: {
    flex: 1,
    width: '100%',
  },
  scrimDimmerOverlayFilter: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 6, 0.88)', // Solid matte overlay ensures high typing legibility
  },
  chatScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  chatIntro: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
    paddingHorizontal: 20,
  },
  avatarGlowWrapper: {
    backgroundColor: 'rgba(0, 255, 204, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 255, 204, 0.3)',
  },
  chatIntroTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  chatIntroCopy: {
    color: '#8a8f98',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    width: '85%',
  },
  messageRowUser: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    marginRight: 10,
    marginBottom: 2,
  },
  messageBubble: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  aiBubble: {
    backgroundColor: '#121214',
    borderColor: '#1c1c1f',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#00ffcc', // Vibrant user pop highlight palette mapping
    borderColor: '#00ffcc',
    borderBottomRightRadius: 4,
  },
  messageText: {
    color: '#e4e4e7',
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#050506', // High contrast black typography on top of fluorescent green fields
    fontWeight: '600',
  },
  chatComposer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c0c0e',
    borderTopWidth: 1,
    borderColor: '#141417',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#121214',
    borderColor: '#1c1c1f',
    borderWidth: 1,
    borderRadius: 10,
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#00ffcc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#121214',
    opacity: 0.4,
  },
headerBackButton: {
  marginRight: 14,
  width: 34,
  height: 34,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#121214', // Subtle dark card background container matching your theme
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#1c1c1f',
},
headerRow: {
  flexDirection: 'row',        // ✅ Mandated: places arrow and text on the same horizontal line
  alignItems: 'center',
  justifyContent: 'flex-start', // Anchors everything from the left side
},
headerBackButton: {
  marginRight: 14,
  width: 34,
  height: 34,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#121214',  // Raised dark tile container layout accent
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#1c1c1f',
},
headerContainer: {
  backgroundColor: '#050506',
  borderBottomWidth: 1,
  borderColor: '#1c1c1f',
  paddingBottom: 14,
  paddingHorizontal: 20,
  width: '100%',
},
headerRow: {
  flexDirection: 'row',        // ✅ REQUIRED: Places the arrow box and text side-by-side
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '100%',
},
headerBackButton: {
  marginRight: 14,
  width: 34,
  height: 34,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#121214',  // Distinct dark button container surface
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#1c1c1f',
  display: 'flex',             // Force element display parameters
},
headerTitleContent: {
  flex: 1,
},


});
