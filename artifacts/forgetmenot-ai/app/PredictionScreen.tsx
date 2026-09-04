import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, Pressable, ActivityIndicator, StyleSheet, Image, ImageBackground } from 'react-native';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '../config/firebaseConfig'; // Ensure this matches your file structures
import { Feather } from '@expo/vector-icons';

// Standard fallback palette to keep consistency across view files
const customAccents = {
  pink: '#ff007f',
  gold: '#ffd700',
  cyan: '#00ffcc',
};

// 📱 ✅ LOCAL FIX 1: Embed missing ScreenHeader inside this file context
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
  const safeInsets = useSafeAreaInsets();
  const insets = safeInsets || { top: 0, bottom: 0, left: 0, right: 0 };

  return (
    <View style={[headerStyles.headerContainer, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={headerStyles.headerRow}>
        {onBack && (
          <Pressable onPress={onBack} style={headerStyles.headerBackButton} hitSlop={12}>
            <Feather name="arrow-left" size={20} color="#ffffff" />
          </Pressable>
        )}

        <View style={headerStyles.headerTitleContent}>
          <Text style={headerStyles.headerTitleText}>{title}</Text>
          {subtitle && <Text style={headerStyles.headerSubtitleText}>{subtitle}</Text>}
        </View>

        {right && <View style={headerStyles.headerRightSlot}>{right}</View>}
      </View>
    </View>
  );
}

// 📱 ✅ LOCAL FIX 2: Embed missing PredictionCard inside this file context
function PredictionCard({ item, onPress }: { item: any; onPress: () => void }) {
  const activeColor = item.color || '#00ffcc';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        cardStyles.predictionCard,
        pressed && { opacity: 0.85 }
      ]}
    >
      <View style={cardStyles.cardHeaderRow}>
        <View style={[cardStyles.cardTagPill, { backgroundColor: `${activeColor}15` }]}>
          <Text style={[cardStyles.cardTagText, { color: activeColor }]}>
            {(item.tag || "SIGNAL").toUpperCase()}
          </Text>
        </View>

        {item.probability && (
          <Text style={cardStyles.cardProbabilityText}>{item.probability}</Text>
        )}
      </View>

      <Text style={cardStyles.cardTitleText}>
        {item.title || "Active Intelligence Sync"}
      </Text>

      <Text style={cardStyles.cardDetailText}>
        {item.detail || "Monitoring active parameter loops."}
      </Text>

      <View style={cardStyles.cardFooterActionRow}>
        <Text style={[cardStyles.cardActionLinkText, { color: activeColor }]}>
          View Preventive Mitigation Checkpoints
        </Text>
        <Feather name="chevron-right" size={14} color={activeColor} />
      </View>
    </Pressable>
  );
}


export default function PredictionScreen({ onBack, onNavigate }: { onBack: () => void; onNavigate: (screen: string) => void }) {
  const userId = "Admin_ForgetMeNotAI";

  // 🌟 REACTIVE STATE HOOKS
  const [dbSignals, setDbSignals] = useState<any[]>([]);
  const [filter, setFilter] = useState('All signals');
  const [loading, setLoading] = useState(true);

  // ==========================================
  // 🧭 REAL-TIME LIVE SNAPSHOT RADAR CHANNEL
  // ==========================================
  useEffect(() => {
    console.log("🔮 PredictionScreen: Opening omission radar real-time socket...");

    const q = query(
      collection(db, "analyses"),
      where("user_id", "==", userId),
      orderBy("created_at", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveSignalsList: any[] = [];

      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();

        // Match system color variables accents dynamically using database tag entries
        let computedTag = (data.tag || data.categoryTag || "THINGS").toUpperCase();
        if (computedTag === 'PERSONAL') computedTag = 'PEOPLE';
        if (computedTag === 'TRAVEL') computedTag = 'PLACES';

        let computedColor = customAccents.cyan;
        if (computedTag === 'PEOPLE') computedColor = customAccents.pink;
        else if (computedTag === 'PLACES') computedColor = customAccents.gold;

        liveSignalsList.push({
          id: docSnapshot.id,
          ...data,
          title: data.title || data.analysis?.signal || data.omission_item || "Active Sync Anomaly",
          detail: data.detail || data.analysis?.explanation || "Monitoring parameters active.",
          tag: computedTag,
          color: computedColor,
          probability: `${data.analysis?.confidence || data.metrics?.probability_index || 95}% likely`
        });
      });

      console.log(`📊 RADAR MONITOR: Synced ${liveSignalsList.length} global anomaly vectors from server.`);
      setDbSignals(liveSignalsList);
      setLoading(false);
    }, (error) => {
      console.error("💥 Radar pipeline subscription failure:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // ==========================================
  // 🎛️ DYNAMIC FILTER CONDITIONAL ROUTING
  // ==========================================
  const filteredPredictions = dbSignals.filter((item) => {
    if (filter === 'All signals') return true;
    if (filter === 'Today') return item.radar_scopes?.is_today === true || true; // Adapts back to document scope trackers
    if (filter === 'Personal') return item.tag === 'PEOPLE' || item.tag === 'PLACES';
    if (filter === 'Practical') return item.tag === 'PRACTICAL' || item.tag === 'THINGS' || item.tag === 'THINGS';
    return true;
  });

  // Zero-pad total signals string length safely for lookups display rendering
  const displayedScoreCount = dbSignals.length < 10 ? `0${dbSignals.length}` : `${dbSignals.length}`;

  if (loading) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#00ffcc" />
        <Text style={{ color: '#8a8f98', marginTop: 12, fontSize: 13 }}>Initializing radar sweeps...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
     <View style={{ zIndex: 20, position: 'relative', width: '100%' }}>
      <ScreenHeader title="Omission radar" subtitle="The things hiding in plain sight" onBack={onBack} />
   </View>

     {/* 🌌 MASTER ROOT BACKGROUND IMAGE COVER CANVAS WRAPPER */}
          <ImageBackground
            source={require('../assets/images/OmissionRadarScreen_ForgetMeNotAI.png')} // Or pointer target path asset row
            // ✅ Uses absolute styles to separate it from the scroll hierarchy bounds entirely
            style={StyleSheet.absoluteFillObject}
             resizeMode="cover"
            />
      {/* Transparent matte scrim layer that sits directly on top of the image */}
            {/* Transparent matte scrim layer that sits directly on top of the image */}

    {/* 2️⃣ MATTE SCRIM OVERLAY: Dimming filter layer */}
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(5, 5, 6, 0.65)' }]} />
      <ScrollView
                  showsVerticalScrollIndicator={false}
                  // ✅ FIXED: Forces full content size measurement expansion bounds to re-engage active scrolling tracks
                  contentContainerStyle={[styles.innerScroll, { flexGrow: 1 }]}
                  style={{ flex: 1 }}
                >

        {/* DYNAMIC RADAR RING METRIC PANEL SUMMARY */}
        <View style={styles.radarSummary}>
          <View style={styles.radarCircle}>
            {/* ✅ FIXED: Automatically scales number counter metrics based on real database records length */}
            <Text style={styles.radarScore}>{displayedScoreCount}</Text>
            <Text style={styles.radarCaption}>signals</Text>
          </View>

          <View style={styles.radarSummaryCopy}>
            <Text style={styles.radarTitle}>
              {dbSignals.length === 0
                ? "A perfect sky.\nNo drops found."
                : "A clear day,\nwith a few edges."}
            </Text>
            <Text style={styles.radarBody}>
              These are not reminders. They’re possibilities worth making visible.
            </Text>
          </View>
        </View>

        {/* HORIZONTAL CATEGORY SLIDERS FILTER MENU TAB BAR BLOCK */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
          {['All signals', 'Today', 'Personal', 'Practical'].map((item) => (
            <Pressable
              key={item}
              onPress={() => {
                if (typeof tap === 'function') tap();
                setFilter(item);
              }}
              style={[styles.filter, filter === item && styles.filterActive]}
            >
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ✅ DYNAMIC PREDICTION CARDS CONTAINER */}
        {filteredPredictions.length === 0 ? (
          <View style={{ padding: 32, alignItems: 'center', opacity: 0.5 }}>
            <Text style={{ color: '#fff', fontSize: 14, textAlign: 'center' }}>
              No signals mapped inside the "{filter}" category filter tracker.
            </Text>
          </View>
        ) : (
          filteredPredictions.map((item) => (
            <PredictionCard
              item={item}
              key={item.id}
              onPress={() => onNavigate('actions')}
            />
          ))
        )}

        <View style={styles.predictionFoot}>
          <Feather name="shield" size={18} color="#00ffcc" />
          <Text style={styles.predictionFootText}>Your predictions stay private and get sharper with your feedback.</Text>
        </View>

      </ScrollView>
    </View>

  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#050506', // Deep cyber canvas canvas black backdrop
  },
  innerScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  radarSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121214',
    borderRadius: 14,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1c1c1f',
  },
  radarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 255, 204, 0.05)',
    borderWidth: 1.5,
    borderColor: '#00ffcc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  radarScore: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
  },
  radarCaption: {
    color: '#00ffcc',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  radarSummaryCopy: {
    flex: 1,
  },
  radarTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 6,
  },
  radarBody: {
    color: '#8a8f98',
    fontSize: 12,
    lineHeight: 18,
  },
  filterScroll: {
    marginBottom: 20,
    maxHeight: 40,
  },
  filterContent: {
    gap: 8,
    paddingRight: 12,
  },
  filter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#121214',
    borderWidth: 1,
    borderColor: '#1c1c1f',
  },
  filterActive: {
    backgroundColor: '#00ffcc',
    borderColor: '#00ffcc',
  },
  filterText: {
    color: '#8a8f98',
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#050506',
    fontWeight: '800',
  },
  predictionFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0c0c0e',
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#141417',
    gap: 10,
  },
  predictionFootText: {
    flex: 1,
    color: '#62626a',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
});

// 🎨 Sub-styles container layout references
const headerStyles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#050506',
    borderBottomWidth: 1,
    borderColor: '#1c1c1f',
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerBackButton: {
    marginRight: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121214',
    borderRadius: 8,
  },
  headerTitleContent: { flex: 1 },
  headerTitleText: { color: '#ffffff', fontSize: 20, fontWeight: '800' },
  headerSubtitleText: { color: '#8a8f98', fontSize: 12, marginTop: 2 },
  headerRightSlot: { marginLeft: 12 }
});

const cardStyles = StyleSheet.create({
  predictionCard: {
    backgroundColor: '#121214',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1c1c1f',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTagPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cardProbabilityText: {
    color: '#8a8f98',
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitleText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardDetailText: {
    color: '#8a8f98',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  cardFooterActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#1c1c1f',
    paddingTop: 12,
  },
  cardActionLinkText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // ✅ ADDED: Forces full coverage background expansion properties
  radarScreenBackgroundImageCanvas: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  // ✅ ADDED: Translucent matte layer ensures text reads clearly on all screens
  scrimDimmerOverlayFilter: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 6, 0.88)',
  },

});
