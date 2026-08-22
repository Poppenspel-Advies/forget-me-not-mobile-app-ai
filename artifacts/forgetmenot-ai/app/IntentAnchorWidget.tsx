import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Modal, Animated, ScrollView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { artStyles } from './IntentAnchorWidget.styles';

interface IntentAnchorProps {
  onSelectStrategy: (strategyId: string) => void;
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
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 1800, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1800, useNativeDriver: Platform.OS !== 'web' }),
      ])
    ).start();
  }, [floatAnim]);

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

  const currentFloatValue = (floatAnim as any)._value || 0;
  const floatTranslateY = currentFloatValue === 1 ? -5 : 0;

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
            <Animated.View style={[artStyles.dynamicAvatarBadge, { transform: [{ translateY: floatTranslateY }] }]}>
              <Feather name="anchor" size={15} color="#ff007f" />
            </Animated.View>

            <Text style={artStyles.coreIntentPhrase} numberOfLines={2}>“{phrase}”</Text>

            {/* Concentric Progress Wave Chart */}
            <Animated.View style={[artStyles.miniConcentricTrack, { transform: [{ translateY: floatTranslateY }] }]}>
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

        {/* RIGHT COLUMN: Conceptual Scatter Network Graph Layout */}
        <Pressable
          onPress={openTechSheet}
          style={({ pressed }) => [artStyles.conceptSideColumn, pressed && { opacity: 0.9 }]}
        >
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <Text style={artStyles.conceptMetaHeader}>System Engine</Text>
              <Feather name="info" size={9} color="#52525B" />
            </View>
            <Text style={artStyles.conceptDescription}>
              Detects commitments before omissions happen by parsing live behavioral telemetry loops.
            </Text>
          </View>

          {/* Connected Node Signal Scatter Matrix */}
          <View style={artStyles.graphicVectorBox}>
            <View style={artStyles.chartGridLine} />
            <View style={[artStyles.chartGridLine, { left: '33%' }]} />
            <View style={[artStyles.chartGridLine, { left: '66%' }]} />

            <View style={[artStyles.networkLinkLine, { top: 14, left: 10, width: '40%', transform: [{ rotate: '15deg' }] }]} />
            <View style={[artStyles.networkLinkLine, { top: 24, left: '45%', width: '45%', transform: [{ rotate: '-25deg' }] }]} />

            <View style={[artStyles.scatterNodeCircle, { left: 10, top: 10, backgroundColor: '#00f0ff' }]} />
            <View style={[artStyles.scatterNodeCircle, { left: '42%', top: 20, backgroundColor: '#ffbf00' }]} />
            <View style={[artStyles.scatterNodeCircle, { right: 12, top: 8, backgroundColor: '#ff007f' }]} />
          </View>
        </Pressable>

      </View>

      <View style={artStyles.footerActionContainer}>
        <Text style={artStyles.windowMetaText}>
          Optimal Window: <Text style={artStyles.boldHighlight}>{windowTime}</Text>
        </Text>

        <Pressable onPress={() => onSelectStrategy('default_anchor')} style={artStyles.anchorButtonSquareOnly}>
          <Feather name="anchor" size={14} color="#39FF14" />
        </Pressable>
      </View>

      {/* 📥 100% COMPLETE: SLIDE-UP PREDICTIVE MEMORY SYSTEM DRAWER SHEET */}
      <Modal transparent visible={techSheetVisible} animationType="none" onRequestClose={closeTechSheet}>
        <View style={artStyles.backdropOverlay}>
          <Pressable style={artStyles.dismissArea} onPress={closeTechSheet} />

          <Animated.View style={[artStyles.sheetContainer, { transform: [{ translateY: slideAnim }], paddingBottom: Platform.OS === 'ios' ? 34 : 20 }]}>
            <View style={artStyles.dragHandleBar} />

            <Text style={artStyles.sheetTitle}>Predictive Memory System</Text>
            <Text style={artStyles.sheetSubtitle}>Intent Anchor™ Engine Architecture</Text>

            <ScrollView style={artStyles.scrollContent} showsVerticalScrollIndicator={false}>

              {/* CARD 1: Intention Registration Phase */}
              <View style={artStyles.techSection}>
                <View style={artStyles.techRowHeader}>
                  <Feather name="git-commit" size={13} color="#ff007f" />
                  <Text style={artStyles.techTitle}>1. Intention Registration Vector</Text>
                </View>
                <Text style={artStyles.techDesc}>
                  Natural language extraction catches explicit goals (e.g. “{phrase}”) and creates a fluid commitment trajectory instead of a static checkbox task.
                </Text>
              </View>

              {/* CARD 2: Multi-Matrix Signal Processing */}
              <View style={artStyles.techSection}>
                <View style={artStyles.techRowHeader}>
                  <Feather name="eye" size={13} color="#00f0ff" />
                  <Text style={artStyles.techTitle}>2. Background Signal Tracking Matrix</Text>
                </View>
                <Text style={artStyles.techDesc}>
                  Continuously scans active behavioral indicators: digital routine history, device calendar logs, presence signals, and context patterns.
                </Text>
              </View>

              {/* CARD 3: Momentum Velocity Drop Threshold */}
              <View style={artStyles.techSection}>
                <View style={artStyles.techRowHeader}>
                  <Feather name="trending-down" size={13} color="#ffbf00" />
                  <Text style={artStyles.techTitle}>3. Momentum Decay Threshold</Text>
                </View>
                <Text style={artStyles.techDesc}>
                  If timeline slots pass without triggering supporting behaviors, momentum falls below threshold targets to flag omission anomalies before they occur.
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
