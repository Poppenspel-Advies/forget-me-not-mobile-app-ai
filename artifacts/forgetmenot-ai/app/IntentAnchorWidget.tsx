import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Modal, Animated, ScrollView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { artStyles } from './IntentAnchorWidget.styles';

interface IntentAnchorProps {
  onSelectStrategy: (strategyId: string) => void; // ✅ Fixed property name signature contract
  phrase?: string;
  score?: number;
  windowTime?: string;
}

export function IntentAnchorWidget({
  onSelectStrategy,
  phrase = "Call Dad this weekend",
  score = 23,
  windowTime = "Tonight"
}: IntentAnchorProps) {

  const [techSheetVisible, setTechSheetVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(400)).current;
  const pulseLoop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseLoop, { toValue: 1, duration: 2000, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulseLoop, { toValue: 0, duration: 2000, useNativeDriver: Platform.OS !== 'web' }),
      ])
    ).start();
  }, [pulseLoop]);

  useEffect(() => {
    if (techSheetVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 7,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    } else {
      slideAnim.setValue(400);
    }
  }, [techSheetVisible, slideAnim]);

  const currentLoopValue = (pulseLoop as any)._value || 0;
  const loopScale = currentLoopValue === 1 ? 1.05 : 1;

  const openTechSheet = () => {
    if (Platform.OS !== 'web') {
      try { require('expo-haptics').selectionAsync(); } catch {}
    }
    setTechSheetVisible(true);
  };

  const closeTechSheet = () => {
    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 200,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setTechSheetVisible(false);
    });
  };

  return (
    <View style={artStyles.cardContainer}>

      {/* 50/50 Split Content Grid Frame */}
      <View style={artStyles.splitLayoutRow}>

        {/* LEFT COLUMN: Momentum Tracker Engine */}
        <View style={artStyles.trackerSideColumn}>
          <View style={artStyles.brandGroup}>
            <Feather name="compass" size={12} color="#00f0ff" />
            <Text style={artStyles.eyebrowText}>Intent Anchor™</Text>
          </View>

          {/* Elevated Fading Track Timeline */}
          <View style={artStyles.canvasArcTrack}>
            <View style={artStyles.baseLine} />
            <View style={[artStyles.glowProgressLine, { width: `${score}%` }]} />
            <View style={[artStyles.pulseThumb, { left: `${score}%` }]} />
            <Text style={artStyles.momentumTag}>{score}% strength ↓</Text>
          </View>

          {/* Main Context Text Item */}
          <View style={artStyles.phraseRowGroup}>
            <View style={artStyles.dynamicAvatarBadge}>
              <Feather name="phone" size={14} color="#ff007f" />
            </View>
            <Text style={artStyles.coreIntentPhrase} numberOfLines={2}>“{phrase}”</Text>

            <Animated.View style={[artStyles.miniConcentricTrack, { transform: [{ scale: loopScale }] }]}>
              <View style={artStyles.outerArcGlow} />
              <View style={artStyles.innerArcGlow} />
            </Animated.View>
          </View>

          <View style={artStyles.signalPillRow}>
            <View style={artStyles.missingPill}>
              <Feather name="alert-circle" size={10} color="#ffbf00" />
              <Text style={artStyles.pillLabel}>Sunday Plan Missing</Text>
            </View>
            <View style={artStyles.missingPill}>
              <Feather name="calendar" size={10} color="#ffbf00" />
              <Text style={artStyles.pillLabel}>Calendar Gap Detected</Text>
            </View>
          </View>
        </View>

        {/* RIGHT COLUMN: Conceptual Scatter Network Graph (Inspired by Sample Image) */}
        <Pressable
          onPress={openTechSheet}
          style={({ pressed }) => [
            artStyles.conceptSideColumn,
            pressed && { opacity: 0.9, transform: [{ scale: 0.995 }] }
          ]}
        >
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <Text style={artStyles.conceptMetaHeader}>System Engine</Text>
              <Feather name="info" size={9} color="#52525B" />
            </View>
            <Text style={artStyles.conceptDescription}>
              Tracks behavioral momentum anomalies before real-world omissions occur.
            </Text>
          </View>

          {/* 🌟 NEW GRAPHICAL VIEW: Premium Connected Node Signal Scatter Matrix */}
          <View style={artStyles.graphicVectorBox}>
            <View style={artStyles.chartGridLine} />
            <View style={[artStyles.chartGridLine, { left: '33%' }]} />
            <View style={[artStyles.chartGridLine, { left: '66%' }]} />

            {/* Dynamic connected timeline thread wires mapping */}
            <View style={[artStyles.networkLinkLine, { top: 14, left: 10, width: '40%', transform: [{ rotate: '15deg' }] }]} />
            <View style={[artStyles.networkLinkLine, { top: 24, left: '45%', width: '45%', transform: [{ rotate: '-25deg' }] }]} />

            {/* Signal Node dots tracking behavior context elements */}
            <View style={[artStyles.scatterNodeCircle, { left: 10, top: 10, backgroundColor: '#00f0ff' }]} />
            <View style={[artStyles.scatterNodeCircle, { left: '42%', top: 20, backgroundColor: '#ffbf00' }]} />
            <View style={[artStyles.scatterNodeCircle, { right: 12, top: 8, backgroundColor: '#ff007f' }]} />
          </View>
        </Pressable>

      </View>

      {/* Shared Minimal Layout Footer */}
      <View style={artStyles.footerActionContainer}>
        <Text style={artStyles.windowMetaText}>
          Optimal Window: <Text style={artStyles.boldHighlight}>{windowTime}</Text>
        </Text>

        {/* ✅ FIXED EXPLICIT CALLBACK: Now routes strategy selections cleanly back to your home frame handler */}
        <Pressable
          onPress={() => { if (typeof tap === 'function') tap(); onSelectStrategy('default_anchor'); }}
          style={({ pressed }) => [
            artStyles.anchorButtonSquareOnly,
            pressed && { backgroundColor: 'rgba(57, 255, 20, 0.25)', transform: [{ scale: 0.96 }] }
          ]}
        >
          <Feather name="anchor" size={14} color="#39FF14" />
        </Pressable>
      </View>

      {/* DETAILED ENGINE PROFILE DIAGNOSTIC SHEET MODAL */}
      <Modal transparent visible={techSheetVisible} animationType="none" onRequestClose={closeTechSheet}>
        <View style={artStyles.backdropOverlay}>
          <Pressable style={artStyles.dismissArea} onPress={closeTechSheet} />

          <Animated.View style={[artStyles.sheetContainer, { transform: [{ translateY: slideAnim }], paddingBottom: Platform.OS === 'ios' ? 34 : 20 }]}>
            <View style={artStyles.dragHandleBar} />

            <Text style={artStyles.sheetTitle}>Predictive Memory System</Text>
            <Text style={artStyles.sheetSubtitle}>Intent Anchor™ Engine Architecture</Text>

            <ScrollView style={artStyles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={artStyles.techSection}>
                <View style={artStyles.techRowHeader}>
                  <Feather name="git-commit" size={13} color="#ff007f" />
                  <Text style={artStyles.techTitle}>1. Intention Registration</Text>
                </View>
                <Text style={artStyles.techDesc}>
                  Natural language extraction catches commitments (like "Call Dad") and maps active routine curves instead of fixed checkboxes.
                </Text>
              </View>

              <View style={artStyles.techSection}>
                <View style={artStyles.techRowHeader}>
                  <Feather name="eye" size={13} color="#00f0ff" />
                  <Text style={artStyles.techTitle}>2. Signal Matrix Tracking</Text>
                </View>
                <Text style={artStyles.techDesc}>
                  Monitors active routine variables like calendar slots, device tracking, and context footprints to calculate trajectory friction.
                </Text>
              </View>

              <View style={artStyles.techSection}>
                <View style={artStyles.techRowHeader}>
                  <Feather name="trending-down" size={13} color="#ffbf00" />
                  <Text style={artStyles.techTitle}>3. Predictive Omission Prevention</Text>
                </View>
                <Text style={artStyles.techDesc}>
                  If target deadlines pass without matching logs, momentum scales drop down below threshold indices to surface system alerts.
                </Text>
              </View>

              <Pressable onPress={closeTechSheet} style={artStyles.closeSheetButton}>
                <Text style={artStyles.closeButtonText}>Dismiss Architecture View</Text>
              </Pressable>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

    </View>
  );
}
