import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Modal, Animated, ScrollView, Platform, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import firestore from '@react-native-firebase/firestore';
import { artStyles } from './IntentAnchorWidget.styles';

// Matches the exact nested map structure from your Firestore analysis document
export interface DBMetrics {
  total_loops?: number;
  memory_drops_prevented?: number;
  friction_index?: number;
  system_health?: string;
}

export interface DBIntentAnchor {
  intent_anchor: {
    anchor_point: string;                  // Intent Anchor context metric
    routine_deviation_probability: string;  // Strength bar tracking metric
    user_unstated_goal: string;             // Intent text payload
  };
  metrics?: DBMetrics;
}

interface IntentAnchorProps {
  analysisData: DBIntentAnchor;
  onSelectStrategy: (strategyId: string) => void;
    // ✅ ADDED: Include a secondary separate handler to route without unmounting widgets
    onNavigateToShield?: (targetScreen: string) => void;
}

export function IntentAnchorWidget({ analysisData, onSelectStrategy, onNavigateToShield }: IntentAnchorProps) {
  // Destructure direct properties extracted from your DB layout map structure
  const {
    anchor_point = "Routine Path Execution Window",
    routine_deviation_probability = "73% Deviation Risk Index",
    user_unstated_goal = "Fulfill objective regarding things with zero memory drops or friction loops."
  } = analysisData.intent_anchor || {};

  // Extract nested metrics configuration saved for this analysis
  const {
    total_loops = 0,
    memory_drops_prevented = 0,
    friction_index = 0,
    system_health = "Stable Engine"
  } = analysisData.metrics || {};

  // Extract pure digits from string (e.g. "73% Deviation Risk Index" -> 73) safely for the progress bar
  const dynamicRiskProgress = (() => {
    const matchedDigits = routine_deviation_probability.match(/\d+/);
    const parsed = matchedDigits ? parseInt(matchedDigits[0], 10) : 0;
    return Math.min(Math.max(parsed, 0), 100);
  })();

// Safely resolve the database package based on target runtime environment
const dbStreamInstance = () => {
  if (Platform.OS === 'web') {
    // 1. Pull modules dynamically from the web SDK bundle configuration setup
    const { getFirestore } = require('firebase/firestore');
    return getFirestore();
  } else {
    // 2. Fallback cleanly to the native mobile operational layer
    return require('@react-native-firebase/firestore').default();
  }
};

  const [techSheetVisible, setTechSheetVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(400)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
   // 🌟 NEW RADAR CONTROLLERS: Continuous loop references
    const radarRotateAnim = useRef(new Animated.Value(0)).current;
    const radarWaveScaleAnim = useRef(new Animated.Value(0.5)).current;

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

useEffect(() => {
    if (techSheetVisible) {
      // 🔄 Infinite 360-degree rotation driver loop
      const rotationLoop = Animated.loop(
        Animated.timing(radarRotateAnim, {
          toValue: 1,
          duration: 4000, // Completes one full rotation sweep every 4 seconds
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== 'web',
        })
      );

      // 🌊 Infinite expanding wave loop driver
      const waveLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(radarWaveScaleAnim, { toValue: 1.4, duration: 2000, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(radarWaveScaleAnim, { toValue: 0.5, duration: 0, useNativeDriver: Platform.OS !== 'web' }),
        ])
      );

      rotationLoop.start();
      waveLoop.start();

      return () => {
        rotationLoop.stop();
        waveLoop.stop();
      };
    }
  }, [techSheetVisible]);

  // Interpolate rotation value string safely (0 to 1 -> 0deg to 360deg)
  const rotatingAngleStyle = radarRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={artStyles.cardContainer}>
      <View style={artStyles.splitLayoutRow}>

        {/* LEFT COLUMN: Intent Anchor Data Processing Card Context */}
        <View style={artStyles.trackerSideColumn}>
          <View style={artStyles.brandGroup}>
            <Feather name="anchor" size={12} color="#00f0ff" />
            <Text style={artStyles.eyebrowText}>Intent Anchor™</Text>
          </View>

          {/* Dynamic strength progress bar calibrated to your probability variable */}
          <View style={artStyles.canvasArcTrack}>
            <View style={artStyles.baseLine} />
            <View style={[artStyles.glowProgressLine, { width: `${dynamicRiskProgress}%` }]} />
            <View style={[artStyles.pulseThumb, { left: `${dynamicRiskProgress}%` }]} />
            <Text style={artStyles.momentumTag}>{routine_deviation_probability}</Text>
          </View>

          {/* Core Unstated Target text container mapping text directly from Firestore */}
          <View style={artStyles.phraseRowGroup}>
            <Animated.View style={[artStyles.dynamicAvatarBadge, { transform: [{ translateY: floatTranslateY }] }]}>
              <Feather name="compass" size={15} color="#ff007f" />
            </Animated.View>

            <Text style={artStyles.coreIntentPhrase} numberOfLines={3}>“{user_unstated_goal}”</Text>

            <Animated.View style={[artStyles.miniConcentricTrack, { transform: [{ translateY: floatTranslateY }] }]}>
              <View style={artStyles.outerArcGlow} />
              <View style={artStyles.innerArcGlow} />
            </Animated.View>
          </View>

          {/* Status Tags inside Intent block passing strings directly from DB layout */}
          <View style={artStyles.signalPillRow}>
            <View style={artStyles.missingPill}>
              <Feather name="clock" size={10} color="#00f0ff" />
              <Text style={artStyles.pillLabel}>{anchor_point}</Text>
            </View>
            <View style={artStyles.missingPill}>
              <Feather name="shield" size={10} color="#39FF14" />
              <Text style={artStyles.pillLabel}>Saved: {memory_drops_prevented}</Text>
            </View>
          </View>
        </View>

        {/* RIGHT COLUMN: Conceptual Scatter Matrix System */}
        <Pressable
          onPress={openTechSheet}
          style={({ pressed }) => [artStyles.conceptSideColumn, pressed && { opacity: 0.9 }]}
        >
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <Text style={artStyles.conceptMetaHeader}>System Engine Matrix</Text>
              <Feather name="info" size={9} color="#52525B" />
            </View>
            <Text style={artStyles.conceptDescription}>
              Evaluating active structural telemetry markers to filter latent drops and friction values.
            </Text>
          </View>

          <View style={artStyles.graphicVectorBox}>
            <View style={artStyles.chartGridLine} />
            <View style={[artStyles.chartGridLine, { left: '33%' }]} />
            <View style={[artStyles.chartGridLine, { left: '66%' }]} />

            <View style={[artStyles.networkLinkLine, { top: 14, left: 10, width: '40%', transform: [{ rotate: '15deg' }] }]} />
            <View style={[artStyles.networkLinkLine, { top: 24, left: '45%', width: '45%', transform: [{ rotate: '-25deg' }] }]} />

            <View style={[artStyles.scatterNodeCircle, { left: 10, top: 10, backgroundColor: '#00f0ff' }]} />
            <View style={[artStyles.scatterNodeCircle, { left: '42%', top: 20, backgroundColor: dynamicRiskProgress > 60 ? '#ff007f' : '#ffbf00' }]} />
            <View style={[artStyles.scatterNodeCircle, { right: 12, top: 8, backgroundColor: '#39FF14' }]} />
          </View>
        </Pressable>

      </View>

      <View style={artStyles.footerActionContainer}>
        <Text style={artStyles.windowMetaText}>
          Total Tracking Loops: <Text style={artStyles.boldHighlight}>{total_loops}</Text>
        </Text>

       <Pressable
           onPress={() => {
             console.log("⚓ Engaging local architectural drawer focus sheet...");
             // 2. ✅ DIRECT BINDING FIX: Fires the local tech sheet drawer open unconditionally
             // instead of routing app state away, guaranteeing zero widget vanishing bugs
             openTechSheet();
           }}
           style={artStyles.anchorButtonSquareOnly}
         >
           {/* ✅ ICON FIX: Swapped out your refresh icon loop to mount a clean neon green anchor instead */}
           <Feather name="anchor" size={14} color="#39FF14" />
         </Pressable>
      </View>

      {/* DETAILED DIAGNOSTIC DRAWER SHEET */}
      {/* DETAILED CYBERNETIC DIAGNOSTIC CORE BLUEPRINT DRAWER */}
      <Modal transparent visible={techSheetVisible} animationType="none" onRequestClose={closeTechSheet}>
        <View style={artStyles.backdropOverlay}>
          <Pressable style={artStyles.dismissArea} onPress={closeTechSheet} />

          {/* MASTER FULL-SCREEN CYBER CANVAS CONTAINER */}
          <Animated.View style={[artStyles.sheetContainer, { transform: [{ translateY: slideAnim }] }]}>

            {/* 🌌 DECORATIVE DIGITAL HUD BACKDROP GRID MATRIX */}
            <View style={artStyles.hudBackgroundMatrixLine} />
            <View style={[artStyles.hudBackgroundMatrixLine, { left: '33%' }]} />
            <View style={[artStyles.hudBackgroundMatrixLine, { left: '66%' }]} />
            <View style={[artStyles.hudHorizontalGridLine, { top: '25%' }]} />
            <View style={[artStyles.hudHorizontalGridLine, { top: '65%' }]} />

            {/* NEON DECORATIVE HUD BOUNDARY CORNERS */}
            <View style={[artStyles.hudCornerPin, { top: 20, left: 20, borderLeftWidth: 2, borderTopWidth: 2 }]} />
            <View style={[artStyles.hudCornerPin, { top: 20, right: 20, borderRightWidth: 2, borderTopWidth: 2 }]} />
            <View style={[artStyles.hudCornerPin, { bottom: 24, left: 20, borderLeftWidth: 2, borderBottomWidth: 2 }]} />
            <View style={[artStyles.hudCornerPin, { bottom: 24, right: 20, borderRightWidth: 2, borderBottomWidth: 2 }]} />

            {/* HEADER SECTION PANEL */}
            <View style={artStyles.hudHeaderControlRow}>
              <View style={{ flex: 1 }}>
                <View style={artStyles.liveSystemRadarGlitchPulseRow}>
                  <View style={artStyles.neonLiveRadarGlitchPulseDot} />
                  <Text style={artStyles.hudTelemetrySystemKicker}>CORE DIAGNOSTIC HUD MAPPING // ON</Text>
                </View>
                <Text style={artStyles.sheetTitle}>Active Diagnostic Blueprint</Text>
                <Text style={artStyles.sheetSubtitle}>Intent Anchor Analysis Target Frame</Text>
              </View>

              {/* TOP TERMINATE CORNER TERMINATE CLOSE BUTTON NODE */}
              <Pressable onPress={closeTechSheet} style={artStyles.hudCircleCloseButtonTouchTarget} hitSlop={14}>
                <Feather name="x" size={14} color="#ff007f" />
              </Pressable>
            </View>

            <ScrollView style={artStyles.scrollContent} showsVerticalScrollIndicator={false}>

              {/* ============================================================== */}
              {/* 🌀 ✨ HIGH-FIDELITY LIVE MOVING VECTOR RADAR GRAPH ANIMATION    */}
              {/* ============================================================== */}
              <View style={artStyles.cyberRadarGraphIllustrationCenterContainer}>

                {/* Moving Base Grid Wave Echoes */}
                <Animated.View
                  style={[
                    artStyles.radarPulseWaveRingEcho,
                    { transform: [{ scale: radarWaveScaleAnim }], opacity: radarWaveScaleAnim.interpolate({ inputRange: [0.5, 1.4], outputRange: [0.6, 0] }) }
                  ]}
                />

                <View style={artStyles.radarOuterCircularGlowTrackRing}>
                  <View style={artStyles.radarInnerCircularDashedSweepingRing}>
                    <View style={artStyles.radarCoreVectorMatrixTargetOrb}>
                      <Feather name="activity" size={16} color="#00f0ff" />
                    </View>
                  </View>
                </View>

                {/* Fixed crosshair guidelines tracks */}
                <View style={artStyles.radarDataCrosshairHorizontalLine} />
                <View style={artStyles.radarDataCrosshairVerticalLine} />

                {/* ============================================================== */}
                {/* 🛰️ 🔄 THE MOVING SWEEP LINE: Rotates continuously 360 degrees   */}
                {/* ============================================================== */}
                <Animated.View style={[artStyles.radarSweeperLineArmPivotContainer, { transform: [{ rotate: rotatingAngleStyle }] }]}>
                  <View style={artStyles.radarSweeperLineGlowArmPointer} />
                </Animated.View>

                {/* Telemetry data particle blips */}
                <View style={[artStyles.radarTelemetryDataNodeBlipParticle, { top: '30%', left: '35%', backgroundColor: '#ff007f' }]} />
                <View style={[artStyles.radarTelemetryDataNodeBlipParticle, { bottom: '25%', right: '28%', backgroundColor: '#00f0ff' }]} />
                <View style={[artStyles.radarTelemetryDataNodeBlipParticle, { top: '45%', right: '35%', backgroundColor: '#ffbf00' }]} />

                <Text style={artStyles.radarGraphVectorOverlayLabelCaption}>TELEMETRY RADAR FREQUENCY SWEEP ACTIVE</Text>
              </View>

              {/* LOG SECTION 1 */}
              <View style={artStyles.techSection}>
                <View style={artStyles.techRowHeader}>
                  <Feather name="crosshair" size={13} color="#ff007f" />
                  <Text style={artStyles.techTitle}>Unstated Objective Trace</Text>
                </View>
                <Text style={artStyles.techDesc}>{user_unstated_goal}</Text>
              </View>

              {/* LOG SECTION 2 */}
              <View style={artStyles.techSection}>
                <View style={artStyles.techRowHeader}>
                  <Feather name="sliders" size={13} color="#00f0ff" />
                  <Text style={artStyles.techTitle}>Live Parameters Status</Text>
                </View>
                <Text style={artStyles.techDesc}>
                  • Monitored Window Node: <Text style={{color: '#fff'}}>{anchor_point}</Text>{'\n'}
                  • Risk Index Probability: <Text style={{color: '#ff007f', fontWeight: '800'}}>{routine_deviation_probability}</Text>{'\n'}
                  • Internal Friction Factor Level: <Text style={{color: '#ffbf00'}}>Index {friction_index}</Text>{'\n'}
                  • Operational Pipeline Health: <Text style={{color: '#39FF14'}}>{system_health}</Text>
                </Text>
              </View>

              {/* PRIMARY ACTION TERMINATION BUTTON CONTROL */}
              <Pressable onPress={closeTechSheet} style={({ pressed }) => [artStyles.hudFooterDismissActionPillButton, pressed && { opacity: 0.85 }]}>
                <Feather name="shield" size={14} color="#050506" />
                <Text style={artStyles.hudFooterDismissActionPillButtonText}>DISMISS SCHEMATIC DIAGNOSTIC</Text>
              </Pressable>

            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

    </View>
  );
}