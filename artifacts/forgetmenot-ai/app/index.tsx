import { Video, Audio } from 'expo-av';
import React, { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Dimensions,
  TextInput,
  View,
  ActivityIndicator,
  Easing,
  Image as RNImage,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useAnalyzeCapture, type CaptureAnalysis } from '@workspace/api-client-react';
import colors from '@/constants/colors';
// Import your newly split layout targets explicitly
import { captureScreenStyles, customAccents } from './CaptureScreen.styles';
import { IntentAnchorWidget, DBIntentAnchor } from './IntentAnchorWidget';
import { RippleShieldWidget } from './RippleShieldWidget'; // Adjust the relative path if you saved the widget file in a separate components folder
import { MemoryScreen } from './MemoryScreen';
import { fetchGeminiSignalAnalysis } from '../config/geminiService';
import ActionsScreen from './ActionsScreen';
import TransitWeatherWidget from './TransitWeatherWidget';
import PredictiveLoopWidget from './PredictiveLoopWidget';
// ✅ Add this line at the top asset import block section of app/index.tsx
import PredictionScreen from './PredictionScreen'; // Update path if stored inside /components folder
// ✅ Add this line at the top asset import block section of app/index.tsx
import ChatScreen from './ChatScreen';
import firestore from '@react-native-firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
// 🌟 THE DATABASE FIX IMPORT: Links your live Firestore references securely
// ✅ THE FIX: Pushes up one directory level (../) then enters the config subfolder
import { db } from '../config/firebaseConfig';
import { doc, onSnapshot as webOnSnapshot, getFirestore, collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, limit, setDoc, getDoc } from 'firebase/firestore';
import { subscribeToLatestAnalysis } from '../config/db';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';

interface CaptureScreenProps {
  onNavigate: (screen: any) => void;
  onCapture: (item: any) => void;
}

interface IntentAnchorContainerProps {
  // Pass the real-time Firestore analysis data down from your screen controller wrapper
  analysisData: DBIntentAnchor;
  anchorActive: boolean;
  setAnchorActive: (active: boolean) => void;
}


interface CaptureScreenProps {
  onNavigate: (screen: string) => void;
  onCapture: (item: any) => void;
  // 🌟 Real production generation hook passed from your root component container
  useAnalyzeCapture: () => {
    mutate: (payload: any, configs: any) => void;
    isPending: boolean;
  };
  theme?: any;
  customAccents?: any;
}

let webDb: any;
if (Platform.OS === 'web') {
  if (getApps().length === 0) {
    initializeApp(firebaseConfig);
  }
  webDb = getFirestore();
}

// Define the hardcoded valid tags requested
type TagOption = 'People' | 'Places' | 'Things';


type Screen =
  | 'home'
  | 'events'
  | 'capture'
  | 'chat'
  | 'profile'
  | 'prediction'
  | 'actions'
  | 'memory'
  | 'contact';

type CapturedItem = {
  id: string;
  title: string;
  detail: string;
  tag: string;
  color: string;
  likelyOmission?: string;
  confidence?: number;
};

const theme = colors.light;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const [analysisData, setAnalysisData] = useState<any>(null);

export const authInstance = getAuth();

const capturedSeed: CapturedItem[] = [
  {
    id: '1',
    title: 'Bring the blue folder',
    detail: 'Mentioned in a photo from yesterday',
    tag: 'OBJECT',
    color: theme.cyan,
  },
  {
    id: '2',
    title: 'Reply to Maya before Friday',
    detail: 'Inferred from your recent chat',
    tag: 'PEOPLE',
    color: theme.pink,
  },
];

const predictions = [
  {
    icon: 'sunrise',
    color: theme.gold,
    title: 'The early train',
    copy: 'You have a 7:10 AM departure tomorrow. Your travel card was last seen at home.',
    meta: 'Tomorrow · 7:10 AM',
    score: '92%',
  },
  {
    icon: 'package',
    color: theme.cyan,
    title: 'Return the lens',
    copy: 'A borrowed camera lens is due back this weekend. We found no return reminder.',
    meta: 'Saturday · 4 days',
    score: '78%',
  },
  {
    icon: 'heart',
    color: theme.pink,
    title: 'Check in with Dad',
    copy: 'Your usual Sunday call is coming up. It has been 9 days since your last one.',
    meta: 'Sunday · Personal',
    score: '71%',
  },
];

const events = [
  { time: '07:10', am: 'AM', title: 'Train to Central', type: 'TRAVEL', color: theme.cyan },
  { time: '10:30', am: 'AM', title: 'Design review', type: 'WORK', color: theme.pink },
  { time: '06:00', am: 'PM', title: 'Pick up dry cleaning', type: 'ERRAND', color: theme.green },
];

function tap() {
  // Optional chaining safely drops execution if the native module is absent (like on Web)
  Haptics?.selectionAsync?.().catch(() => {
    // Suppress any background warnings gracefully
  });
}

// --- ANIMATED CHIP COMPONENT ---
// ✅ THE CRITICAL ACCENTS FIX: Added customAccents and styles directly to the props interface signature
function AnimatedTagChip({
  tag,
  isActive,
  onPress,
  customAccents,
  styles
}: {
  tag: TagOption;
  isActive: boolean;
  onPress: () => void;
  customAccents: any;
  styles: any;
}) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: isActive ? 1.02 : 1,
      friction: 6,
      tension: 40,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [isActive]);

  let iconName: keyof typeof Feather.glyphMap = 'box';
  let activeBg = 'rgba(0, 240, 255, 0.15)';
  let activeBorder = customAccents?.cyan || '#00f0ff';
  let activeColor = customAccents?.cyan || '#00f0ff';

  if (tag === 'People') {
    iconName = 'user';
    activeBg = 'rgba(255, 0, 127, 0.15)';
    activeBorder = customAccents?.pink || '#ff007f';
    activeColor = customAccents?.pink || '#ff007f';
  } else if (tag === 'Places') {
    iconName = 'map-pin';
    activeBg = 'rgba(255, 191, 0, 0.15)';
    activeBorder = customAccents?.gold || '#ffbf00';
    activeColor = customAccents?.gold || '#ffbf00';
  }

  return (
    <Animated.View style={[captureScreenStyles.chipWrapper, { transform: [{ scale: scaleValue }] }]}>
      <Pressable
        onPress={onPress}
        style={[
          captureScreenStyles.tagChip,
          isActive ? { backgroundColor: activeBg, borderColor: activeBorder } : captureScreenStyles.tagChipInactive
        ]}
      >
        <Feather name={iconName} size={15} color={isActive ? activeColor : '#A3A3A3'} style={captureScreenStyles.chipIcon} />
        <Text style={[captureScreenStyles.tagChipText, isActive ? { color: activeColor, fontWeight: '700' } : captureScreenStyles.tagChipTextInactive]}>
          {tag}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// Global UI Layout Wrapper
export function CategoryContextSelector({
  selectedTag,
  setSelectedTag,
}: {
  selectedTag: TagOption;
  setSelectedTag: (tag: TagOption) => void;
}) {
  return (
    <View style={styles.tagSelectorContainer}>
      <Text style={styles.tagSelectorTitle}>Select Category Context</Text>
      <View style={styles.tagSelectorRow}>
        {(['People', 'Places', 'Things'] as TagOption[]).map((tag) => (
          <AnimatedTagChip
            key={tag}
            tag={tag}
            isActive={selectedTag === tag}
            onPress={() => {
              if (typeof tap === 'function') tap();
              setSelectedTag(tag);
            }}
          />
        ))}
      </View>
    </View>
  );
}


function FGlobe({ size = 50, showWord = false }: { size?: number; showWord?: boolean }) {
  return (
    <View style={styles.brandLockup}>
      <View style={[styles.fGlobe, { width: size, height: size, borderRadius: size / 2 }]}>
        <View style={[styles.orbit, { width: size * 0.46, height: size * 0.82, borderRadius: size / 2 }]} />
        <View style={[styles.orbit, styles.orbitHorizontal, { width: size * 0.82, height: size * 0.32, borderRadius: size / 2 }]} />
        <Text style={[styles.fMark, { fontSize: size * 0.42 }]}>F</Text>
      </View>
      {showWord ? <Text style={styles.brandName}>FORGETMENOT</Text> : null}
    </View>
  );
}

function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  // ✅ THE FIX: Safely fallback to 0 margins if the hook returns undefined inside this context block
  const safeInsets = useSafeAreaInsets();
  const insets = safeInsets || { top: 0, bottom: 0, left: 0, right: 0 };

  return (
    <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 67 : insets.top + 12 }]}>
      <View style={styles.headerRow}>
        {onBack ? (
          <Pressable testID="back-button" onPress={() => { tap(); onBack(); }} style={styles.iconButton}>
            <Feather name="arrow-left" size={20} color={theme.text} />
          </Pressable>
        ) : (
          <FGlobe size={34} />
        )}
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
        </View>
        {right ?? <View style={styles.headerSpacer} />}
      </View>
    </View>
  );
}

function SectionTitle({ eyebrow, title, action, onAction }: { eyebrow?: string; title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {action ? (
        <Pressable onPress={() => { tap(); onAction?.(); }} style={styles.textAction}>
          <Text style={styles.textActionLabel}>{action}</Text>
          <Feather name="arrow-up-right" size={15} color={theme.cyan} />
        </Pressable>
      ) : null}
    </View>
  );
}

function Pill({ label, color = theme.cyan }: { label: string; color?: string }) {
  return (
    <View style={[styles.pill, { borderColor: `${color}55`, backgroundColor: `${color}12` }]}>
      <View style={[styles.pillDot, { backgroundColor: color }]} />
      <Text style={[styles.pillLabel, { color }]}>{label}</Text>
    </View>
  );
}

function PredictionCard({ item, onPress }: { item: any; onPress: () => void }) {
  // 1️⃣ ACCENT COLOR FALLBACK
  const activeColor = item.color || '#00ffcc';

  // 2️⃣ ✅ DIRECT VARIABLE RECONCILIATION LAYER
  // Remaps your incoming database field arrays straight onto your card's exact property expectations!
  const computedTitle = item.title || "Active Sync Anomaly";
  const computedCopy = item.copy || item.detail || "Monitoring active parameter loops.";
  const computedMeta = item.meta || (item.tag || "PRACTICAL").toUpperCase();
  const computedScore = item.score || item.probability || "95%";

  // 3️⃣ ✅ WEB-SAFE AUTOMATIC ICON LOOKUP INTERCEPTOR
  let computedIconName: keyof typeof Feather.glyphMap = "package";

  if (computedMeta === 'PEOPLE' || computedMeta === 'PERSONAL') {
    computedIconName = "heart";
  } else if (computedMeta === 'PLACES' || computedMeta === 'TRAVEL') {
    computedIconName = "sunrise";
  } else if (computedMeta === 'PRACTICAL' || computedMeta === 'THINGS' || computedMeta === 'WORK') {
    // 💼 Centers the briefcase icon perfectly matching your team meeting log trace paths!
    computedIconName = "briefcase";
  }

  return (
    <Pressable
      testID={`prediction-${computedTitle}`}
      onPress={() => {
        if (typeof tap === 'function') tap();
        onPress();
      }}
      style={({ pressed }) => [styles.predictionCard, pressed && styles.pressed]}
    >
      <View style={styles.predictionTop}>

        {/* 🟢 FIXED ICON BADGE: Corrected width, heights, and passes the dynamically computed icon key string */}
        <View style={[styles.predictionIcon, { backgroundColor: `${activeColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }]}>
          <Feather
            name={computedIconName}
            size={19}
            color={activeColor}
          />
        </View>

        <View style={styles.predictionHeading}>
          <Text style={styles.cardTitle}>{computedTitle}</Text>
          <Text style={styles.cardMeta}>{computedMeta}</Text>
        </View>

        <View style={styles.scoreWrap}>
          <Text style={[styles.score, { color: activeColor }]}>{computedScore}</Text>
          <Text style={styles.scoreLabel}>LIKELY</Text>
        </View>

      </View>

      <Text style={styles.cardCopy}>{computedCopy}</Text>

      <View style={styles.predictionFooter}>
        <Text style={styles.predictionHint}>Prevent this omission</Text>
        <View style={[styles.smallArrow, { backgroundColor: activeColor }]}>
          <Feather name="arrow-up-right" size={14} color={theme.background} />
        </View>
      </View>

    </Pressable>
  );
}

function BottomNav({ screen, onNavigate }: { screen: Screen; onNavigate: (next: Screen) => void }) {
  const items: { id: Screen; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { id: 'home', label: 'Home', icon: 'activity' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'capture', label: 'Capture', icon: 'plus-circle' },
    { id: 'chat', label: 'Chat', icon: 'message-circle' },
    { id: 'profile', label: 'You', icon: 'user' },
  ];
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bottomNav, { paddingBottom: Platform.OS === 'web' ? 34 : Math.max(insets.bottom, 10) }]}>
      {items.map((item) => {
        const active = item.id === screen;
        return (
          <Pressable
            key={item.id}
            testID={`nav-${item.id}`}
            onPress={() => { tap(); onNavigate(item.id); }}
            style={({ pressed }) => [styles.navItem, pressed && styles.pressed]}
          >
            <Feather name={item.icon} size={20} color={active ? theme.pink : theme.mutedForeground} />
            <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
            {active ? <View style={styles.navIndicator} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function HomeScreen({ onNavigate, captured }: { onNavigate: (screen: Screen) => void; captured: CapturedItem[] }) {
    const insets = useSafeAreaInsets();
    const pulse = useRef(new Animated.Value(0)).current;
    // 🌟 1. MOCK STATE HOOKS: Track card dismissals dynamically on layout
   // const [anchorActive, setAnchorActive] = useState(true);
    const [shieldActive, setShieldActive] = useState(true);
    const userId = "Admin_ForgetMeNotAI";

    // 🌟 2. ANIMATED GLIDE WRAPPERS: Control entrance sliding offsets upon app startup
    const startUpFade = useRef(new Animated.Value(0)).current;
    const anchorSlideY = useRef(new Animated.Value(40)).current;
    const shieldSlideY = useRef(new Animated.Value(40)).current;
    // 🌟 THE ROUTER STATE MANAGER: Tracks which viewport panel should be mounted active on screen
    // ✅ THE DIRECT FIX: Initialize local state tracking directly inside this screen sandbox
    const [dbSignals, setDbSignals] = useState<any[]>([]);
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [anchorActive, setAnchorActive] = useState<boolean>(true); // Preserved component state control

    useFocusEffect(
      useCallback(() => {
        if (!shieldActive) return;

        shieldSlideY.stopAnimation();
        startUpFade.stopAnimation();

        shieldSlideY.setValue(60);
        startUpFade.setValue(0);

        Animated.parallel([
          Animated.timing(shieldSlideY, {
            toValue: 0,
            duration: 450,
            useNativeDriver: true,
          }),

          Animated.timing(startUpFade, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
        ]).start();

        return () => {
          shieldSlideY.stopAnimation();
          startUpFade.stopAnimation();
        };
      }, [shieldActive])
    );

    // 2. Ensure your real-time useEffect query updates this state automatically:
    useEffect(() => {
      // ==============================================================
      // 🧭 HYDRATED SNAPSHOT LISTENER (AUTO-CALCULATES TAG & COLOR)
      // ==============================================================
      const q = query(collection(db, "analyses"), where("user_id", "==", userId));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        // ✅ 1. Check if we are actually getting documents from Firestore
        console.log("➡️ SNAPSHOT TRIGGERED. TOTAL RECEIVED DOCUMENTS:", snapshot.docs.length);

        if (snapshot.docs.length === 0) {
          console.log("❌ ZERO RECORDS: No matching documents found for user:", userId);
          setDbSignals([]);
          return;
        }

        const hydratedDocs = snapshot.docs.map((doc, idx) => {
          const rawData = doc.data();

          // 🔬 PRINT THE UNCHANGED INCOMING RECORD FOR DIAGNOSTICS
          if (idx === 0) {
            console.log("----------------------------------------");
            console.log("🔍 INSPECTING FIRST DOCUMENT ID:", doc.id);
            console.log("📦 RAW FIRESTORE DATA PAYLOAD:", JSON.stringify(rawData, null, 2));
          }

          // 2. Resolve tag parameters
          let inferredTag = (rawData.tag || rawData.categoryTag || rawData.analysis?.category || "PRACTICAL").toUpperCase();
          if (inferredTag === 'PERSONAL') inferredTag = 'PEOPLE';
          if (inferredTag === 'TRAVEL') inferredTag = 'PLACES';

          // 3. Resolve accent layout colors
          let computedColor = '#00ffcc';
          if (inferredTag === 'PEOPLE') computedColor = '#ff007f';
          else if (inferredTag === 'PLACES') computedColor = '#ffd700';

            console.log("🔍 INSPECTING inferredTag:", inferredTag);

          const rawConfidence = rawData.analysis?.confidence || rawData.metrics?.probability_index || 95;

          const formattedObj = {
            id: doc.id,
            ...rawData,
            title: rawData.title || rawData.analysis?.signal || "Active Sync Anomaly",
            detail: rawData.detail || rawData.analysis?.explanation || "Tracking active metrics...",
            tag: inferredTag,
            color: computedColor,
            probability: `${rawConfidence}% likely`
          };

          if (idx === 0) {
            console.log("✨ HYDRATED COMPONENT OUTPUT ITEM:", JSON.stringify(formattedObj, null, 2));
            console.log("----------------------------------------");
          }

          return formattedObj;
        });

        setDbSignals(hydratedDocs);
      });

      return () => unsubscribe();

    }, [userId]);

useEffect(() => {
  if (anchorActive && analysisData) {
    Animated.parallel([
      Animated.timing(startUpFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(anchorSlideY, { toValue: 0, duration: 400, useNativeDriver: true })
    ]).start();
  }
}, [anchorActive, analysisData]); // 🚀 Triggers instantly when data shifts from false to true


    useEffect(() => {
      // Triggers the subscription cleanly across web, ios, or android seamlessly
      const unsubscribe = subscribeToLatestAnalysis((rawDbPayload) => {
        console.log("🔥 Clean Database Data Arrived:", rawDbPayload);

        if (rawDbPayload && rawDbPayload.analysis) {
          const item = rawDbPayload.analysis;

          // Parse data fields into the visual target slots for the Widget component card
          setAnalysisData({
            intent_anchor: {
              anchor_point: item.signal || "Routine Path Execution Window",
              routine_deviation_probability: `${item.confidence ?? 73}% Deviation Risk Index`,
              user_unstated_goal: item.detail || item.explanation || "No target objective tracked."
            },
            metrics: {
              total_loops: parseInt(item.dependencyNodesCount, 10) || 4,
              memory_drops_prevented: 0,
              system_health: item.categoryTag || "Active State Tracking"
            }
          });
        }
      });

      return () => unsubscribe();
    }, []);

    console.log('Intent Anchor Visibility Debug:', {
            anchorActive,
            hasAnalysisData: !!analysisData
      });

     useEffect(() => {
        // Sequentially cascade widgets upwards into focal layout ranges smoothly
        Animated.parallel([
          Animated.timing(startUpFade, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
          Animated.spring(anchorSlideY, { toValue: 0, tension: 35, friction: 8, useNativeDriver: Platform.OS !== 'web' }),
          Animated.spring(shieldSlideY, { toValue: 0, tension: 30, friction: 8, useNativeDriver: Platform.OS !== 'web' }),
        ]).start();
      }, []);

        console.log("🔑 API KEY CHECK:", {
          google: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ? "LOADED" : "MISSING",
          weather: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY ? "LOADED" : "MISSING"
        });


  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1700, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulse, { toValue: 0, duration: 1700, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    ).start();
  }, [pulse]);
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.04] });


  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, { paddingTop: Platform.OS === 'web' ? 67 : insets.top + 12, paddingBottom: 118 }]}
    >
      <View style={styles.homeTop}>
        <View>
          <Text style={styles.miniLabel}>TUESDAY · 18 AUG 2026</Text>
          <Text style={styles.greeting}>Good morning, Alex</Text>
        </View>
        <Pressable testID="home-profile" onPress={() => { tap(); onNavigate('profile'); }} style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </Pressable>
      </View>


      <ImageBackground source={require('@/assets/images/ai-globe.jpg')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <View style={styles.heroOverlay} />
        <View style={styles.heroCopy}>
          <View style={styles.statusRow}><View style={styles.liveDot} /><Text style={styles.statusText}>WATCHING YOUR CONTEXT</Text></View>
          <Text style={styles.heroTitle}>Let the important{"\n"}things find you.</Text>
          <Text style={styles.heroBody}>ForgetMeNot notices the gaps between what you know and what you’ll need next.</Text>
          <Pressable testID="hero-capture" onPress={() => { tap(); onNavigate('capture'); }} style={({ pressed }) => [styles.heroCta, pressed && styles.pressed]}>
            <Text style={styles.heroCtaText}>Give it a signal</Text>
            <Feather name="arrow-up-right" size={16} color={theme.background} />
          </Pressable>
        </View>
        <Animated.View style={[styles.heroOrb, { transform: [{ scale: ringScale }] }]}>
          <FGlobe size={70} />
        </Animated.View>
      </ImageBackground>

<View style={{ height: 18 }} />

    {/* ✅ THE FIXED SCROLL CONTEXT CONTAINER: Forces full viewport re-calculations when returning from other screens */}
      <View style={{ flex: 1, paddingHorizontal: 0 }}>
             {/* ============================================================== */}
             {/* 🌤️ 🚆 MOUNT TRANSIT WEATHER WIDGET HERE                        */}
             {/* ============================================================== */}
             <TransitWeatherWidget onNavigate={(screenKey) => onNavigate(screenKey)} />

              {/* ✅ THE VISUAL VERTICAL SPACER LAYOUT BAR */}
              <View style={{ height: 18 }} />


             {/* --- AI SIGNALS CONSOLIDATED LIVE COLLECTION SECTION --- */}
             <SectionTitle
               eyebrow="AI SIGNALS"
               title="You might forget…"
               action="See all"
               onAction={() => onNavigate('prediction')}
             />
             {/* ✅ THE FIX: Render the Predictive Loop Widget ALWAYS so it is never hidden */}
             <PredictiveLoopWidget
               signals={dbSignals}
               onPress={() => onNavigate('prediction')}
             />

             {dbSignals.length === 0 ? (
               <View style={styles.emptyViewBox}>
                 <Text style={styles.emptyViewText}>No predictive loop anomalies tracked yet.</Text>
               </View>
             ) : (
               <View>
                 <PredictionCard
                   item={{
                     // ✅ FIXED: Look up index [0] on your state array loop variables across ALL parameters
                     title: dbSignals[0]?.title || dbSignals[0]?.analysis?.signal || "Active Sync Anomaly",
                     detail: dbSignals[0]?.detail || dbSignals[0]?.analysis?.explanation || "Tracking active metrics...",
                     color: dbSignals[0]?.color || '#00ffcc',
                     probability: dbSignals[0]?.probability || `${dbSignals[0]?.analysis?.confidence || 95}% likely`,
                     tag: dbSignals[0]?.tag || dbSignals[0]?.categoryTag || "PRACTICAL"
                   }}
                   onPress={() => onNavigate('prediction')}
                 />
               </View>
             )}
           </View>

         {/* ✅ THE VISUAL VERTICAL SPACER LAYOUT BAR */}
         <View style={{ height: 18 }} />

      <SectionTitle eyebrow="YOUR SIGNALS" title="Recent context" action="Open memory" onAction={() => onNavigate('memory')} />
      <View style={styles.contextCard}>
        <View style={styles.contextTimeline}>
          <View style={[styles.timelineDot, { backgroundColor: theme.green }]} />
          <View style={styles.timelineLine} />
          <View style={[styles.timelineDot, { backgroundColor: theme.pink }]} />
        </View>
        <View style={styles.contextItems}>
          <View style={styles.contextItem}><Text style={styles.contextTime}>09:42</Text><Text style={styles.contextText}>Captured a photo of a blue folder</Text></View>
          <View style={styles.contextItem}><Text style={styles.contextTime}>YESTERDAY</Text><Text style={styles.contextText}>Booked a train for tomorrow morning</Text></View>
        </View>
      </View>


       {/* 🧭 INTENT ANCHOR CONTAINER WITH SLIDE ENTRANCE */}
       {anchorActive && analysisData && (
         <Animated.View style={{ opacity: startUpFade, transform: [{ translateY: anchorSlideY }] }}>
           <IntentAnchorWidget
             analysisData={analysisData}
             onSelectStrategy={(strategyId) => {
               console.log('Dynamic Strategy Action triggered:', strategyId);
               // Dismisses the active intention widget layout slide instantly on choice confirm
               setAnchorActive(false);
             }}
           />
         </Animated.View>
       )}

         {/* ✅ THE VISUAL VERTICAL SPACER LAYOUT BAR */}
         <View style={{ height: 18 }} />

{/* 🔮 RIPPLE SHIELD SYSTEM CONTAINER: FULL DYNAMIC HEIGHT ANCHOR */}
{shieldActive && (
  // ✅ FIX 1: This static wrapper acts as an unmoving anchor box in the layout tree
  <View style={{ width: '100%', position: 'relative', display: 'flex', zIndex: 10 }}>
    <Animated.View
      style={{
        opacity: startUpFade,
        transform: [{ translateY: shieldSlideY }],
        // ✅ FIX 2: Removed minHeight/height to let the child component naturally handle height calculations
        width: '100%',
        display: 'flex',
      }}
    >
      <RippleShieldWidget
        // ✅ FIX 3: Passed your pre-flattened Firestore document array title string safely from DB
        omissionItem={dbSignals[0]?.title || "Active Context Risk"}
        onPreventRipple={() => setShieldActive(false)}
      />
    </Animated.View>
  </View>
)}
        {/* ✅ THE VISUAL VERTICAL SPACER LAYOUT BAR */}
        <View style={{ height: 18 }} />

 <View style={{ height: 24, width: '100%', clear: 'both' as any }} />
      <View style={styles.quickRow}>
        {/* 🌌 DYNAMIC ORBITAL QUICK ACTIONS LINK CARD */}
        <Pressable
          testID="quick-actions"
          onPress={() => {
            if (typeof tap === 'function') tap();
            onNavigate('actions');
          }}
          style={({ pressed }) => [styles.quickCardWrapper, pressed && { opacity: 0.9 }]}
        >
          <ImageBackground
            // ✅ Uses your local asset texture image background safely
            source={require('../assets/images/ActionOmissionForgetMeNotAI.png')}
            style={styles.quickCardBackground}
            imageStyle={styles.quickCardImageRadius}
          >
            {/* Cinematic dark frosted overlay to guarantee readable copy contrasts */}
            <View style={styles.quickCardScrimOverlay}>
              <View style={styles.quickCardHeaderRow}>
                <View style={styles.badgeIndicatorPill}>
                  <Text style={styles.badgeIndicatorPillText}>
                    {/* ✅ DYNAMIC COUNT: Displays padded total records natively */}
                    {dbSignals.length < 10 ? `0${dbSignals.length}` : dbSignals.length} ACTIVE CHECKPOINTS
                  </Text>
                </View>
                <Feather name="arrow-up-right" size={16} color="#00ffcc" />
              </View>

              <Text style={styles.quickCardMainTitle}>Launch Action Blueprint</Text>
              <Text style={styles.quickCardSubCopy}>Convert invisible predictive anomalies into immediate kind steps.</Text>
            </View>
          </ImageBackground>
        </Pressable>
        {/* 🌌 IMMERSIVE HIGH-CONTRAST CHAT SHEET INTERACTION CARD */}
        <Pressable
          testID="quick-chat"
          onPress={() => {
            if (typeof tap === 'function') tap();
            onNavigate('chat');
          }}
          style={({ pressed }) => [styles.quickChatCardWrapper, pressed && { opacity: 0.9 }]}
        >
          <ImageBackground
            source={require('../assets/images/CoffeeAI_HomePage.png')}
            style={styles.quickChatCardBackground}
            // ✅ THE DIRECT FIX: Pass the alignment overrides to focus on the lower half texture
            imageStyle={[styles.quickChatCardImageRadius, styles.imageLastHalfFocus]}
          >
            {/* Cinematic translucent dark frosted scrim to make text easily readable */}
            <View style={styles.quickChatCardScrimOverlay}>

              <View style={styles.quickChatHeaderRow}>
                <View style={styles.chatActionIconCircleBadge}>
                  <Feather name="message-circle" size={18} color="#ff007f" />
                </View>
                <Feather name="coffee" size={14} color="#ff007f" />
              </View>

              <Text style={styles.quickChatMainTitleText}>Ask Coffee AI</Text>
              <Text style={styles.quickChatSubLabelText}>Your secondary contextual memory brain.</Text>

            </View>
          </ImageBackground>
        </Pressable>
      </View>
      {captured.length > 2 ? <Text style={styles.captureCount}>{captured.length} pieces of context feeding your signal map</Text> : null}
    </ScrollView>
  );
}

function EventsScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [selectedDay, setSelectedDay] = useState(18);
  const days = [16, 17, 18, 19, 20, 21, 22];
  return (
    <View style={styles.screen}>
      <ScreenHeader title="Your events" subtitle="The shape of your next few days" right={<Pressable onPress={() => { tap(); onNavigate('capture'); }} style={styles.iconButton}><Feather name="plus" size={21} color={theme.cyan} /></Pressable>} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.innerScroll}>
        <View style={styles.weekRow}>
          {days.map((day, i) => {
            const active = day === selectedDay;
            return (
              <Pressable key={day} onPress={() => { tap(); setSelectedDay(day); }} style={[styles.dayCell, active && styles.dayCellActive]}>
                <Text style={[styles.dayName, active && styles.dayNameActive]}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}</Text>
                <Text style={[styles.dayNumber, active && styles.dayNumberActive]}>{day}</Text>
                {day === 18 ? <View style={[styles.dayDot, { backgroundColor: active ? theme.background : theme.pink }]} /> : null}
              </Pressable>
            );
          })}
        </View>
        <View style={styles.eventIntro}>
          <Text style={styles.dateBig}>TUESDAY, 18 AUG</Text>
          <Pill label="3 EVENTS" color={theme.green} />
        </View>
        {events.map((event) => (
          <View key={event.title} style={styles.eventRow}>
            <View style={styles.eventTime}><Text style={styles.eventTimeText}>{event.time}</Text><Text style={styles.eventAm}>{event.am}</Text></View>
            <View style={[styles.eventBar, { backgroundColor: event.color }]} />
            <View style={styles.eventInfo}><Text style={styles.eventTitle}>{event.title}</Text><Text style={styles.eventType}>{event.type} · SYNCED</Text></View>
            <Feather name="chevron-right" size={17} color={theme.mutedForeground} />
          </View>
        ))}
        <View style={styles.eventInsight}>
          <View style={styles.insightIcon}><Feather name="eye" size={18} color={theme.gold} /></View>
          <View style={styles.insightCopy}><Text style={styles.insightLabel}>OMISSION RADAR</Text><Text style={styles.insightText}>Your 6 PM errand is close to the supermarket. Want me to remind you about the dry cleaning when you leave work?</Text></View>
          <Pressable onPress={() => { tap(); onNavigate('actions'); }}><Feather name="arrow-up-right" size={18} color={theme.gold} /></Pressable>
        </View>
        <Text style={styles.eventsNote}>Events are a signal, not a checklist. ForgetMeNot looks between them.</Text>
      </ScrollView>
    </View>
  );
}

// --- MAIN CAPTURE SCREEN COMPONENT ---
export function CaptureScreen({ onNavigate, onCapture }: { onNavigate: (screen: string) => void; onCapture: (item: any) => void }) {
  const [mode, setMode] = useState<'note' | 'photo' | 'voice'>('note');
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagOption>('Things');

  // 🌟 THE DYNAMIC SHIFT: Initialized cleanly as null. No more hardcoded mock stubs!
    const [analysis, setAnalysis] = useState<{
      signal: string;
      confidence: number;
      likelyOmission: string;
      explanation: string;
      preventiveAction: string;
      category?: string;
    } | null>(null);

  const analyzeMutation = useAnalyzeCapture();

  let geminiResultJson: any = null;

   const [analysisError, setAnalysisError] = useState<string | null>(null);

   const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const userId = "Admin_ForgetMeNotAI"; // Dynamic user pipeline fallback parameter tracking


  // Local style helper fallback object reference mapping
  const theme = colors?.light || {
    background: '#0A0A0A',
    card: '#171717',
    border: '#262626',
    text: '#FFFFFF',
    mutedForeground: '#737373',
    cyan: '#00f0ff'
  };

  const captureContent = text.trim() || (mode === 'photo'
      ? 'A visual context capture from the user that may contain an object, place, or note worth remembering.'
      : 'A voice context capture from the user containing a thought they want ForgetMeNot to keep visible.');

    // 🌟 THE EXACT SAVE CONTROLLER RE-FACTOR: Updated with an async execution pattern
    const save = async () => {
      if (!analysis) {
        if (mode === 'note' && !text.trim()) return;
        tap();
        setAnalysisError('');

        try {
            // 1. Declare the variable outside the block so the entire function can see it

                try {
                    // 🌟 CLEAN CALL: Simply invoke the imported function with your form arguments
                    const geminiResultJson = await fetchGeminiSignalAnalysis(text.trim(), selectedTag.toLowerCase());
                    setAnalysis(geminiResultJson);
                     } catch (parseError) {
                          console.warn("🔥 JSON string structural truncation detected. Recovering using client-side fallback...");

                          // Return a clean fallback object so your UI stays stable
                          return {
                            signal: "Analysis Routine Interrupted",
                            confidence: 50,
                            likelyOmission: "Travel Logistics Check",
                            explanation: "The intelligence engine encountered a processing error while mapping this specific destination path.",
                            preventiveAction: "Verify your travel route, site-access details, and hardware chargers manually.",
                            category: selectedTag.toLowerCase()
                          };
                      setAnalysis(geminiResultJson);
                        }
                     // ✅ THE FIX: Stop execution immediately if data hasn't loaded yet
                      if (!geminiResultJson) {
                        console.warn("⚠️ Cannot save yet: Gemini analysis data is still loading or null.");
                        return;
                      }

                // Map categories cleanly behind the scenes based on Gemini's JSON return payload
                const modelCategory = geminiResultJson?.category?.toLowerCase();
                if (modelCategory === 'people' || modelCategory === 'personal') setSelectedTag('People');
                else if (modelCategory === 'places' || modelCategory === 'travel') setSelectedTag('Places');
                else if (modelCategory === 'practical') setSelectedTag('Practical');
                else setSelectedTag('Things');

             } catch (err: any) {
                     console.error("💥 Error fetching Gemini signal streams:", err);
                     setAnalysisError(err?.message || 'I could not reach Gemini. Verify API parameters and try again.');
                   } finally {
                     setIsAiLoading(false); // Shuts off interface loader spinners
                   }
                   return;
           }

      tap();

      // Assign color layouts based on selected categories
      const activeColor = selectedTag === 'People'
        ? customAccents.pink
        : selectedTag === 'Places'
          ? customAccents.gold
          : customAccents.cyan;

      // Initialize document allocation tracking parameters
      let databaseDocumentId = Date.now().toString();
      // 🌟 SYNC USER TARGET: Aligned cleanly with your active DB log user channel token string
      const targetUserId = "Admin_ForgetMeNotAI";

      try {
        console.log('🔮 Initalizing active Firestore telemetry stream thread...');
         const isPeople = selectedTag === 'People';
         const isPlaces = selectedTag === 'Places';
         const isPractical = selectedTag === 'Practical' || selectedTag === 'Things';

         const handleFetchAnalysis = async () => {
           try {
             await analyzeMutation.mutateAsync();
           } catch (err) {
             console.error("💥 Generation phase failure:", err);
           }
         };

         const handleSaveToFirestore = async () => {
           // ✅ Guard check: stop immediately if the unified state analysis is missing
           if (!analysis) {
             console.warn("⚠️ Aborting save: No active Gemini analysis found in state.");
             return;
           }

           try {
             // ✅ Consolidated Payload: Merging both of your object schemas into one clean payload
             const docPayload = {
               user_id: userId || "Admin_ForgetMeNotAI",
               omission_item: analysis.likelyOmission || 'Context entry logged',
               status: "active_obsession",
               created_at: serverTimestamp(),
               tag: selectedTag.toUpperCase(),
               title: text.trim() || analysis.signal || `New ${selectedTag} Signal`,
               detail: analysis.explanation || "System intelligence tracking sequence active.",
               rawPrompt: text.trim(),
               categoryTag: selectedTag.toLowerCase(),

               // Legacy analysis child nesting mapping matching your old schema
               analysis: {
                 signal: analysis.signal,
                 confidence: analysis.confidence,
                 likelyOmission: analysis.likelyOmission,
                 explanation: analysis.explanation,
                 preventiveAction: analysis.preventiveAction,
                 category: analysis.category,
               },

               intent_anchor: {
                 anchor_point: isPeople ? "Transit Sequence Initiation (Departure Window)" : "Routine Path Execution Window",
                 user_unstated_goal: `Fulfill objective regarding ${selectedTag.toLowerCase()} with zero routine memory drops or friction loops.`,
                 routine_deviation_probability: `${analysis.confidence - 12}% Deviation Risk Index`
               },

               replies_shield: {
                 critical_contact: isPlaces ? "Primary Core Contact Identity" : "Maya (System Context Coordinator)",
                 preemptive_auto_draft: `System alert notification trace: Processing task addressing active ${selectedTag.toLowerCase()} parameters loop.`,
                 trigger_condition: "Fires automatically upon localized telemetry perimeter radar check variance."
               },

               radar_scopes: {
                 is_today: true,
                 is_personal: isPeople || isPlaces,
                 is_practical: isPractical
               },

               gemini_signal_read: {
                 signal_signature: analysis.signal,
                 confidence_rating: Number(analysis.confidence) || 95,
                 structural_explanation: analysis.explanation,
                 preventive_action_blueprint: analysis.preventiveAction,
                 cascading_dominoes: [
                   `Delayed ${(text.trim() || 'preparation').toLowerCase()} sequence (1.42x Velocity Friction engagement)`,
                   "Shortened response window capacity threshold decay",
                   `Downstream tracking failure risk vector for structural ${selectedTag.toLowerCase()} loops`
                 ],
                 holographic_network_nodes: [selectedTag.toUpperCase(), "DELAYED_PREP", "VELOCITY_FRICTION", "OMISSION_RISK"]
               },

               metrics: {
                 probability_index: Number(analysis.confidence) || 95,
                 loop_friction: (analysis.confidence || 95) > 80 ? "1.42x Velocity Friction" : "1.18x Routine Friction",
                 time_gravity: "T-Minus 14 Hours",
                 severity: (analysis.confidence || 95) > 85 ? "Catastrophic Impact" : "High Impact"
               },

               dominoes: [
                 `Delayed ${(analysis.signal || 'preparation').toLowerCase()}`,
                 "Shortened response window",
                 `Potential downstream ${(analysis.likelyOmission || 'omission').toLowerCase()} failure risk`
               ],

               nodes: [
                 (analysis.likelyOmission || 'OMISSION').toUpperCase(),
                 "DELAYED PREP",
                 "TIMELINE DECAY",
                 "MISSED CORE"
               ],

               probability: `${analysis.confidence || 95}%`,
               multiplier: (analysis.confidence || 95) > 80 ? "1.42x Velocity Friction" : "1.18x Routine Friction",
               timeGravity: "T-Minus 14 Hours",
               severity: (analysis.confidence || 95) > 85 ? "Catastrophic Impact" : "High Impact",
               dependencyNodesCount: "04 Downstream Nodes",
               flowVelocity: `${(analysis.confidence || 95) - 5}% Flow Velocity`,
               mitigation: analysis.preventiveAction || 'Place items beside your active layout bag'
             };

             // ✅ Single Fire Write: Sends the full payload in one clean operational push
             const docRef = await addDoc(collection(db, "analyses"), docPayload);
             console.log('🛡️ Document logged cleanly inside Firestore. Cloud Reference Key ID:', docRef.id);

             // Assign to your global scope variable track if declared outside
             databaseDocumentId = docRef.id;
             console.log('🔮  Stored in Firestore telemetry stream thread...');

           } catch (dbError) {
             console.error('💥 Crash writing telemetry data down to your Firestore collection:', dbError);
           }
         };

     } catch (dbError) {
             console.error('💥 Crash writing telemetry data down to your Firestore collection:', dbError);
             // Fallback tracking parameters execute to prevent local app blockages if network times out
           }


      // Passes dynamic data down through your layout state hooks pipeline
      onCapture({
        id: databaseDocumentId, // ✅ Uses live Firestore record pointer string mapping safely
        title: analysis.signal || text.trim() || `New ${selectedTag} Context`,
        detail: `${analysis.likelyOmission || 'Context entry logged'} · ${analysis.confidence || 95}% likely`,
        tag: selectedTag.toUpperCase(),
        color: activeColor,
        likelyOmission: analysis.likelyOmission || 'Context entry logged',
        confidence: analysis.confidence || 95,
      });

      setSaved(true);
      setText('');
      setAnalysis(null);
      setIsAiLoading(false);
      onNavigate('Home');
         console.log('🔮 Stored in Firestore DB');

    };



    return (

      <KeyboardAvoidingView behavior="padding" style={styles.screen}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.innerScroll}>

              {/* --- HERO HEADER BANNER --- */}
              <View style={{ height: 45, width: '100%' }} />
              <View style={styles.captureHero}>
                <RNImage
                  source={require('@/assets/images/capture-back-cover.png')}
                  style={styles.captureImage}
                  resizeMode="contain"
                />
                <View style={styles.captureImageOverlay} />
                <View style={styles.captureHeroCopy}>
                  <Text style={styles.captureEyebrow}>A LITTLE SOMETHING</Text>
                  <Text style={styles.captureTitle}>What should {"\n"}your future {"\n"}self know?</Text>
                </View>
              </View>

        {/* --- CATEGORY SELECTOR CHIPS --- */}
        <View style={captureScreenStyles.tagSelectorContainer}>
          <Text style={captureScreenStyles.tagSelectorTitle}>Select Category Context</Text>
          <View style={captureScreenStyles.tagSelectorRow}>
            {(['People', 'Places', 'Things'] as TagOption[]).map((tag) => (
              <AnimatedTagChip
                key={tag}
                tag={tag}
                isActive={selectedTag === tag}
                onPress={() => { tap(); setSelectedTag(tag); }}
                // 🌟 PASS LOCAL CONTEXT: Allows the chip to read your screen styling tokens flawlessly
                customAccents={customAccents}
                styles={styles}
              />
            ))}
          </View>
        </View>


              {/* --- INPUT MODE SELECTION ROW --- */}
              <View style={styles.captureModeRow}>
                {([['note', 'edit-3', 'Note'], ['photo', 'camera', 'Photo'], ['voice', 'mic', 'Voice']] as const).map(([id, icon, label]) => (
                  <Pressable key={id} onPress={() => { tap(); setMode(id); setAnalysis(null); setAnalysisError(''); }} style={[styles.captureMode, mode === id && styles.captureModeActive]}>
                    <Feather name={icon} size={16} color={mode === id ? '#050506' : '#A3A3A3'} />
                    <Text style={[styles.captureModeLabel, mode === id && styles.captureModeLabelActive]}>{label}</Text>
                  </Pressable>
                ))}
              </View>

              {/* --- INTERACTIVE ACTION FORM VIEWS --- */}
              {mode === 'note' ? (
                <View style={styles.inputWrap}>
                  <TextInput
                    multiline
                    value={text}
                    onChangeText={setText}
                    placeholder="“The thing I’ll definitely remember later…”"
                    placeholderTextColor={theme.mutedForeground}
                    style={styles.captureInput}
                  />
                  <Text style={styles.inputHint}>ForgetMeNot will connect this to your calendar, places, people, and patterns.</Text>
                </View>
              ) : (
                <Pressable onPress={() => { tap(); }} style={styles.mediaCapture}>
                  <View style={styles.mediaIcon}>
                    <Feather
                      name={mode === 'photo' ? 'camera' : 'mic'}
                      size={26}
                      color={mode === 'photo' ? customAccents.cyan : customAccents.gold}
                    />
                  </View>
                  <Text style={styles.mediaTitle}>
                    {mode === 'photo' ? 'Point at the context' : 'Speak the context'}
                  </Text>
                  <Text style={styles.mediaCopy}>
                    {mode === 'photo'
                      ? 'Use your camera to capture an object, note, or scene.'
                      : 'Hold to record a thought before it disappears.'}
                  </Text>
                  <Text style={[styles.mediaAction, { color: mode === 'photo' ? customAccents.cyan : customAccents.gold }]}>
                    {mode === 'photo' ? 'OPEN CAMERA' : 'START RECORDING'}
                  </Text>
                </Pressable>
              )}

              {/* --- DYNAMIC GEMINI DIAGNOSTIC ANALYSIS CARD VIEW --- */}
              {analysis ? (
                <View style={styles.analysisCard}>
                  <View style={styles.analysisHeader}>
                    <View style={styles.analysisBadge}>
                      <Feather name="star" size={15} color={theme.cyan || customAccents.cyan} />
                    </View>
                    <View style={styles.analysisHeaderCopy}>
                      <Text style={styles.analysisEyebrow}>GEMINI SIGNAL READ</Text>
                      <Text style={styles.analysisTitle}>{analysis.signal}</Text>
                    </View>
                    <Text style={styles.analysisConfidence}>{analysis.confidence}%</Text>
                  </View>
                  <Text style={styles.analysisLabel}>YOU MIGHT FORGET</Text>
                  <Text style={styles.analysisOmission}>{analysis.likelyOmission}</Text>
                  <Text style={styles.analysisExplanation}>{analysis.explanation}</Text>
                  <View style={styles.analysisAction}>
                    <Feather name="shield" size={14} color={customAccents.green} />
                    <Text style={styles.analysisActionText}>{analysis.preventiveAction}</Text>
                  </View>
                </View>
              ) : null}

              {analysisError ? <Text style={styles.analysisError}>{analysisError}</Text> : null}

              {/* --- MAIN INTERACTION CTA CONTROL --- */}
              <Pressable
                onPress={save}
                disabled={analyzeMutation.isPending} // Keeps the API thread safe from double-clicks
                style={[
                  styles.primaryButton,
                  // ✅ Innovative Style: Transforms into an active scanning node instead of turning grey
                  analyzeMutation.isPending && styles.scanningActiveButton
                ]}
              >
                <Text style={[
                  styles.primaryButtonText,
                  analyzeMutation.isPending && styles.scanningText
                ]}>
                  {analyzeMutation.isPending ? 'SCANNING LOGISTICS LOOP…' : analysis ? 'Save to my signal map' : 'Analyze with Gemini'}
                </Text>

                {analyzeMutation.isPending ? (
                  // Tiny processing indicator matching the innovative branding text color
                  <ActivityIndicator size="small" color="#00ffcc" />
                ) : (
                  <Feather name="arrow-up-right" size={16} color="#050506" />
                )}
              </Pressable>


            </ScrollView>
          </KeyboardAvoidingView>
    );
}


// ==============================================================
// 🌌 🛸 🔐 HIGH-FIDELITY AUDIO-VISUAL DEEP SPACE IDENTITY GATEWAY
// ==============================================================
function LoginGateScreen({ onAuthComplete }: { onAuthComplete: (userId: string) => void }) {
  const auth = typeof authInstance !== 'undefined' ? authInstance : getAuth();
  const videoRef = useRef<Video>(null);
  const soundObject = useRef<Audio.Sound | null>(null);

  // 🎛️ VIEW CONTROLLERS: 'LOGIN' | 'SIGNUP' | 'FORGOT' | 'PASSCODE_SETUP' | 'PASSCODE_VERIFY'
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT' | 'PASSCODE_SETUP' | 'PASSCODE_VERIFY'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [activeUser, setActiveUser] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });
  const [isProcessing, setIsProcessing] = useState(false);

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // 🌀 ANIMATION DRIVERS
  const emailGlowAnim = useRef(new Animated.Value(0)).current;
  const passwordGlowAnim = useRef(new Animated.Value(0)).current;
  const logoRotationAnim = useRef(new Animated.Value(0)).current;

  // 🧭 INTERPOLATION MAPPINGS
  const range01 = new Array(0, 1);
  const emailBorderInterpolate = emailGlowAnim.interpolate({ inputRange: range01, outputRange: ['#26262b', '#00f0ff'] });
  const passwordBorderInterpolate = passwordGlowAnim.interpolate({ inputRange: range01, outputRange: ['#26262b', '#ff007f'] });
  const logoSpinAngle = logoRotationAnim.interpolate({ inputRange: range01, outputRange: ['0deg', '360deg'] });

  useEffect(() => {
    // Continuous 360-degree brand logo rotation loop
    Animated.loop(
      Animated.timing(logoRotationAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      })
    ).start();

    async function activateCosmicSoundscapes() {
      try {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync(
          require('@/assets/audio/cosmic-ambient-void.mp3'),
          { shouldPlay: true, isLooping: true, volume: 0.45 }
        );
        soundObject.current = sound;
      } catch (error) {
        console.warn("⚠️ Audio synthesis skipped inside this browser sandbox context.");
      }
    }
    activateCosmicSoundscapes();
    return () => {
      if (soundObject.current) soundObject.current.unloadAsync();
    };
  }, []);

  useEffect(() => {
    Animated.timing(emailGlowAnim, { toValue: emailFocused ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [emailFocused]);

  useEffect(() => {
    Animated.timing(passwordGlowAnim, { toValue: passwordFocused ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [passwordFocused]);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        setActiveUser(user);
        setIsProcessing(true);
        try {
          const docSnap = await getDoc(doc(db, "users", user.uid));
          if (docSnap.exists() && docSnap.data().secure_passcode) setAuthMode('PASSCODE_VERIFY');
          else setAuthMode('PASSCODE_SETUP');
        } catch (e) {
          setAuthMode('PASSCODE_SETUP');
        }
        setIsProcessing(false);
      } else {
        setActiveUser(null);
        setAuthMode('LOGIN');
      }
    });
  }, []);

  const clearMessages = () => setStatusMessage({ text: '', isError: false });

  const handleAuth = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    clearMessages();
    try {
      if (authMode === 'LOGIN') {
        if (!email.trim() || !password.trim()) return;
        await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      } else if (authMode === 'SIGNUP') {
        if (!email.trim() || !password.trim()) return;
        await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
        setStatusMessage({ text: "IDENTITY REGISTER INITIALIZED.", isError: false });
      } else if (authMode === 'FORGOT') {
        if (!email.trim()) return;
        await sendPasswordResetEmail(auth, email.trim());
        setStatusMessage({ text: "Reset verification loop link dispatched to email.", isError: false });
        setTimeout(() => setAuthMode('LOGIN'), 3000);
      } else if (authMode === 'PASSCODE_SETUP') {
        if (passcode.length !== 4 || !activeUser) return;
        await setDoc(doc(db, "users", activeUser.uid), {
          email: activeUser.email,
          secure_passcode: passcode,
          updated_at: new Date().toISOString()
        }, { merge: true });
        onAuthComplete(activeUser.uid);
      } else if (authMode === 'PASSCODE_VERIFY') {
        if (passcode.length !== 4 || !activeUser) return;
        const snap = await getDoc(doc(db, "users", activeUser.uid));
        if (snap.exists() && snap.data().secure_passcode === passcode) {
          onAuthComplete(activeUser.uid);
        } else {
          setStatusMessage({ text: "INVALID KEY TRANSMISSION. ACCESS REJECTED.", isError: true });
          setPasscode('');
        }
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Operation failed inside security gate.", isError: true });
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <KeyboardAvoidingView behavior="padding" style={styles.cyberAuthScreenContainer}>
      <Video
        ref={videoRef}
        source={require('../assets/Videos/Planet_Galaxy.mp4')}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
        shouldPlay
        isLooping
        isMuted={true}
      />
      <View style={styles.videoHeavyDarkVignetteOverlay} />

      <ScrollView contentContainerStyle={styles.authCoreScrollContentEnforcer}>

        {/* ROTATING LOGO ENTRY DOCK HEADER */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Animated.View style={{ transform: [{ rotate: logoSpinAngle }] }}>
            <FGlobe size={64} />
          </Animated.View>
          <Text style={[styles.brandName, { marginTop: 16, fontSize: 16, letterSpacing: 4, color: '#ffffff', fontWeight: '900' }]}>FORGETMENOT</Text>
          <Text style={{ color: '#00f0ff', fontSize: 9, letterSpacing: 1.5, marginTop: 4, fontWeight: '800' }}>
            PREDICTIVE IDENTITY MATRIX // ACTIVE MONITOR
          </Text>
        </View>

        {/* EMAIL & PASSWORD INPUT FORMS CONTAINER DOCKS */}
        {(authMode === 'LOGIN' || authMode === 'SIGNUP' || authMode === 'FORGOT') && (
          <View style={styles.cyberGlassmorphicInputsCardContainer}>
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.contactInputLabel, emailFocused && { color: '#00f0ff' }]}>SECURE USEREMAIL CHANNEL</Text>
              <Animated.View style={[styles.cyberAnimatedInputWrapperField, { borderColor: emailBorderInterpolate }]}>
                <Feather name="mail" size={14} color={emailFocused ? "#00f0ff" : "#8a8f98"} style={{ marginRight: 10 }} />
                <TextInput
                  autoCapitalize="none" keyboardType="email-address" placeholder="name@domain.com" placeholderTextColor="#52525b"
                  value={email} onChangeText={setEmail} onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)}
                  style={styles.cyberTerminalTextInputElement} onSubmitEditing={handleAuth}
                />
              </Animated.View>
            </View>

            {authMode !== 'FORGOT' && (
              <View style={{ marginBottom: 20 }}>
                <Text style={[styles.contactInputLabel, passwordFocused && { color: '#ff007f' }]}>SECURITY SECURITY ACCESS KEY</Text>
                <Animated.View style={[styles.cyberAnimatedInputWrapperField, { borderColor: passwordBorderInterpolate }]}>
                  <Feather name="lock" size={14} color={passwordFocused ? "#ff007f" : "#8a8f98"} style={{ marginRight: 10 }} />
                  <TextInput
                    secureTextEntry autoCapitalize="none" placeholder="••••••••" placeholderTextColor="#52525b"
                    value={password} onChangeText={setPassword} onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)}
                    style={styles.cyberTerminalTextInputElement} onSubmitEditing={handleAuth}
                  />
                </Animated.View>
              </View>
            )}

            {/* PRIMARY BUTTON: EMAIL AUTH MODE */}
            <Pressable onPress={handleAuth} disabled={isProcessing} style={({ pressed }) => [styles.cyberTerminalActionButtonCTA, { marginTop: 8, marginBottom: 16 }, isProcessing && { backgroundColor: '#131316' }, pressed && { opacity: 0.85 }]}>
              {isProcessing ? <ActivityIndicator size="small" color="#00f0ff" /> : <Text style={styles.cyberTerminalActionButtonCTAText}>{authMode === 'LOGIN' ? 'ENGAGE IDENTITY AUTHENTICATION' : authMode === 'SIGNUP' ? 'COMPILE NEW SYSTEM MATRIX' : 'DISPATCH PASSWORD RESET'}</Text>}
            </Pressable>

            {/* EMAIL ROW FOOTER TOGGLE LINKS */}
            <View style={styles.cyberAuthTogglesUnifiedFooterRowContainer}>
              {authMode === 'LOGIN' && (
                <>
                  <Pressable onPress={() => { setAuthMode('SIGNUP'); clearMessages(); }} style={styles.touchTargetToggleLink} hitSlop={10}><Text style={{ color: '#ff007f', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 }}>Create Account</Text></Pressable>
                  <View style={{ width: 1, height: 12, backgroundColor: '#26262b' }} />
                  <Pressable onPress={() => { setAuthMode('FORGOT'); clearMessages(); }} style={styles.touchTargetToggleLink} hitSlop={10}><Text style={{ color: '#ffd700', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 }}>Forgot Password?</Text></Pressable>
                </>
              )}
              {authMode === 'SIGNUP' && <Pressable onPress={() => { setAuthMode('LOGIN'); clearMessages(); }} style={styles.touchTargetToggleLink} hitSlop={10}><Text style={{ color: '#00f0ff', fontSize: 12, fontWeight: '800' }}>Existing Member Login</Text></Pressable>}
              {authMode === 'FORGOT' && <Pressable onPress={() => { setAuthMode('LOGIN'); clearMessages(); }} style={styles.touchTargetToggleLink} hitSlop={10}><Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '800' }}>Cancel Matrix Reset</Text></Pressable>}
            </View>
          </View>
        )}

        {/* 4-DIGIT PIN ENTRY BLOCK ENCLOSURE */}
        {(authMode === 'PASSCODE_SETUP' || authMode === 'PASSCODE_VERIFY') && (
          <View style={{ backgroundColor: 'rgba(15, 15, 18, 0.85)', borderRadius: 16, borderWidth: 1, borderColor: '#26262b', padding: 24, alignItems: 'center', width: '100%' }}>
            <Text style={{ color: '#00ffcc', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 14, textAlign: 'center' }}>
              {authMode === 'PASSCODE_SETUP' ? "REGISTER SYSTEM QUICK ENTRY PIN" : "ENTER SECURE PIN TRANSLATION KEY"}
            </Text>
            <TextInput
              secureTextEntry maxLength={4} keyboardType="number-pad" placeholder="••••" placeholderTextColor="#52525b"
              value={passcode} onChangeText={setPasscode}
              style={{ color: '#00ffcc', fontSize: 26, letterSpacing: 10, textAlign: 'center', width: '70%', height: 48, backgroundColor: '#09090b', borderRadius: 8, borderWidth: 1, borderColor: '#222226', marginBottom: 16 }}
              onSubmitEditing={handleAuth}
            />

            {/* PRIMARY BUTTON: PASSCODE AUTH MODE */}
            <Pressable onPress={handleAuth} disabled={isProcessing} style={({ pressed }) => [styles.cyberTerminalActionButtonCTA, { width: '100%', marginBottom: 16 }, pressed && { opacity: 0.85 }]}>
              {isProcessing ? <ActivityIndicator size="small" color="#00f0ff" /> : <Text style={styles.cyberTerminalActionButtonCTAText}>CONFIRM ACCESS TOKEN</Text>}
            </Pressable>

            {/* ============================================================== */}
            {/* 🟢 ✅ THE CRITICAL FIX: PIN UTILITY RESET SELECTION UTILITIES */}
            {/* ============================================================== */}
            <View style={[styles.cyberAuthTogglesUnifiedFooterRowContainer, { marginTop: 8 }]}>
              <Pressable
                onPress={() => {
                  setAuthMode('PASSCODE_SETUP');
                  setPasscode('');
                  clearMessages();
                  setStatusMessage({ text: "PIN MODE UNLOCKED: Input a new 4-digit code to overwrite parameters.", isError: false });
                }}
                style={styles.touchTargetToggleLink} hitSlop={10}
              >
                <Text style={{ color: '#ffd700', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' }}>Reset Forgotten PIN</Text>
              </Pressable>
              <View style={{ width: 1, height: 12, backgroundColor: '#26262b' }} />
              <Pressable onPress={() => { signOut(auth); setPasscode(''); clearMessages(); }} style={styles.touchTargetToggleLink} hitSlop={10}>
                <Text style={{ color: '#ff0055', fontSize: 12, fontWeight: '900' }}>LOGOUT</Text>
              </Pressable>
            </View>
          </View>
        )}

        {statusMessage.text ? (
          <Text style={{ color: statusMessage.isError ? '#ff0055' : '#39FF14', fontSize: 11, fontWeight: '800', textAlign: 'center', marginTop: 14 }}>
            {statusMessage.text}
          </Text>
        ) : null}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}



// ==============================================================
// 🌟 HYDRATED CORE PROFILE SCREEN WITH LIVE DB PREFERENCES & LOGOUT
// ==============================================================
function ProfileScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const auth = getAuth();
  const currentFirebaseUser = auth.currentUser;

  // Safe fallback to avoid tracking anomalies if profile is null during logout cycles
  const userId = currentFirebaseUser ? currentFirebaseUser.uid : "Admin_ForgetMeNotAI";

  // 📝 REACTIVE PROFILE AND STATS STATES
  const [dbStats, setDbStats] = useState({ totalSignals: "00", omissionsAvoided: "00", clarityIndex: "92%" });
  const [lastTwoSignals, setLastTwoSignals] = useState<string[]>(["Awaiting signal sync...", "No logged matrix tracks."]);

  // 🎛️ PREFERENCE STATE TOGGLES DIRECTLY TIED TO FIRESTORE ENTRIES
  const [calendarSync, setCalendarSync] = useState(true);
  const [messagesSync, setMessagesSync] = useState(true);
  const [placesSync, setPlacesSync] = useState(false);
  const [gentleNudges, setGentleNudges] = useState(true);
  const [signalSensitivity, setSignalSensitivity] = useState(true); // true = Balanced, false = High Sharpness

  // ==============================================================
  // 🧭 REAL-TIME SNAPSHOT LISTENERS FOR PROFILE AND SIGNALS
  // ==============================================================
  useEffect(() => {
    if (!currentFirebaseUser) return;

    // 1️⃣ Listen to user preferences document block
    const userDocRef = doc(db, "users", userId);
    const unsubsUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.preferences) {
          setCalendarSync(data.preferences.calendarSync ?? true);
          setMessagesSync(data.preferences.messagesSync ?? true);
          setPlacesSync(data.preferences.placesSync ?? false);
          setGentleNudges(data.preferences.gentleNudges ?? true);
          setSignalSensitivity(data.preferences.signalSensitivity ?? true);
        }
      }
    });

    // 2️⃣ Listen to analytics data logs to compute statistics and capture messages dynamically
    const analysesQuery = query(
      collection(db, "analyses"),
      where("user_id", "==", "Admin_ForgetMeNotAI"), // Falls back safely to default project telemetry rows
      orderBy("created_at", "desc")
    );

    const unsubsAnalyses = onSnapshot(analysesQuery, (snapshot) => {
      if (!snapshot.empty) {
        const totalCount = snapshot.docs.length;

        // Dynamically parse out titles of the last 2 newest documents
        const pulledTitles: string[] = [];
        snapshot.docs.slice(0, 2).forEach(doc => {
          pulledTitles.push(doc.data().title || doc.data().analysis?.signal || "Context frame event logged.");
        });
        setLastTwoSignals(pulledTitles);

        // Count omissions automatically based on records matching high confidence thresholds
        let avoidedCount = 0;
        snapshot.docs.forEach(doc => {
          if ((doc.data().analysis?.confidence || 85) > 88) avoidedCount++;
        });

        setDbStats({
          totalSignals: totalCount < 10 ? `0${totalCount}` : `${totalCount}`,
          omissionsAvoided: avoidedCount < 10 ? `0${avoidedCount}` : `${avoidedCount}`,
          clarityIndex: totalCount > 0 ? "94%" : "92%"
        });
      }
    });

    return () => {
      unsubsUser();
      unsubsAnalyses();
    };
  }, [userId]);

  // ==============================================================
  // 💾 FIRESTORE UPDATE PIPELINES
  // ==============================================================
  const updatePreferenceInCloud = async (key: string, newValue: boolean) => {
    if (typeof tap === 'function') tap();
    if (!currentFirebaseUser) return;
    try {
      await setDoc(doc(db, "users", userId), {
        preferences: {
          calendarSync: key === 'calendar' ? newValue : calendarSync,
          messagesSync: key === 'messages' ? newValue : messagesSync,
          placesSync: key === 'places' ? newValue : placesSync,
          gentleNudges: key === 'nudges' ? newValue : gentleNudges,
          signalSensitivity: key === 'sensitivity' ? newValue : signalSensitivity
        }
      }, { merge: true });
    } catch (e) {
      console.error("💥 Error syncing preference updates to cloud dictionary:", e);
    }
  };

  // ==============================================================
  // 🔓 DISCONNECT RUNTIME SESSION LOGOUT METHOD
  // ==============================================================
  const executeSessionSignOut = async () => {
    if (typeof tap === 'function') tap();
    try {
      console.log("🔒 Identity context terminating... Disconnecting auth matrices.");
      await signOut(auth);

      // ✅ CRITICAL DIRECT FIX: Triggers parent router state setter loop to clear out the canvas
      // This immediately forces the app view tree back down to your LoginGate portal
      onNavigate('home');
    } catch (error) {
      alert("Sign out sequence interrupted.");
    }
  };
  return (
    <View style={styles.screen}>
      <ScreenHeader title="Your space" subtitle={currentFirebaseUser?.email || "The person behind the patterns"} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.innerScroll}>

        {/* PROFILE PROFILE HERO CARD DOCK CONTAINER */}
        <View style={styles.profileHero}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>A</Text>
            <View style={styles.profileSpark}><Feather name="zap" size={11} color={theme.background} /></View>
          </View>
          <Text style={styles.profileName}>Alex Morgan</Text>
          <Text style={styles.profileHandle}>THE SIGNAL SEEKER · ACTIVE PROFILE</Text>
        </View>

        {/* METRICS DISCOVERY SECTION ROW */}
        <View style={styles.profileStats}>
          <View>
            <Text style={styles.profileStatValue}>{dbStats.totalSignals}</Text>
            <Text style={styles.profileStatLabel}>signals held</Text>
          </View>
          <View style={styles.statDivider} />
          <View>
            <Text style={styles.profileStatValue}>{dbStats.omissionsAvoided}</Text>
            <Text style={styles.profileStatLabel}>omissions avoided</Text>
          </View>
          <View style={styles.statDivider} />
          <View>
            <Text style={styles.profileStatValue}>{dbStats.clarityIndex}</Text>
            <Text style={styles.profileStatLabel}>signal clarity</Text>
          </View>
        </View>

        {/* CONNECTIONS SUMMARY CARD BOX MATRIX */}
        <SectionTitle eyebrow="CONNECTIONS" title="What I can see" />
        <View style={styles.settingCard}>
          {/* Calendar Sync Toggle Row */}
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}><Feather name="calendar" size={17} color={theme.cyan} /></View>
            <View style={styles.settingCopy}><Text style={styles.settingTitle}>Calendar</Text><Text style={styles.settingDetail}>Your events and movement logs</Text></View>
            <Pressable onPress={() => { setCalendarSync(!calendarSync); updatePreferenceInCloud('calendar', !calendarSync); }} style={[styles.toggle, calendarSync && styles.toggleOn]}><View style={[styles.toggleKnob, calendarSync && styles.toggleKnobOn]} /></Pressable>
          </View>

          {/* Messages Sync Toggle Row (Displays Last 2 DB entries dynamically inside detail panel copy) */}
          <View style={[styles.settingRow, { minHeight: 92, paddingVertical: 14, alignItems: 'flex-start' }]}>
            <View style={[styles.settingIcon, { marginTop: 2 }]}><Feather name="message-square" size={17} color={theme.pink} /></View>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>Messages (Last 2 Live Signals)</Text>
              {lastTwoSignals.map((signalText, index) => (
                <Text key={index} style={[styles.settingDetail, { color: '#a1a1aa', fontSize: 11, fontStyle: 'italic', marginTop: 4, paddingRight: 6 }]} numberOfLines={1}>
                  • {signalText}
                </Text>
              ))}
            </View>
            <Pressable onPress={() => { setMessagesSync(!messagesSync); updatePreferenceInCloud('messages', !messagesSync); }} style={[styles.toggle, messagesSync && styles.toggleOn]}><View style={[styles.toggleKnob, messagesSync && styles.toggleKnobOn]} /></Pressable>
          </View>

          {/* Places Sync Toggle Row */}
          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingIcon}><Feather name="map-pin" size={17} color={theme.cyan} /></View>
            <View style={styles.settingCopy}><Text style={styles.settingTitle}>Places</Text><Text style={styles.settingDetail}>The localized contextual parameters around you</Text></View>
            <Pressable onPress={() => { setPlacesSync(!placesSync); updatePreferenceInCloud('places', !placesSync); }} style={[styles.toggle, placesSync && styles.toggleOn]}><View style={[styles.toggleKnob, placesSync && styles.toggleKnobOn]} /></Pressable>
          </View>
        </View>

        {/* CUSTOM INTERACTIVE PREFERENCES SETTINGS BLOCK MATRIX */}
        <SectionTitle eyebrow="PREFERENCES" title="Shape the signal" />
        <View style={styles.settingCard}>
          {/* Gentle Nudges Toggle */}
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: `${theme.gold}12` }]}><Feather name="bell" size={17} color={theme.gold} /></View>
            <View style={styles.settingCopy}><Text style={styles.settingTitle}>Gentle nudges</Text><Text style={styles.settingDetail}>{gentleNudges ? "Only interrupt when it matters" : "Muted perimeter radar check variance alerts"}</Text></View>
            <Pressable onPress={() => { setGentleNudges(!gentleNudges); updatePreferenceInCloud('nudges', !gentleNudges); }} style={[styles.toggle, gentleNudges && styles.toggleOn]}><View style={[styles.toggleKnob, gentleNudges && styles.toggleKnobOn]} /></Pressable>
          </View>

          {/* Signal Sensitivity Toggle */}
          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={[styles.settingIcon, { backgroundColor: `${theme.green}12` }]}><Feather name="sliders" size={17} color={theme.green} /></View>
            <View style={styles.settingCopy}><Text style={styles.settingTitle}>Signal sensitivity</Text><Text style={styles.settingDetail}>{signalSensitivity ? "Balanced · fewer, sharper predictions" : "Maximum tracking · hypersensitive velocity detection"}</Text></View>
            <Pressable onPress={() => { setSignalSensitivity(!signalSensitivity); updatePreferenceInCloud('sensitivity', !signalSensitivity); }} style={[styles.toggle, signalSensitivity && styles.toggleOn]}><View style={[styles.toggleKnob, signalSensitivity && styles.toggleKnobOn]} /></Pressable>
          </View>
        </View>

        {/* HELPDESK CONTACT LINK ROW ACTION */}
        <Pressable onPress={() => { if (typeof tap === 'function') tap(); onNavigate('contact'); }} style={styles.contactLink}>
          <View style={styles.contactCircle}><Feather name="heart" size={17} color={theme.pink} /></View>
          <View style={{ flex: 1 }}><Text style={styles.contactTitle}>Talk to the ForgetMeNot team</Text><Text style={styles.contactDetail}>Questions, ideas, or a signal matrix split we missed?</Text></View>
          <Feather name="arrow-up-right" size={17} color={theme.cyan} />
        </Pressable>

               {/* ============================================================== */}
               {/* 🟢 ✅ FIXED: HIGH-FIDELITY CYBERNETIC LOGOUT BUTTON UPGRADE    */}
               {/* ============================================================== */}
               <View style={{ width: '100%', marginTop: 32, marginBottom: 12 }}>
                 <Pressable
                   onPress={executeSessionSignOut}
                   style={({ pressed }) => [
                     {
                       width: '100%',
                       height: 48,
                       backgroundColor: 'rgba(255, 0, 85, 0.06)', // Deep tech-crimson tinted glow
                       borderRadius: 12,
                       borderWidth: 1.2,
                       borderColor: '#ff0055',                     // Vivid alert edge tracking line
                       flexDirection: 'row',
                       alignItems: 'center',
                       justifyContent: 'center',
                       gap: 8,
                       ...Platform.select({
                         web: {
                           boxShadow: pressed ? 'none' : '0px 0px 14px rgba(255, 0, 85, 0.2)',
                           transition: 'all 0.2s ease',
                         }
                       })
                     },
                     pressed && { backgroundColor: 'rgba(255, 0, 85, 0.18)' }
                   ]}
                 >
                   <Feather name="log-out" size={14} color="#ff0055" />
                   <Text style={{ color: '#ff0055', fontSize: 12, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                     TERMINATE SECURITY SESSION
                   </Text>
                 </Pressable>
               </View>

        <Text style={styles.version}>FORGETMENOT AI · CONTEXT HYDRATED · v0.1.0</Text>
      </ScrollView>
    </View>
  );
}



function ContactScreen({ onBack }: { onBack: () => void }) {
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  return <KeyboardAvoidingView behavior="padding" style={styles.screen}><ScreenHeader title="Talk to us" subtitle="We’re listening for better signals." onBack={onBack} />
    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.innerScroll}>
      <View style={styles.contactHero}><FGlobe size={78} /><Text style={styles.contactHeroTitle}>A good assistant{"\n"}keeps learning.</Text><Text style={styles.contactHeroCopy}>Tell us what ForgetMeNot helped you notice — or what it should have.</Text></View>
            {!sent ? <><View style={styles.contactInputWrap}><Text style={styles.contactInputLabel}>YOUR NOTE</Text><TextInput testID="contact-input" multiline value={message} onChangeText={setMessage} placeholder="I wish ForgetMeNot could…" placeholderTextColor={theme.mutedForeground} style={styles.contactInput} /></View><Pressable testID="send-contact" onPress={() => { if (message.trim()) { tap(); setSent(true); } }} style={[styles.primaryButton, !message.trim() && styles.disabledButton]}><Text style={styles.primaryButtonText}>Send to the team</Text><Feather name="send" size={16} color={theme.background} /></Pressable></> : <View style={styles.sentCard}><View style={styles.sentIcon}><Feather name="check" size={24} color={theme.background} /></View><Text style={styles.sentTitle}>Signal received.</Text><Text style={styles.sentCopy}>Thanks for making the product a little more human. We’ll be in touch soon.</Text><Pressable onPress={onBack} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Back to your space</Text></Pressable></View>}
            <View style={styles.contactDetails}><Text style={styles.contactDetailTitle}>Prefer email?</Text><Text style={styles.contactEmail}>hello@forgetmenot.ai</Text><Text style={styles.contactHours}>Usually replies within one quiet day.</Text></View>
        </ScrollView>
  </KeyboardAvoidingView>;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('home');
  const [captured, setCaptured] = useState<CapturedItem[]>(capturedSeed);
  const navigate = (next: Screen) => setScreen(next);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // ✅ FIXED: Instantiated with the exact matching variable names expected by your content loop checks!
  const [activeSessionUserId, setActiveSessionUserId] = useState<string | null>(null);
  const currentNav = useMemo(() => ['home', 'events', 'capture', 'chat', 'profile'].includes(screen) ? screen : 'home', [screen]) as Screen;
  const secondary = screen === 'prediction' || screen === 'actions' || screen === 'memory' || screen === 'contact';

  const content = (() => {

          // ==============================================================
          // 🔐 FIXED: GUARANTEES PROP INTERPOLATION BINDING AT THE ROOT LEVEL
          // ==============================================================
          if (!activeSessionUserId) {
                return (
                  <LoginGateScreen
                    onAuthComplete={(verifiedUid) => {
                      console.log("🚀 Identity Handshake: Syncing UID token state into active app context.");
                      setActiveSessionUserId(verifiedUid);
                    }}
                  />
                );
              }

    switch (screen) {
      case 'events': return <EventsScreen onNavigate={navigate} />;
      case 'capture': return <CaptureScreen onNavigate={navigate} onCapture={(item) => { setCaptured((items) => [item, ...items]); setScreen('memory'); }} />;
      case 'chat':
        // ✅ Instructs the framework to change view context to 'home' when clicking back
      return <ChatScreen onBack={() => navigate('home')} />;
      case 'profile':
              return (
                <ProfileScreen
                  onNavigate={(targetScreen) => {
                    // If the profile screen redirects to 'home' during logout, wipe the user token state completely!
                    if (targetScreen === 'home') {
                      setActiveSessionUserId(null);
                    }
                    setScreen(targetScreen);
                  }}
                />
              );

      case 'radar':
      case 'prediction': return <PredictionScreen onBack={() => navigate('home')} onNavigate={navigate} />;
      case 'actions': return <ActionsScreen onBack={() => navigate('home')} />;
      case 'memory': return <MemoryScreen onBack={() => navigate('home')} captured={captured} />;
      case 'contact': return <ContactScreen onBack={() => navigate('profile')} />;
      case 'repliesShield': return <RippleShieldWidget onBack={() => navigate('home')} />;
      default: return <HomeScreen onNavigate={navigate} captured={captured} />;
    }
  })();
  return (
     <View style={styles.app}>
       {content}

       {/* Only display the primary navigation panel bar if authenticated and active */}
       {activeSessionUserId  && !secondary ? (
         <BottomNav screen={currentNav} onNavigate={navigate} />
       ) : null}
     </View>
   );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: theme.background },
  screen: {
      flex: 1,
      backgroundColor: '#050506',
      width: '100%',
      height: '100%',
    },
  header: { paddingHorizontal: 20, paddingBottom: 14, backgroundColor: theme.background },
  headerRow: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerCopy: { flex: 1 },
  headerTitle: { color: theme.text, fontSize: 21, fontWeight: '700', letterSpacing: -0.45 },
  headerSubtitle: { color: theme.mutedForeground, fontSize: 12, marginTop: 3 },
  headerSpacer: { width: 34 },
  innerScroll: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 32, // Gives clean breathing room parameters at the layout bottom
    },
  iconButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandName: { color: theme.text, fontSize: 12, fontWeight: '700', letterSpacing: 1.7 },
  fGlobe: { overflow: 'hidden', borderWidth: 1.5, borderColor: theme.pink, alignItems: 'center', justifyContent: 'center', backgroundColor: '#11101A' },
  fMark: { color: theme.text, fontWeight: '700', zIndex: 2, fontStyle: 'italic' },
  orbit: { position: 'absolute', borderWidth: 1, borderColor: `${theme.cyan}B5`, transform: [{ rotate: '-28deg' }] },
  orbitHorizontal: { borderColor: `${theme.green}B5`, transform: [{ rotate: '20deg' }] },
  scrollContent: { paddingHorizontal: 20 },
  innerScroll: { paddingHorizontal: 20, paddingBottom: 120 },
  homeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  miniLabel: { color: theme.cyan, fontSize: 10, fontWeight: '700', letterSpacing: 1.35, marginBottom: 7 },
  greeting: { color: theme.text, fontSize: 25, fontWeight: '700', letterSpacing: -0.8 },
  avatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: `${theme.pink}80`, backgroundColor: `${theme.pink}18`, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: theme.pink, fontSize: 16, fontWeight: '700' },
  heroCard: { minHeight: 296, borderRadius: 24, overflow: 'hidden', marginBottom: 28, borderWidth: 1, borderColor: `${theme.cyan}3D` },
  heroImage: { opacity: 0.76 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#08080B80' },
  heroCopy: { padding: 22, paddingTop: 24, width: '82%', zIndex: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 20 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.green },
  statusText: { color: theme.green, fontSize: 9, fontWeight: '700', letterSpacing: 1.35 },
  heroTitle: { color: theme.text, fontSize: 31, lineHeight: 34, fontWeight: '700', letterSpacing: -1.3 },
  heroBody: { color: '#E4E0E7', fontSize: 13, lineHeight: 19, marginTop: 13, maxWidth: 230 },
  heroCta: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: theme.pink, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 8, marginTop: 18 },
  heroCtaText: { color: theme.background, fontSize: 12, fontWeight: '700' },
  heroOrb: { position: 'absolute', right: 19, bottom: 21 },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12, marginTop: 2 },
  eyebrow: { color: theme.mutedForeground, fontSize: 9, letterSpacing: 1.45, fontWeight: '700', marginBottom: 6 },
  sectionTitle: { color: theme.text, fontSize: 19, fontWeight: '700', letterSpacing: -0.4 },
  textAction: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingBottom: 2 },
  textActionLabel: { color: theme.cyan, fontSize: 11, fontWeight: '600' },
  predictionCard: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 16, padding: 15, marginBottom: 10 },
  pressed: { opacity: 0.78 },
  predictionTop: { flexDirection: 'row', alignItems: 'center' },
  predictionIcon: { width: 39, height: 39, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  predictionHeading: { flex: 1, marginLeft: 11 },
  cardTitle: { color: theme.text, fontSize: 14, fontWeight: '700' },
  cardMeta: { color: theme.mutedForeground, fontSize: 11, marginTop: 4 },
  scoreWrap: { alignItems: 'flex-end' },
  score: { fontSize: 16, fontWeight: '700' },
  scoreLabel: { color: theme.mutedForeground, fontSize: 8, letterSpacing: 1.1, marginTop: 2 },
  cardCopy: { color: '#BDB8C5', fontSize: 12, lineHeight: 18, marginTop: 13 },
  predictionFooter: { borderTopWidth: 1, borderTopColor: theme.border, marginTop: 13, paddingTop: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  predictionHint: { color: theme.mutedForeground, fontSize: 10, fontWeight: '600', letterSpacing: 0.2 },
  smallArrow: { width: 27, height: 27, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  miniPredictionRow: { flexDirection: 'row', gap: 10, marginBottom: 23 },
  miniPrediction: { flex: 1, backgroundColor: theme.card, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: theme.border },
  miniIcon: { width: 31, height: 31, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  miniTitle: { color: theme.text, fontSize: 12, fontWeight: '700' },
  miniScore: { fontSize: 10, marginTop: 5, fontWeight: '600' },
  contextCard: { flexDirection: 'row', padding: 15, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 16, marginBottom: 20 },
  contextTimeline: { width: 17, alignItems: 'center', paddingTop: 5 },
  timelineDot: { width: 7, height: 7, borderRadius: 4 },
  timelineLine: { width: 1, flex: 1, backgroundColor: theme.border, marginVertical: 5 },
  contextItems: { flex: 1, gap: 17 },
  contextItem: { gap: 4 },
  contextTime: { color: theme.mutedForeground, fontSize: 9, letterSpacing: 1.2, fontWeight: '700' },
  contextText: { color: theme.text, fontSize: 12, lineHeight: 16 },
  // ✅ THE HORIZONTAL GRID ENFORCER: Blocks cards from crashing or shifting layout when screens re-mount
    quickRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      gap: 12,
      marginTop: 16,                 // ✅ Streamlined to maintain clean spacing gaps
      marginBottom: 16,
      display: 'flex',
      zIndex: 5,
    },
  quickCard: { flex: 1, backgroundColor: `${theme.green}0D`, borderRadius: 15, borderWidth: 1, borderColor: `${theme.green}35`, padding: 14 },
  quickCardPink: { backgroundColor: `${theme.pink}0D`, borderColor: `${theme.pink}35` },
  quickNumber: { color: theme.text, fontSize: 23, fontWeight: '700', marginTop: 14 },
  quickLabel: { color: theme.mutedForeground, fontSize: 10, marginTop: 3 },
  captureCount: { color: theme.mutedForeground, textAlign: 'center', fontSize: 10, marginTop: 14 },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, minHeight: 72, paddingTop: 10, paddingHorizontal: 7, backgroundColor: '#0C0B10F4', borderTopWidth: 1, borderTopColor: theme.border, flexDirection: 'row', justifyContent: 'space-around' },
  navItem: { alignItems: 'center', justifyContent: 'center', minWidth: 54, gap: 4 },
  navLabel: { color: theme.mutedForeground, fontSize: 9, fontWeight: '600' },
  navLabelActive: { color: theme.pink },
  navIndicator: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.pink, position: 'absolute', top: -2 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, marginBottom: 22 },
  dayCell: { width: 37, height: 59, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 5 },
  dayCellActive: { backgroundColor: theme.pink },
  dayName: { color: theme.mutedForeground, fontSize: 10, fontWeight: '700' },
  dayNameActive: { color: theme.background },
  dayNumber: { color: theme.text, fontSize: 16, fontWeight: '700' },
  dayNumberActive: { color: theme.background },
  dayDot: { width: 4, height: 4, borderRadius: 2 },
  eventIntro: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  dateBig: { color: theme.mutedForeground, fontSize: 10, fontWeight: '700', letterSpacing: 1.25 },
  pill: { borderWidth: 1, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 5 },
  pillDot: { width: 4, height: 4, borderRadius: 2 },
  pillLabel: { fontSize: 8, fontWeight: '700', letterSpacing: 0.9 },
  eventRow: { minHeight: 71, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.border, gap: 12 },
  eventTime: { width: 49, flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  eventTimeText: { color: theme.text, fontSize: 15, fontWeight: '700' },
  eventAm: { color: theme.mutedForeground, fontSize: 8, fontWeight: '700' },
  eventBar: { width: 3, height: 33, borderRadius: 2 },
  eventInfo: { flex: 1 },
  eventTitle: { color: theme.text, fontSize: 14, fontWeight: '600' },
  eventType: { color: theme.mutedForeground, fontSize: 9, letterSpacing: 0.8, marginTop: 5 },
  eventInsight: { marginTop: 22, padding: 14, borderWidth: 1, borderColor: `${theme.gold}45`, backgroundColor: `${theme.gold}0D`, borderRadius: 15, flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  insightIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: `${theme.gold}18`, alignItems: 'center', justifyContent: 'center' },
  insightCopy: { flex: 1 },
  insightLabel: { color: theme.gold, fontSize: 9, letterSpacing: 1.1, fontWeight: '700', marginBottom: 5 },
  insightText: { color: '#D7D1C4', fontSize: 11, lineHeight: 16 },
  eventsNote: { color: theme.mutedForeground, textAlign: 'center', fontSize: 11, lineHeight: 16, marginTop: 26, paddingHorizontal: 20 },
  captureHero: { height: 190, borderRadius: 20, overflow: 'hidden', marginBottom: 18, borderWidth: 1, borderColor: `${theme.pink}40` },
  captureImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  captureImageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#08080B9A' },
  captureHeroCopy: { padding: 18 },
  captureEyebrow: { color: theme.green, fontSize: 9, letterSpacing: 1.4, fontWeight: '700', marginBottom: 10 },
  captureTitle: { color: theme.text, fontSize: 25, lineHeight: 29, fontWeight: '700', letterSpacing: -0.8 },
  captureGlow: { position: 'absolute', right: 23, bottom: 20 },
  captureModeRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  captureMode: { flex: 1, height: 47, borderRadius: 11, borderWidth: 1, borderColor: theme.border, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 },
  captureModeActive: { backgroundColor: theme.cyan, borderColor: theme.cyan },
  captureModeLabel: { color: theme.mutedForeground, fontSize: 11, fontWeight: '700' },
  captureModeLabelActive: { color: theme.background },
  inputWrap: { borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card, borderRadius: 15, padding: 14, minHeight: 182 },
  captureInput: { color: theme.text, fontSize: 17, lineHeight: 25, minHeight: 112, textAlignVertical: 'top' },
  inputHint: { color: theme.mutedForeground, fontSize: 10, lineHeight: 15 },
  mediaCapture: { minHeight: 182, borderRadius: 15, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card, alignItems: 'center', justifyContent: 'center', padding: 24 },
  mediaIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: theme.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  mediaTitle: { color: theme.text, fontSize: 16, fontWeight: '700' },
  mediaCopy: { color: theme.mutedForeground, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 6, maxWidth: 235 },
  mediaAction: { color: theme.cyan, fontSize: 9, fontWeight: '700', letterSpacing: 1.2, marginTop: 14 },
  analysisCard: { backgroundColor: `${theme.cyan}0D`, borderWidth: 1, borderColor: `${theme.cyan}45`, borderRadius: 15, padding: 14, marginTop: 14 },
  analysisHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  analysisBadge: { width: 33, height: 33, borderRadius: 10, backgroundColor: `${theme.cyan}1A`, alignItems: 'center', justifyContent: 'center' },
  analysisHeaderCopy: { flex: 1 },
  analysisEyebrow: { color: theme.cyan, fontSize: 8, letterSpacing: 1.1, fontWeight: '700', marginBottom: 4 },
  analysisTitle: { color: theme.text, fontSize: 13, fontWeight: '700' },
  analysisConfidence: { color: theme.green, fontSize: 16, fontWeight: '700' },
  analysisLabel: { color: theme.mutedForeground, fontSize: 8, letterSpacing: 1.15, fontWeight: '700', marginTop: 16 },
  analysisOmission: { color: theme.text, fontSize: 15, lineHeight: 20, fontWeight: '700', marginTop: 5 },
  analysisExplanation: { color: theme.mutedForeground, fontSize: 11, lineHeight: 16, marginTop: 6 },
  analysisAction: { flexDirection: 'row', alignItems: 'center', gap: 7, borderTopWidth: 1, borderTopColor: `${theme.cyan}30`, marginTop: 12, paddingTop: 10 },
  analysisActionText: { color: theme.green, flex: 1, fontSize: 11, lineHeight: 15, fontWeight: '600' },
  analysisError: { color: theme.destructive, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 11 },
  primaryButton: { height: 51, backgroundColor: theme.pink, borderRadius: 11, marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  primaryButtonText: { color: theme.background, fontSize: 13, fontWeight: '700' },
  disabledButton: { opacity: 0.35 },
  savedText: { color: theme.green, textAlign: 'center', fontSize: 11, lineHeight: 16, marginTop: 13, paddingHorizontal: 14 },
  secondaryLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 19 },
  secondaryLinkText: { color: theme.cyan, fontSize: 11, fontWeight: '600' },
  aiOnline: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: `${theme.green}12`, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6 },
  aiOnlineText: { color: theme.green, fontSize: 8, letterSpacing: 1, fontWeight: '700' },
  chatScroll: { paddingHorizontal: 20, paddingBottom: 20 },
  chatIntro: { alignItems: 'center', paddingVertical: 25 },
  chatIntroTitle: { color: theme.text, fontSize: 22, fontWeight: '700', marginTop: 14, letterSpacing: -0.5 },
  chatIntroCopy: { color: theme.mutedForeground, fontSize: 12, lineHeight: 17, textAlign: 'center', maxWidth: 250, marginTop: 7 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 14 },
  messageRowUser: { justifyContent: 'flex-end' },
  messageAvatar: { width: 29, height: 29, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.card },
  messageBubble: { maxWidth: '79%', padding: 13, borderRadius: 16 },
  aiBubble: { backgroundColor: theme.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: theme.border },
  userBubble: { backgroundColor: theme.pink, borderBottomRightRadius: 4 },
  messageText: { color: theme.text, fontSize: 13, lineHeight: 19 },
  userMessageText: { color: theme.background },
  chatComposer: { paddingHorizontal: 15, paddingTop: 9, borderTopWidth: 1, borderTopColor: theme.border, backgroundColor: '#0C0B10F4', flexDirection: 'row', alignItems: 'center', gap: 9 },
  chatInput: { flex: 1, height: 44, borderRadius: 12, backgroundColor: theme.card, color: theme.text, paddingHorizontal: 14, fontSize: 13, borderWidth: 1, borderColor: theme.border },
  sendButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: theme.cyan, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { opacity: 0.35 },
  profileHero: { alignItems: 'center', paddingTop: 5, paddingBottom: 22 },
  profileAvatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: `${theme.pink}18`, borderWidth: 1, borderColor: theme.pink, alignItems: 'center', justifyContent: 'center' },
  profileAvatarText: { color: theme.pink, fontSize: 34, fontWeight: '700' },
  profileSpark: { position: 'absolute', right: -2, bottom: 3, width: 23, height: 23, borderRadius: 12, backgroundColor: theme.green, alignItems: 'center', justifyContent: 'center' },
  profileName: { color: theme.text, fontSize: 22, fontWeight: '700', marginTop: 13 },
  profileHandle: { color: theme.mutedForeground, fontSize: 9, letterSpacing: 1.1, fontWeight: '700', marginTop: 6 },
  profileStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.border, marginBottom: 25 },
  profileStatValue: { color: theme.text, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  profileStatLabel: { color: theme.mutedForeground, fontSize: 9, marginTop: 4, textAlign: 'center' },
  statDivider: { width: 1, height: 25, backgroundColor: theme.border },
  settingCard: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 15, paddingHorizontal: 14, marginBottom: 24 },
  settingRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.border, gap: 11 },
  settingIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: `${theme.cyan}12`, alignItems: 'center', justifyContent: 'center' },
  settingCopy: { flex: 1 },
  settingTitle: { color: theme.text, fontSize: 13, fontWeight: '600' },
  settingDetail: { color: theme.mutedForeground, fontSize: 10, marginTop: 4 },
  toggle: { width: 37, height: 22, borderRadius: 11, backgroundColor: theme.secondary, padding: 3, justifyContent: 'center' },
  toggleOn: { backgroundColor: theme.green },
  toggleKnob: { width: 16, height: 16, borderRadius: 8, backgroundColor: theme.mutedForeground },
  toggleKnobOn: { alignSelf: 'flex-end', backgroundColor: theme.background },
  contactLink: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 15, borderTopWidth: 1, borderTopColor: theme.border },
  contactCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: `${theme.pink}12`, alignItems: 'center', justifyContent: 'center' },
  contactTitle: { color: theme.text, fontSize: 12, fontWeight: '700' },
  contactDetail: { color: theme.mutedForeground, fontSize: 10, marginTop: 3 },
  version: { color: theme.mutedForeground, fontSize: 9, letterSpacing: 1.1, textAlign: 'center', marginTop: 8 },
  radarSummary: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, marginBottom: 15 },
  radarCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: theme.pink, backgroundColor: `${theme.pink}12`, alignItems: 'center', justifyContent: 'center', marginRight: 20 },
  radarScore: { color: theme.text, fontSize: 30, fontWeight: '700' },
  radarCaption: { color: theme.pink, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  radarSummaryCopy: { flex: 1 },
  radarTitle: { color: theme.text, fontSize: 22, lineHeight: 25, fontWeight: '700', letterSpacing: -0.6 },
  radarBody: { color: theme.mutedForeground, fontSize: 11, lineHeight: 16, marginTop: 8 },
  filterScroll: { marginHorizontal: -20, marginBottom: 18 },
  filterContent: { paddingHorizontal: 20, gap: 8 },
  filter: { borderWidth: 1, borderColor: theme.border, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 8 },
  filterActive: { backgroundColor: theme.cyan, borderColor: theme.cyan },
  filterText: { color: theme.mutedForeground, fontSize: 10, fontWeight: '600' },
  filterTextActive: { color: theme.background },
  predictionFoot: { flexDirection: 'row', gap: 9, padding: 13, backgroundColor: `${theme.green}0C`, borderWidth: 1, borderColor: `${theme.green}30`, borderRadius: 13, marginTop: 4 },
  predictionFootText: { color: theme.mutedForeground, flex: 1, fontSize: 10, lineHeight: 15 },
  actionsIntro: { paddingVertical: 12, marginBottom: 18 },
  actionsKicker: { color: theme.pink, fontSize: 9, letterSpacing: 1.45, fontWeight: '700', marginBottom: 9 },
  actionsTitle: { color: theme.text, fontSize: 29, lineHeight: 32, fontWeight: '700', letterSpacing: -1.1 },
  actionsCopy: { color: theme.mutedForeground, fontSize: 12, lineHeight: 18, marginTop: 10, maxWidth: 290 },
  actionRow: { minHeight: 74, padding: 13, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 11 },
  actionRowDone: { borderColor: `${theme.green}65`, backgroundColor: `${theme.green}0D` },
  actionIcon: { width: 39, height: 39, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionCopy: { flex: 1 },
  actionTitle: { color: theme.text, fontSize: 13, fontWeight: '700' },
  actionTitleDone: { textDecorationLine: 'line-through', color: theme.mutedForeground },
  actionDetail: { color: theme.mutedForeground, fontSize: 10, marginTop: 4 },
  actionCheck: { width: 27, height: 27, borderRadius: 9, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center' },
  actionCheckDone: { backgroundColor: theme.green, borderColor: theme.green },
  donePanel: { padding: 16, borderRadius: 15, backgroundColor: theme.secondary, marginTop: 13 },
  donePanelTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  donePanelTitle: { color: theme.text, fontSize: 12, fontWeight: '700' },
  donePanelPercent: { color: theme.green, fontSize: 12, fontWeight: '700' },
  progressTrack: { height: 5, borderRadius: 3, backgroundColor: theme.border, marginVertical: 12, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: theme.green, borderRadius: 3 },
  donePanelCopy: { color: theme.mutedForeground, fontSize: 10, lineHeight: 15 },
  memoryHero: { height: 175, borderRadius: 19, overflow: 'hidden', borderWidth: 1, borderColor: `${theme.gold}45`, marginBottom: 17 },
  memoryImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  memoryOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#08080B80' },
  memoryHeroCopy: { padding: 18 },
  memoryScore: { color: theme.text, fontSize: 33, fontWeight: '700' },
  memoryScoreLabel: { color: theme.gold, fontSize: 10, letterSpacing: 1, fontWeight: '700', marginTop: 2 },
  memoryGlobe: { position: 'absolute', right: 24, bottom: 24 },
  memoryTabs: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: 11, marginBottom: 22 },
  memoryTab: { color: theme.mutedForeground, fontSize: 11 },
  memoryTabActive: { color: theme.cyan, fontSize: 11, fontWeight: '700' },
  memoryRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.border },
  memoryDot: { width: 8, height: 8, borderRadius: 4 },
  memoryCopy: { flex: 1 },
  memoryTitle: { color: theme.text, fontSize: 13, fontWeight: '600' },
  memoryDetail: { color: theme.mutedForeground, fontSize: 10, marginTop: 4 },
  memoryNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, padding: 13, borderRadius: 13, backgroundColor: `${theme.cyan}0B`, borderWidth: 1, borderColor: `${theme.cyan}2B`, marginTop: 24 },
  memoryNoticeText: { flex: 1, color: theme.mutedForeground, fontSize: 10, lineHeight: 15 },
  contactHero: { paddingVertical: 14, alignItems: 'flex-start' },
  contactHeroTitle: { color: theme.text, fontSize: 29, lineHeight: 32, fontWeight: '700', letterSpacing: -1, marginTop: 17 },
  contactHeroCopy: { color: theme.mutedForeground, fontSize: 12, lineHeight: 18, marginTop: 9, maxWidth: 300 },
  contactInputWrap: { minHeight: 190, borderRadius: 15, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 14, marginTop: 18 },
  contactInputLabel: { color: theme.pink, fontSize: 9, fontWeight: '700', letterSpacing: 1.2, marginBottom: 12 },
  contactInput: { flex: 1, minHeight: 135, color: theme.text, fontSize: 16, lineHeight: 23, textAlignVertical: 'top' },
  sentCard: { alignItems: 'center', padding: 25, backgroundColor: theme.card, borderWidth: 1, borderColor: `${theme.green}45`, borderRadius: 17, marginTop: 22 },
  sentIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: theme.green, alignItems: 'center', justifyContent: 'center' },
  sentTitle: { color: theme.text, fontSize: 21, fontWeight: '700', marginTop: 15 },
  sentCopy: { color: theme.mutedForeground, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 7 },
  secondaryButton: { marginTop: 20, borderWidth: 1, borderColor: theme.border, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 15 },
  secondaryButtonText: { color: theme.cyan, fontSize: 11, fontWeight: '700' },
  contactDetails: { borderTopWidth: 1, borderTopColor: theme.border, marginTop: 29, paddingTop: 19 },
  contactDetailTitle: { color: theme.mutedForeground, fontSize: 10, letterSpacing: 1, fontWeight: '700' },
  contactEmail: { color: theme.cyan, fontSize: 15, fontWeight: '700', marginTop: 8 },
  contactHours: { color: theme.mutedForeground, fontSize: 10, marginTop: 5 },
  // 🎨 Update your StyleSheet entries for the PredictionCard component:
  predictionCard: {
    backgroundColor: '#16161a',       // 👈 FIXED: Lighter dark grey card surface (was blending into black)
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#26262b',           // Clean subtle boundary border
  },
  cardTitleText: {
    color: '#ffffff',                 // 👈 FIXED: Force solid white title text
    fontSize: 17,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 4,
  },
  cardDetailText: {
    color: '#a1a1aa',                 // 👈 FIXED: High contrast light slate description text
    fontSize: 13,
    lineHeight: 18,
  },
  cardProbabilityText: {
    color: '#00ffcc',                 // 👈 FIXED: Neon cyan highlight for probability index
    fontSize: 12,
    fontWeight: '800',
  },
  emptyViewBox: {
    backgroundColor: '#16161a',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#26262b',
  },
  emptyViewText: {
    color: '#a1a1aa',                 // Visible light text for empty states
    fontSize: 13,
    textAlign: 'center',
  },
// 1. In your HomeScreen styles:
innerScroll: {
  paddingHorizontal: 16,
  paddingTop: 8,
  paddingBottom: 24, // 👈 Reduced from high padding down to 24px
},

// 2. In your PredictiveLoopWidget.tsx styles:
container: {
  alignItems: 'center',
  justifyContent: 'center',
  marginVertical: 4,  // 👈 Reduced from 14px to tighten top/bottom spacing
},
quickCardWrapper: {
  borderRadius: 14,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '#1c1c1f',
  marginVertical: 8,              // ✅ Tightened to reduce down space gaps
},
quickCardBackground: {
  width: '100%',
  minHeight: 120,
},
quickCardImageRadius: {
  borderRadius: 13,
},
quickCardScrimOverlay: {
  flex: 1,
  backgroundColor: 'rgba(5, 5, 6, 0.78)', // Heavy contrast dark vignette filter mask
  padding: 16,
  justifyContent: 'center',
},
quickCardHeaderRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
},
badgeIndicatorPill: {
  backgroundColor: 'rgba(0, 255, 204, 0.08)',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: 'rgba(0, 255, 204, 0.25)',
},
badgeIndicatorPillText: {
  color: '#00ffcc',               // Glowing cyber emerald count text weights
  fontSize: 10,
  fontWeight: '900',
  letterSpacing: 1.2,
},
quickCardMainTitle: {
  color: '#ffffff',
  fontSize: 18,
  fontWeight: '800',
  marginBottom: 4,
},
quickCardSubCopy: {
  color: '#8a8f98',
  fontSize: 12,
  lineHeight: 16,
},
quickChatCardWrapper: {
  borderRadius: 14,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '#1c1c1f',
  marginVertical: 6,                 // ✅ Tightened up to align with your vertical layouts
},
quickChatCardBackground: {
  width: '100%',
  minHeight: 110,
},
quickChatCardImageRadius: {
  borderRadius: 13,
},
quickChatCardScrimOverlay: {
  flex: 1,
  backgroundColor: 'rgba(5, 5, 6, 0.82)', // Heavy matte overlay ensures white and pink text stands out
  padding: 16,
  justifyContent: 'center',
},
quickChatHeaderRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 10,
},
chatActionIconCircleBadge: {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: 'rgba(255, 0, 127, 0.08)', // Faded cyber pink highlight core bubble
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: 'rgba(255, 0, 127, 0.2)',
},
quickChatMainTitleText: {
  color: '#ffffff',
  fontSize: 18,
  fontWeight: '800',
  marginBottom: 2,
},
quickChatSubLabelText: {
  color: '#8a8f98',
  fontSize: 12,
  fontWeight: '500',
},
// Add this property directly inside your StyleSheet.create block:
imageLastHalfFocus: {
  // ✅ Shifts the positioning context up by 50% to extract only the last half frame
  top: '-50%',
  height: '200%',
  position: 'absolute',
},


  // ✅ CARD 1 CONTAINER: Expands equally across the horizontal line
  quickCardWrapper: {
    flex: 1,                    // 👈 Mandated: splits row width evenly
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1c1c1f',
  },

  // ✅ CARD 2 CONTAINER: Expands equally across the horizontal line
  quickChatCardWrapper: {
    flex: 1,                    // 👈 Mandated: splits row width evenly
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1c1c1f',
  },

  // ✅ BACKGROUND CONFIGS: Forces uniform proportions for both image spaces
  quickCardBackground: {
    width: '100%',
    minHeight: 130,             // Controls identical height layout tracking bounds
  },
  quickChatCardBackground: {
    width: '100%',
    minHeight: 130,             // Controls identical height layout tracking bounds
  },

  quickCardImageRadius: {
    borderRadius: 13,
  },
  quickChatCardImageRadius: {
    borderRadius: 13,
  },

  // CROPPING OFFSET VECTOR: Focuses your specified background resource on its lower section
  imageLastHalfFocus: {
    top: '-50%',
    height: '200%',
    position: 'absolute',
  },

  // METADATA SCRIM OVERLAYS: Protects text contrast visibility
  quickCardScrimOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 6, 0.76)',
    padding: 14,
    justifyContent: 'space-between', // Pushes headers up and text titles down cleanly
  },
  quickChatCardScrimOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 6, 0.80)',
    padding: 14,
    justifyContent: 'space-between', // Pushes headers up and text titles down cleanly
  },

  // INTERIOR TYPOGRAPHY ELEMENTS RULES
  quickCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickChatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeIndicatorPill: {
    backgroundColor: 'rgba(0, 255, 204, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 204, 0.25)',
  },
  badgeIndicatorPillText: {
    color: '#00ffcc',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  chatActionIconCircleBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 0, 127, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 127, 0.2)',
  },
  quickCardMainTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  quickCardSubCopy: {
    color: '#8a8f98',
    fontSize: 11,
    lineHeight: 14,
  },
  quickChatMainTitleText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  quickChatSubLabelText: {
    color: '#8a8f98',
    fontSize: 11,
    lineHeight: 14,
  },
// ✅ THE CRITICAL DIRECT FIX: Lock down a solid baseline height constraint
  cardContainer: {
    width: '100%',
    height: 184,                    // 👈 Forces an explicit pixel layout boundary height box
    backgroundColor: '#121214',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1c1c1f',
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 8,
  },

// ✅ INNER LAYOUT ALIGNMENT: Ensures elements fill the locked container box perfectly
  splitLayoutRow: {
    flexDirection: 'row',
    width: '100%',
    height: 144,                    // 👈 Gives your internal left/right columns explicit height bounds
  },

// ✅ FOOTER POSITION ALIGNMENT: Hard-anchors your action line to the bottom of your locked height box
  footerActionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,                     // 👈 Locks the bottom control row properties down safely
    borderTopWidth: 1,
    borderColor: '#1c1c1f',
    backgroundColor: '#16161a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

// Update or merge these parameters inside your master styles block:
quickRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
  gap: 12,
  marginVertical: 14,             // Breathing room separator metrics
  display: 'flex',
  zIndex: 5,
},
quickCardWrapper: {
  flex: 1,                        // Splits horizontal row width evenly 50/50
  borderRadius: 14,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '#1c1c1f',
},
quickChatCardWrapper: {
  flex: 1,                        // Splits horizontal row width evenly 50/50
  borderRadius: 14,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '#1c1c1f',
},
quickCardBackground: {
  width: '100%',
  minHeight: 130,                 // Explicit uniform height tracking constraint parameters
},
quickCardImageRadius: {
  borderRadius: 13,
},
quickChatCardImageRadius: {
  borderRadius: 13,
},
imageLastHalfFocus: {
  top: '-50%',
  height: '200%',
  position: 'absolute',
},
quickCardScrimOverlay: {
  flex: 1,
  backgroundColor: 'rgba(5, 5, 6, 0.76)',
  padding: 14,
  justifyContent: 'space-between',
},
quickChatCardScrimOverlay: {
  flex: 1,
  backgroundColor: 'rgba(5, 5, 6, 0.80)',
  padding: 14,
  justifyContent: 'space-between',
},

// 🎨 ✅ THE COMPLETE DEEP-SPACE LOGIN HUD BACKGROUND STYLES
// Append these properties cleanly right inside your existing styles object:

  cyberAuthScreenContainer: {
    flex: 1,
    backgroundColor: '#050507',     // Immersive deep space black void base canvas
    width: '100%',
    height: '100%',
  },
  cosmicStarFieldGridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1000,
  },
  stellarDustParticle: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#ffffff',     // Crisp white space particle dots
    borderRadius: 1,
    opacity: 0.45,
  },
  cyberSpaceshipOrbPink: {
    position: 'absolute',
    top: '15%',
    right: 40,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ff007f',     // Glowing neon pink spaceship vector orb
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 0px 14px #ff007f' }
    }),
  },
  spaceshipThrusterTailBeamPink: {
    position: 'absolute',
    bottom: -15,
    width: 2,
    height: 15,
    backgroundColor: 'rgba(255, 0, 127, 0.4)', // Kinetic propulsion trailing ray line
  },
  cyberSpaceshipOrbGreen: {
    position: 'absolute',
    bottom: '22%',
    left: 50,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#39FF14',     // Fluorescent green secondary automated drone
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 0px 10px #39FF14' }
    }),
  },
  spaceshipThrusterTailBeamGreen: {
    position: 'absolute',
    left: -12,
    width: 12,
    height: 1.5,
    backgroundColor: 'rgba(57, 255, 20, 0.35)',
  },
  robotInternalPilotOrb: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ffffff',
    backgroundColor: '#0c0c0e',     // Mechanical robot pilot core
  },
  hudMasterInnovativeLogoRingWrapper: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  hudLogoPulseOuterRadarCircle: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 127, 0.25)',
    borderStyle: 'dashed',          // Circular layout radar overlay
  },
  cyberGlassmorphicInputsCardContainer: {
    backgroundColor: 'rgba(22, 22, 26, 0.45)', // Premium dark translucent glass cockpit filter mask
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f1f24',
    padding: 20,
    display: 'flex',
  },
  cyberAnimatedInputWrapperField: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#09090b',
    paddingHorizontal: 14,
  },
  cyberTerminalTextInputElement: {
    flex: 1,
    height: '100%',
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    ...Platform.select({
      web: { outlineStyle: 'none' } // Suppresses standard chrome/safari focus rings
    }),
  },
  cyberTerminalActionButtonCTA: {
    height: 50,
    backgroundColor: '#00f0ff',       // Clean neon cyan high-contrast action button core
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#00c8ff',
    ...Platform.select({
      web: { boxShadow: '0px 0px 12px rgba(0, 240, 255, 0.3)' }
    }),
  },
  cyberTerminalActionButtonCTAText: {
    color: '#050507',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
// Merge these exact properties inside your existing stylesheet object:
cyberAuthTogglesUnifiedFooterRowContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 12,
  marginTop: 18,
  paddingTop: 14,
  borderTopWidth: 1,
  borderTopColor: 'rgba(255, 255, 255, 0.05)', // Elegant subtle division border line
  width: '100%',
},
touchTargetToggleLink: {
  paddingVertical: 4,
  paddingHorizontal: 6,
},

// ==============================================================
// 🟢 ✅ THE VISIBILITY FIX: EXPANDED SCROLLPAD ZONE BOUNDARIES
// ==============================================================
innerScroll: {
  paddingHorizontal: 20,
  // 👇 CRITICAL RECONCILIATION: Pushes up elements by 120px to unblock things from hiding underneath tabs
  paddingBottom: 140,
  paddingTop: 8,
},



});