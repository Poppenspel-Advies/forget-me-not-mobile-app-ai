import React, { useMemo, useRef, useState, useEffect } from 'react';
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
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useAnalyzeCapture, type CaptureAnalysis } from '@workspace/api-client-react';
import colors from '@/constants/colors';
// Import your newly split layout targets explicitly
import { captureScreenStyles, customAccents } from './CaptureScreen.styles';
import { IntentAnchorWidget } from './IntentAnchorWidget';
import { RippleShieldWidget } from './RippleShieldWidget'; // Adjust the relative path if you saved the widget file in a separate components folder


interface CaptureScreenProps {
  onNavigate: (screen: any) => void;
  onCapture: (item: any) => void;
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
function AnimatedTagChip({ tag, isActive, onPress }: { tag: TagOption; isActive: boolean; onPress: () => void }) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: isActive ? 1.02 : 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [isActive]);

  let iconName: keyof typeof Feather.glyphMap = 'box';
  let activeBg = 'rgba(0, 240, 255, 0.15)';
  let activeBorder = customAccents.cyan;
  let activeColor = customAccents.cyan;

  if (tag === 'People') {
    iconName = 'user';
    activeBg = 'rgba(255, 0, 127, 0.15)';
    activeBorder = customAccents.pink;
    activeColor = customAccents.pink;
  } else if (tag === 'Places') {
    iconName = 'map-pin';
    activeBg = 'rgba(255, 191, 0, 0.15)';
    activeBorder = customAccents.gold;
    activeColor = customAccents.gold;
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
  const insets = useSafeAreaInsets();
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

function PredictionCard({ item, onPress }: { item: (typeof predictions)[number]; onPress: () => void }) {
  return (
    <Pressable testID={`prediction-${item.title}`} onPress={() => { tap(); onPress(); }} style={({ pressed }) => [styles.predictionCard, pressed && styles.pressed]}>
      <View style={styles.predictionTop}>
        <View style={[styles.predictionIcon, { backgroundColor: `${item.color}18` }]}>
          <Feather name={item.icon as keyof typeof Feather.glyphMap} size={19} color={item.color} />
        </View>
        <View style={styles.predictionHeading}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardMeta}>{item.meta}</Text>
        </View>
        <View style={styles.scoreWrap}>
          <Text style={[styles.score, { color: item.color }]}>{item.score}</Text>
          <Text style={styles.scoreLabel}>LIKELY</Text>
        </View>
      </View>
      <Text style={styles.cardCopy}>{item.copy}</Text>
      <View style={styles.predictionFooter}>
        <Text style={styles.predictionHint}>Prevent this omission</Text>
        <View style={[styles.smallArrow, { backgroundColor: item.color }]}>
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
    const [anchorActive, setAnchorActive] = useState(true);
    const [shieldActive, setShieldActive] = useState(true);

    // 🌟 2. ANIMATED GLIDE WRAPPERS: Control entrance sliding offsets upon app startup
    const startUpFade = useRef(new Animated.Value(0)).current;
    const anchorSlideY = useRef(new Animated.Value(40)).current;
    const shieldSlideY = useRef(new Animated.Value(60)).current;

     useEffect(() => {
        // Sequentially cascade widgets upwards into focal layout ranges smoothly
        Animated.parallel([
          Animated.timing(startUpFade, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
          Animated.spring(anchorSlideY, { toValue: 0, tension: 35, friction: 8, useNativeDriver: Platform.OS !== 'web' }),
          Animated.spring(shieldSlideY, { toValue: 0, tension: 30, friction: 8, useNativeDriver: Platform.OS !== 'web' }),
        ]).start();
      }, []);


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

      <SectionTitle eyebrow="AI SIGNALS" title="You might forget…" action="See all" onAction={() => onNavigate('prediction')} />
      <PredictionCard item={predictions[0]} onPress={() => onNavigate('prediction')} />
      <View style={styles.miniPredictionRow}>
        {predictions.slice(1).map((item) => (
          <Pressable key={item.title} onPress={() => { tap(); onNavigate('prediction'); }} style={styles.miniPrediction}>
            <View style={[styles.miniIcon, { backgroundColor: `${item.color}18` }]}>
              <Feather name={item.icon as keyof typeof Feather.glyphMap} size={17} color={item.color} />
            </View>
            <Text style={styles.miniTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={[styles.miniScore, { color: item.color }]}>{item.score} likely</Text>
          </Pressable>
        ))}
      </View>

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

       {/* 🧭 INTENT ANCHOR CONTAINER CONTAINER WITH SLIDE ENTRANCE */}
            {anchorActive && (
              <Animated.View style={{ opacity: startUpFade, transform: [{ translateY: anchorSlideY }] }}>
                <IntentAnchorWidget
                  phrase="Call Dad this weekend"
                  score={23}
                  windowTime="Tonight"
                  onSelectStrategy={() => {
                    // Dismisses the active intention widget instantly on choice confirm selection
                    setAnchorActive(true);
                  }}
                />
              </Animated.View>
            )}


          {/* 🔮 RIPPLE SHIELD CONTAINER CONTAINER WITH TIMED DELAY SLIDE ENTRANCE */}
            {shieldActive && (
              <Animated.View style={{ opacity: startUpFade, transform: [{ translateY: shieldSlideY }] }}>
                <RippleShieldWidget
                  omissionItem="Passport"
                  riskScore={94}
                  onPreventRipple={() => {
                    // 🌟 1. Dismisses the card immediately from your view feed layout
                    setShieldActive(true);
                  }}
                />
              </Animated.View>
            )}



      <View style={styles.quickRow}>
        <Pressable testID="quick-actions" onPress={() => { tap(); onNavigate('actions'); }} style={styles.quickCard}>
          <Feather name="check-square" size={19} color={theme.green} />
          <Text style={styles.quickNumber}>03</Text>
          <Text style={styles.quickLabel}>Actions to prevent</Text>
        </Pressable>
        <Pressable testID="quick-chat" onPress={() => { tap(); onNavigate('chat'); }} style={[styles.quickCard, styles.quickCardPink]}>
          <Feather name="message-circle" size={19} color={theme.pink} />
          <Text style={styles.quickNumber}>Ask</Text>
          <Text style={styles.quickLabel}>Your second brain</Text>
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
  const [analysis, setAnalysis] = useState<CaptureAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState('');
  const [selectedTag, setSelectedTag] = useState<TagOption>('Things');

  const analyzeMutation = useAnalyzeCapture();

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

  const save = () => {
    if (!analysis) {
      if (mode === 'note' && !text.trim()) return;
      tap();
      setAnalysisError('');
      analyzeMutation.mutate(
        { data: { content: captureContent, source: mode, contextTag: selectedTag.toLowerCase() } },
        {
          onSuccess: (result) => {
            setAnalysis(result);

            // ✅ FIX: Extract category from Gemini response safely
            const incoming = result?.category?.toLowerCase();

            if (incoming === 'people' || incoming === 'personal') {
              setSelectedTag('People');
            } else if (incoming === 'places' || incoming === 'travel') {
              setSelectedTag('Places');
            } else if (incoming === 'things') {
              setSelectedTag('Things');
            } else {
              // ✅ CRITICAL FIX: If Gemini's response is undefined/unrecognized,
              // PRESERVE the tag the user already tapped instead of forcing 'Things'
              setSelectedTag(selectedTag);
            }
          },
          onError: () => setAnalysisError('I could not reach Gemini. Check the API server and try again.'),
        },
      );
      return;
    }

    tap();

    // Assign color layouts based on selected categories
    const activeColor = selectedTag === 'People'
      ? customAccents.pink
      : selectedTag === 'Places'
        ? customAccents.gold
        : customAccents.cyan;

    onCapture({
      id: Date.now().toString(),
      title: analysis.signal || text.trim() || `New ${selectedTag} Context`,
      detail: `${analysis.likelyOmission || 'Context entry logged'} · ${analysis.confidence || 95}% likely`,

      // ✅ FIX: Safely passes down the user's manual choice or corrected response string
      tag: selectedTag.toUpperCase(),
      color: activeColor,
      likelyOmission: analysis.likelyOmission || 'Context entry logged',
      confidence: analysis.confidence || 95,
    });

    setSaved(true);
    setText('');
    setAnalysis(null);
  };


  return (
    <KeyboardAvoidingView behavior="padding" style={styles.screen}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.innerScroll}>

        {/* --- HERO HEADER BANNER --- */}
        <View style={styles.captureHero}>
          <Image source={{ uri: 'https://unsplash.com' }} style={styles.captureImage} />
          <View style={styles.captureImageOverlay} />
          <View style={styles.captureHeroCopy}>
            <Text style={styles.captureEyebrow}>A LITTLE SOMETHING</Text>
            <Text style={styles.captureTitle}>What should your future self know?</Text>
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
              />
            ))}
          </View>
        </View>

        {/* --- INPUT MODE SELECTION ROW --- */}
        <View style={styles.captureModeRow}>
          {([['note', 'edit-3', 'Note'], ['photo', 'camera', 'Photo'], ['voice', 'mic', 'Voice']] as const).map(([id, icon, label]) => (
            <Pressable key={id} onPress={() => { tap(); setMode(id); setAnalysis(null); setAnalysisError(''); }} style={[styles.captureMode, mode === id && styles.captureModeActive]}>
              <Feather name={icon} size={16} color={mode === id ? theme.background : '#A3A3A3'} />
              <Text style={[styles.captureModeLabel, mode === id && styles.captureModeLabelActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {/* --- INTERACTIVE ACTION FORM VIEWS --- */}
                {mode === 'note' ? (
                  // ✅ RESTORED: Standard Text Input fields block
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
                  // ✅ RESTORED: Styled Media Camera & Audio Record interface block
                  <Pressable onPress={() => { tap(); setSaved(true); }} style={styles.mediaCapture}>
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

        {/* ✅ FIX: Integrated Gemini Read-out analytics diagnostic card view dashboard layout */}
        {analysis ? (
          <View style={styles.analysisCard}>
            <View style={styles.analysisHeader}>
              <View style={styles.analysisBadge}><Feather name="star" size={15} color={theme.cyan || customAccents.cyan} /></View>
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
        <Pressable onPress={save} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>
            {analyzeMutation.isPending ? 'Reading your signal…' : analysis ? 'Save to my signal map' : 'Analyze with Gemini'}
          </Text>
          <Feather name="arrow-up-right" size={16} color={theme.background} />
        </Pressable>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}


function ChatScreen() {
  const [messages, setMessages] = useState([{ id: '1', from: 'ai', text: 'I’m looking between the lines. What’s on your mind?' }]);
  const [text, setText] = useState('');
  const send = () => {
    if (!text.trim()) return;
    tap();
    const userText = text.trim();
    setMessages((current) => [...current, { id: Date.now().toString(), from: 'user', text: userText }, { id: `${Date.now()}-ai`, from: 'ai', text: 'I’ll hold onto that. I’m checking it against your upcoming days and the context you’ve shared.' }]);
    setText('');
  };
  return (
    <KeyboardAvoidingView behavior="padding" style={styles.screen}>
      <ScreenHeader title="Talk it through" subtitle="Your second brain, without the noise." right={<View style={styles.aiOnline}><View style={styles.liveDot} /><Text style={styles.aiOnlineText}>ONLINE</Text></View>} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.chatScroll}>
        <View style={styles.chatIntro}><FGlobe size={84} /><Text style={styles.chatIntroTitle}>A thought is a signal.</Text><Text style={styles.chatIntroCopy}>Ask me what you might be missing, or leave a thought here for later.</Text></View>
        {messages.map((message) => (
          <View key={message.id} style={[styles.messageRow, message.from === 'user' && styles.messageRowUser]}>
            {message.from === 'ai' ? <View style={styles.messageAvatar}><FGlobe size={26} /></View> : null}
            <View style={[styles.messageBubble, message.from === 'user' ? styles.userBubble : styles.aiBubble]}><Text style={[styles.messageText, message.from === 'user' && styles.userMessageText]}>{message.text}</Text></View>
          </View>
        ))}
      </ScrollView>
      <View style={[styles.chatComposer, { paddingBottom: Platform.OS === 'web' ? 34 : 10 }]}>
        <TextInput testID="chat-input" value={text} onChangeText={setText} onSubmitEditing={send} returnKeyType="send" placeholder="Tell me a thought…" placeholderTextColor={theme.mutedForeground} style={styles.chatInput} />
        <Pressable testID="send-message" onPress={send} style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}><Feather name="arrow-up" size={18} color={theme.background} /></Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function ProfileScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [connected, setConnected] = useState(true);
  return (
    <View style={styles.screen}>
      <ScreenHeader title="Your space" subtitle="The person behind the patterns" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.innerScroll}>
        <View style={styles.profileHero}><View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>A</Text><View style={styles.profileSpark}><Feather name="zap" size={11} color={theme.background} /></View></View><Text style={styles.profileName}>Alex Morgan</Text><Text style={styles.profileHandle}>THE SIGNAL SEEKER · SINCE 2026</Text></View>
        <View style={styles.profileStats}><View><Text style={styles.profileStatValue}>142</Text><Text style={styles.profileStatLabel}>signals held</Text></View><View style={styles.statDivider} /><View><Text style={styles.profileStatValue}>18</Text><Text style={styles.profileStatLabel}>omissions avoided</Text></View><View style={styles.statDivider} /><View><Text style={styles.profileStatValue}>92%</Text><Text style={styles.profileStatLabel}>signal clarity</Text></View></View>
        <SectionTitle eyebrow="CONNECTIONS" title="What I can see" />
        <View style={styles.settingCard}>
          {[['calendar', 'Calendar', 'Your events and movement', true], ['message-square', 'Messages', 'People and promises', connected], ['map-pin', 'Places', 'The context around you', false]].map(([icon, title, detail, value]) => (
            <View key={title as string} style={styles.settingRow}><View style={styles.settingIcon}><Feather name={icon as keyof typeof Feather.glyphMap} size={17} color={title === 'Messages' ? theme.pink : theme.cyan} /></View><View style={styles.settingCopy}><Text style={styles.settingTitle}>{title as string}</Text><Text style={styles.settingDetail}>{detail as string}</Text></View><Pressable onPress={() => { tap(); setConnected(!connected); }} style={[styles.toggle, value && styles.toggleOn]}><View style={[styles.toggleKnob, value && styles.toggleKnobOn]} /></Pressable></View>
          ))}
        </View>
        <SectionTitle eyebrow="PREFERENCES" title="Shape the signal" />
        <View style={styles.settingCard}>
          <View style={styles.settingRow}><View style={[styles.settingIcon, { backgroundColor: `${theme.gold}12` }]}><Feather name="bell" size={17} color={theme.gold} /></View><View style={styles.settingCopy}><Text style={styles.settingTitle}>Gentle nudges</Text><Text style={styles.settingDetail}>Only interrupt when it matters</Text></View><Feather name="chevron-right" size={17} color={theme.mutedForeground} /></View>
          <View style={styles.settingRow}><View style={[styles.settingIcon, { backgroundColor: `${theme.green}12` }]}><Feather name="sliders" size={17} color={theme.green} /></View><View style={styles.settingCopy}><Text style={styles.settingTitle}>Signal sensitivity</Text><Text style={styles.settingDetail}>Balanced · fewer, sharper predictions</Text></View><Feather name="chevron-right" size={17} color={theme.mutedForeground} /></View>
        </View>
        <Pressable onPress={() => { tap(); onNavigate('contact'); }} style={styles.contactLink}><View style={styles.contactCircle}><Feather name="heart" size={17} color={theme.pink} /></View><View><Text style={styles.contactTitle}>Talk to the ForgetMeNot team</Text><Text style={styles.contactDetail}>Questions, ideas, or a signal we missed?</Text></View><Feather name="arrow-up-right" size={17} color={theme.cyan} /></Pressable>
        <Text style={styles.version}>FORGETMENOT AI · v0.1.0</Text>
      </ScrollView>
    </View>
  );
}

function PredictionScreen({ onBack, onNavigate }: { onBack: () => void; onNavigate: (screen: Screen) => void }) {
  const [filter, setFilter] = useState('All signals');
  return (
    <View style={styles.screen}><ScreenHeader title="Omission radar" subtitle="The things hiding in plain sight" onBack={onBack} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.innerScroll}>
        <View style={styles.radarSummary}><View style={styles.radarCircle}><Text style={styles.radarScore}>03</Text><Text style={styles.radarCaption}>signals</Text></View><View style={styles.radarSummaryCopy}><Text style={styles.radarTitle}>A clear day,{"\n"}with a few edges.</Text><Text style={styles.radarBody}>These are not reminders. They’re possibilities worth making visible.</Text></View></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>{['All signals', 'Today', 'Personal', 'Practical'].map((item) => <Pressable key={item} onPress={() => { tap(); setFilter(item); }} style={[styles.filter, filter === item && styles.filterActive]}><Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text></Pressable>)}</ScrollView>
        {predictions.map((item) => <PredictionCard item={item} key={item.title} onPress={() => onNavigate('actions')} />)}
        <View style={styles.predictionFoot}><Feather name="shield" size={18} color={theme.green} /><Text style={styles.predictionFootText}>Your predictions stay private and get sharper with your feedback.</Text></View>
      </ScrollView>
    </View>
  );
}

function ActionsScreen({ onBack }: { onBack: () => void }) {
  const [done, setDone] = useState<string[]>([]);
  const actions = [
    { id: 'train', title: 'Put your travel card by the door', detail: 'For tomorrow’s early train', color: theme.gold, icon: 'sunrise' },
    { id: 'lens', title: 'Add a return note for the lens', detail: 'Before Saturday afternoon', color: theme.cyan, icon: 'package' },
    { id: 'dad', title: 'Start a Sunday call thread', detail: 'Your usual check-in is coming up', color: theme.pink, icon: 'heart' },
  ];
  return <View style={styles.screen}><ScreenHeader title="Prevent the omission" subtitle="Tiny actions. Better future-you." onBack={onBack} />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.innerScroll}>
      <View style={styles.actionsIntro}><Text style={styles.actionsKicker}>THE LAST MILE</Text><Text style={styles.actionsTitle}>Make the invisible{"\n"}easy to handle.</Text><Text style={styles.actionsCopy}>A prediction only helps when it becomes a small, kind action.</Text></View>
      {actions.map((action) => { const completed = done.includes(action.id); return <Pressable key={action.id} onPress={() => { tap(); setDone((current) => completed ? current.filter((id) => id !== action.id) : [...current, action.id]); }} style={[styles.actionRow, completed && styles.actionRowDone]}><View style={[styles.actionIcon, { backgroundColor: `${action.color}18` }]}><Feather name={action.icon as keyof typeof Feather.glyphMap} size={20} color={action.color} /></View><View style={styles.actionCopy}><Text style={[styles.actionTitle, completed && styles.actionTitleDone]}>{action.title}</Text><Text style={styles.actionDetail}>{action.detail}</Text></View><View style={[styles.actionCheck, completed && styles.actionCheckDone]}>{completed ? <Feather name="check" size={15} color={theme.background} /> : <Feather name="plus" size={16} color={theme.mutedForeground} />}</View></Pressable>; })}
      <View style={styles.donePanel}><View style={styles.donePanelTop}><Text style={styles.donePanelTitle}>{done.length}/3 made visible</Text><Text style={styles.donePanelPercent}>{Math.round((done.length / 3) * 100)}%</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${(done.length / 3) * 100}%` }]} /></View><Text style={styles.donePanelCopy}>{done.length === 3 ? 'Nothing hiding today. Nice work.' : 'No pressure. One small action is enough to change the shape of a day.'}</Text></View>
    </ScrollView>
  </View>;
}

function MemoryScreen({ onBack, captured }: { onBack: () => void; captured: CapturedItem[] }) {
  return <View style={styles.screen}><ScreenHeader title="Signal map" subtitle="Everything you’ve let me notice" onBack={onBack} />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.innerScroll}>
      <View style={styles.memoryHero}><Image source={require('@/assets/images/memory-orb.jpg')} style={styles.memoryImage} /><View style={styles.memoryOverlay} /><View style={styles.memoryHeroCopy}><Text style={styles.memoryScore}>142</Text><Text style={styles.memoryScoreLabel}>signals in your orbit</Text></View><View style={styles.memoryGlobe}><FGlobe size={58} /></View></View>
      <View style={styles.memoryTabs}><Text style={styles.memoryTabActive}>All signals</Text><Text style={styles.memoryTab}>People</Text><Text style={styles.memoryTab}>Places</Text><Text style={styles.memoryTab}>Things</Text></View>
      <SectionTitle eyebrow="JUST NOW" title="Fresh context" action="Capture" />
      {captured.map((item) => <View key={item.id} style={styles.memoryRow}><View style={[styles.memoryDot, { backgroundColor: item.color }]} /><View style={styles.memoryCopy}><Text style={styles.memoryTitle}>{item.title}</Text><Text style={styles.memoryDetail}>{item.detail}</Text></View><Pill label={item.tag} color={item.color} /></View>)}
      <View style={styles.memoryNotice}><Feather name="lock" size={17} color={theme.cyan} /><Text style={styles.memoryNoticeText}>Your signal map belongs to you. ForgetMeNot doesn’t sell or share your context.</Text></View>
    </ScrollView>
  </View>;
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
  const currentNav = useMemo(() => ['home', 'events', 'capture', 'chat', 'profile'].includes(screen) ? screen : 'home', [screen]) as Screen;
  const secondary = screen === 'prediction' || screen === 'actions' || screen === 'memory' || screen === 'contact';
  const content = (() => {
    switch (screen) {
      case 'events': return <EventsScreen onNavigate={navigate} />;
      case 'capture': return <CaptureScreen onNavigate={navigate} onCapture={(item) => { setCaptured((items) => [item, ...items]); setScreen('memory'); }} />;
      case 'chat': return <ChatScreen />;
      case 'profile': return <ProfileScreen onNavigate={navigate} />;
      case 'prediction': return <PredictionScreen onBack={() => navigate('home')} onNavigate={navigate} />;
      case 'actions': return <ActionsScreen onBack={() => navigate('home')} />;
      case 'memory': return <MemoryScreen onBack={() => navigate('home')} captured={captured} />;
      case 'contact': return <ContactScreen onBack={() => navigate('profile')} />;
      default: return <HomeScreen onNavigate={navigate} captured={captured} />;
    }
  })();
  return <View style={styles.app}>{content}{!secondary ? <BottomNav screen={currentNav} onNavigate={navigate} /> : null}</View>;
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: theme.background },
  screen: { flex: 1, backgroundColor: theme.background },
  header: { paddingHorizontal: 20, paddingBottom: 14, backgroundColor: theme.background },
  headerRow: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerCopy: { flex: 1 },
  headerTitle: { color: theme.text, fontSize: 21, fontWeight: '700', letterSpacing: -0.45 },
  headerSubtitle: { color: theme.mutedForeground, fontSize: 12, marginTop: 3 },
  headerSpacer: { width: 34 },
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
  quickRow: { flexDirection: 'row', gap: 10 },
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
});