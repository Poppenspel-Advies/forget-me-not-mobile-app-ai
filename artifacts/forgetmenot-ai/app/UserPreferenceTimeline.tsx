import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, Animated, Easing } from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig' // ⚠️ Adjust path to your setup

// 🟢 Sub-Component: Pulsing Radar Dot
function RadarDot({ color }: { color: string }) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: color,
        opacity: pulseAnim,
        marginRight: 8,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
      }}
    />
  );
}

// ⌨️ Sub-Component: Cyber Typewriter Effect
function TypewriterText({ text, speed = 25, delay = 0, style }: { text: string; speed?: number; delay?: number; style: any }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const startTimeout = setTimeout(() => {
      let index = 0;
      timer = setInterval(() => {
        if (index < text.length) {
          // React Native string updates append safely character by character
          setDisplayedText((prev) => prev + text.charAt(index));
          index++;
        } else {
          clearInterval(timer);
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      if (timer) clearInterval(timer);
    };
  }, [text]);

  return <Text style={style}>{displayedText}</Text>;
}

// 🔮 Main Container Wrapper for Each Streamed Card
function AnimatedFeedItem({ item, index }: { item: any; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  // Stagger parameters based on index position inside the active payload
  const cardDelay = index * 150;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: cardDelay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        delay: cardDelay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const signalColor = item.color || '#00f0ff';

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        backgroundColor: 'rgba(23, 23, 27, 0.45)',
        borderRadius: 14,
        padding: 18,
        borderWidth: 1,
        borderColor: '#222226',
        borderLeftWidth: 4,
        borderLeftColor: signalColor,
        marginBottom: 14,
        shadowColor: signalColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      {/* Top Header Controls row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <RadarDot color={signalColor} />
          <Text style={{ color: signalColor, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 }}>
            SIGNAL // {item.tag.toUpperCase()}
          </Text>
        </View>
        <View style={{ backgroundColor: 'rgba(255, 0, 127, 0.08)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255, 0, 127, 0.2)' }}>
          <Text style={{ color: '#ff007f', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 }}>{item.confidence}% MATCH</Text>
        </View>
      </View>

      {/* Primary Risk Message with typewriter entry */}
      <TypewriterText
        text={`⚠️ RISK DETECTED: ${item.title.toUpperCase()}`}
        delay={cardDelay + 200}
        speed={15}
        style={{ color: '#ff4a5a', fontSize: 11, fontWeight: '800', letterSpacing: 0.3, lineHeight: 15, marginBottom: 6 }}
      />

      {/* Target descriptive omission frame */}
      <TypewriterText
        text={item.omission}
        delay={cardDelay + 500}
        speed={12}
        style={{ color: '#ffffff', fontSize: 13, fontWeight: '600', marginBottom: 10 }}
      />

      {/* Action Recommendation Sub-Block */}
      <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: 12, borderRadius: 8, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.05)' }}>
        <Text style={{ color: '#a1a1aa', fontSize: 11, lineHeight: 16 }}>
          <Text style={{ color: '#4CD964', fontWeight: '700' }}>💡 Action: </Text>
          {item.preventive}
        </Text>
      </View>
    </Animated.View>
  );
}

export function UserPreferenceTimeline() {
  const [recentSignalsFeed, setRecentSignalsFeed] = useState<any[]>([]);
  const [isFeedLoading, setIsFeedLoading] = useState<boolean>(true);

  useEffect(() => {
    const authInstance = getAuth();
    const activeFirebaseUser = authInstance.currentUser;
    const currentActiveUserId = activeFirebaseUser ? activeFirebaseUser.uid : "Admin_ForgetMeNotAI";

    const feedQuery = query(
      collection(db, "analyses"),
      where("user_id", "==", currentActiveUserId),
      orderBy("created_at", "desc")
    );

    const unsubscribeFeed = onSnapshot(feedQuery, (snapshot) => {
      const compiledSignals: any[] = [];
      if (!snapshot.empty) {
        snapshot.docs.forEach((doc) => {
          const docData = doc.data();
          compiledSignals.push({
            id: doc.id,
            title: docData.title || "Context frame logged.",
            omission: docData.omission_item || "Evaluating perimeter logs...",
            preventive: docData.mitigation || "No active warning logged.",
            confidence: docData.metrics?.probability_index || docData.probability || 85,
            tag: docData.tag || "GENERAL",
            color: docData.color || "#00f0ff"
          });
        });
      }
      setRecentSignalsFeed(compiledSignals.slice(0, 3));
      setIsFeedLoading(false);
    }, (error) => {
      console.error("💥 Feed snapshot collection tracking failure:", error);
      setIsFeedLoading(false);
    });

    return () => unsubscribeFeed();
  }, [getAuth().currentUser?.uid]);

  return (
    <View style={{ width: '100%', paddingHorizontal: 0, marginVertical: 4 }}>
      <View style={{ width: '100%' }}>
        {isFeedLoading ? (
          <View style={{ backgroundColor: 'rgba(16, 17, 23, 0.4)', borderRadius: 16, padding: 32, borderWidth: 1, borderColor: '#242630', alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="small" color="#00f0ff" />
            <Text style={{ color: '#737373', fontSize: 11, marginTop: 10, letterSpacing: 1 }}>SYNCHRONIZING FEED...</Text>
          </View>
        ) : recentSignalsFeed.length === 0 ? (
          <View style={{ backgroundColor: 'rgba(16, 17, 23, 0.4)', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#242630' }}>
            <Text style={{ color: '#a1a1aa', fontSize: 12, textAlign: 'center', fontStyle: 'italic' }}>
              No active memory omission risks logged on this channel.
            </Text>
          </View>
        ) : (
          recentSignalsFeed.map((item, index) => (
            <AnimatedFeedItem key={item.id} item={item} index={index} />
          ))
        )}
      </View>
    </View>
  );
}
