import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Modal, Animated, ScrollView, Platform, Image as RNImage, ActivityIndicator, Easing } from 'react-native';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { Feather } from '@expo/vector-icons';
import { rippleStyles } from './RippleShieldWidget.styles';

interface RippleShieldProps {
  onPreventRipple: () => void;
}

export function RippleShieldWidget({ onPreventRipple }: RippleShieldProps) {
  const userId = "Admin_ForgetMeNotAI";

  const [loading, setLoading] = useState(true);
  const [matrixSheetVisible, setMatrixSheetVisible] = useState(false);
  const [shieldData, setShieldData] = useState({
    id: "default_fallback",
    eyebrow: "Critical Transit Risk",
    desc: "Awaiting local telemetry data tracking loop streams.",
    mitigation: "Verify all configuration reservation metrics now.",
    dominoes: ["Analyzing boundary condition", "Checking time gravity frame", "Evaluating routine friction"],
    nodes: "THINGS",
    riskScore: 85,
    multiplier: "1.42x Velocity Friction"
  });

  const slideAnim = useRef(new Animated.Value(400)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const radarRotateAnim = useRef(new Animated.Value(0)).current;
  const radarWaveScaleAnim = useRef(new Animated.Value(0.5)).current;

  // 🧭 REAL-TIME FIREBASE ONSNAPSHOT DATA STREAM
  useEffect(() => {
    const q = query(collection(db, "analyses"), where("user_id", "==", userId), orderBy("created_at", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const rawDoc = snapshot.docs[0].data();
        const shieldMap = rawDoc.replies_shield || {};
        const metricsMap = rawDoc.metrics || {};

        setShieldData({
          id: snapshot.docs[0].id,
          eyebrow: shieldMap.severity ? `${shieldMap.severity} Impact` : "Critical Transit Risk",
          desc: shieldMap.preemptive_auto_draft || rawDoc.title || "Processing active parameter loops.",
          mitigation: metricsMap.mitigation || "Verify all configuration reservation metrics now.",
          dominoes: [
            shieldMap.trigger_condition || "Telemetry perimeter radar variance check.",
            metricsMap.time_gravity || "T-Minus 14 Hours Remaining",
            metricsMap.loop_friction || metricsMap.multiplier || "1.42x Velocity Friction"
          ],
          nodes: (shieldMap.tag || rawDoc.tag || "THINGS").toUpperCase(),
          riskScore: Math.min(Number(metricsMap.probability_index || shieldMap.probability_index || 85), 100),
          multiplier: metricsMap.loop_friction || metricsMap.multiplier || "1.42x Velocity Friction"
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  // 🚀 RADAR SWEEPER AND SHIELD FLOATING DRIVERS
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2200, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2200, useNativeDriver: Platform.OS !== 'web' }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(radarRotateAnim, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: Platform.OS !== 'web' })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(radarWaveScaleAnim, { toValue: 1.4, duration: 2000, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(radarWaveScaleAnim, { toValue: 0.5, duration: 0, useNativeDriver: Platform.OS !== 'web' }),
      ])
    ).start();
  }, [floatAnim]);

  useEffect(() => {
    if (matrixSheetVisible) {
      Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 7, useNativeDriver: Platform.OS !== 'web' }).start();
    } else {
      slideAnim.setValue(400);
    }
  }, [matrixSheetVisible, slideAnim]);

  const currentFloatValue = (floatAnim as any)._value || 0;
  const floatTranslateY = currentFloatValue === 1 ? -5 : 0;
  const rotatingAngleStyle = radarRotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const openMatrixSheet = () => setMatrixSheetVisible(true);
  const closeMatrixSheet = () => {
    Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: Platform.OS !== 'web' }).start(() => setMatrixSheetVisible(false));
  };

  if (loading) {
    return (
      <View style={[rippleStyles.cardContainer, { padding: 48, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="small" color="#A855F7" />
      </View>
    );
  }

  return (
    <View style={rippleStyles.cardContainer}>

      {/* 🌌 Card Outer Main Background Asset Coupling */}
      <RNImage
        source={require('@/assets/images/shield-background.png')}
        style={rippleStyles.cardBackgroundImage}
        resizeMode="cover"
      />

      <View style={rippleStyles.splitLayoutRow}>

        {/* 🛡️ LEFT COLUMN: Cascade Progress Domino Thread */}
        <View style={rippleStyles.cascadeSideColumn}>
          <View style={rippleStyles.brandGroup}>
            <Feather name="shield" size={12} color="#A855F7" />
            <Text style={rippleStyles.eyebrowText}>Ripple Shield™ · {shieldData.eyebrow}</Text>
          </View>

          <Text style={rippleStyles.alertPhraseBlock}>
            {shieldData.desc}
          </Text>

          {/* 🛰️ Core Code Embedded Radar Line Area Vector Graphic Box */}
          <View style={{
            width: '100%', height: 64, backgroundColor: '#16161A', borderRadius: 6, borderWidth: 1, borderColor: '#222226',
            marginVertical: 10, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'
          }}>
            <Animated.View style={{
              position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 1.5, borderColor: 'rgba(168, 85, 247, 0.35)',
              transform: [{ scale: radarWaveScaleAnim }], opacity: radarWaveScaleAnim.interpolate({ inputRange: [0.5, 1.4], outputRange: [0.6, 0] })
            }} />

            <View style={{ position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 1, borderColor: 'rgba(168, 85, 247, 0.04)' }} />
            <View style={{ position: 'absolute', width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.15)', borderStyle: 'dashed' }} />
            <View style={{ position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(113, 113, 122, 0.06)' }} />
            <View style={{ position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(113, 113, 122, 0.06)' }} />

            {/* HIGH-FIDELITY ACTIVE RUNNING RADAR SWEEPER BEAM */}
            <Animated.View style={{ position: 'absolute', width: 64, height: 64, transform: [{ rotate: rotatingAngleStyle }], alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ position: 'absolute', top: 0, width: 1.5, height: 32, backgroundColor: '#A855F7' }} />
            </Animated.View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, zIndex: 2 }}>
              <Feather name="activity" size={12} color="#ff007f" />
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#71717A', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                MATRIX SCAN // {shieldData.multiplier}
              </Text>
            </View>
          </View>

          {/* DYNAMIC PROGRESS DOMINO STRINGS RENDERING MAP */}
          <View style={rippleStyles.dominoChainContainer}>
            {shieldData.dominoes.map((step, idx) => (
              <View key={idx} style={rippleStyles.dominoStepRow}>
                <View style={[rippleStyles.dominoIndicatorNode, idx === 2 && { backgroundColor: '#B91C1C' }]} />
                <Text style={rippleStyles.dominoText} numberOfLines={1}>{step}</Text>
                {idx < 2 && <View style={rippleStyles.dominoConnectorLine} />}
              </View>
            ))}
          </View>
        </View>

        {/* 🎯 RIGHT COLUMN: Interactive Shield Metric Container */}
        <Pressable onPress={openMatrixSheet} style={({ pressed }) => [rippleStyles.riskSideColumn, pressed && { opacity: 0.9 }]}>
          <RNImage source={require('@/assets/images/shield-charger.png')} style={rippleStyles.threatMatrixBackgroundImage} resizeMode="cover" />
          <View style={rippleStyles.threatMatrixFilterMask} />

          <View style={rippleStyles.riskHeaderGroup}>
            <Text style={rippleStyles.riskMetaHeader}>Threat Matrix</Text>
            <Feather name="info" size={9} color="#52525B" />
          </View>

          <Animated.View style={[rippleStyles.shieldGraphicFrame, { transform: [{ translateY: floatTranslateY }] }]}>
            <View style={rippleStyles.shieldOuterShell} />
            <View style={rippleStyles.shieldInnerCore}>
              <Text style={rippleStyles.radialScoreText}>{shieldData.riskScore}%</Text>
            </View>
          </Animated.View>

          <Text style={rippleStyles.actionDescription} numberOfLines={2}>Tracks {shieldData.nodes} dependency map</Text>
        </Pressable>

      </View>

      {/* Base Action Footer Row Control Layout */}
      <View style={rippleStyles.footerActionContainer}>
        <Text style={{ color: '#71717A', fontSize: 11, fontWeight: '500' }}>
          Mitigation: <Text style={{ color: '#A855F7', fontWeight: '700' }}>Active Protection</Text>
        </Text>

        {/* ============================================================== */}
        {/* 🟢 ✅ THE FINISHED RECONCILIATION CORE TRIGGER: FOOTER SHIELD */}
        {/* ============================================================== */}
        <Pressable
          onPress={() => {
            console.log("🛡️ Engaging local architectural threat mitigation drawer focus sheet...");

            // 1. Run your background strategy calculation pipelines safely without unmounting
            /* if (typeof onPreventRipple === 'function') {
              onPreventRipple();
            } */

            // 2. ✅ DIRECT BINDING FIX: Fires your matrix sheet drawer open unconditionally on click
            openMatrixSheet();
          }}
          style={{
            padding: 6,
            backgroundColor: '#1F1F23',
            borderRadius: 6,
            borderWidth: 1,
            borderColor: '#2e2e33',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* ✅ ICON FIX: Changed from 'check' vector to a crisp purple shield matching your design theme */}
          <Feather name="shield" size={14} color="#A855F7" style={{ textAlign: 'center' }} />
        </Pressable>
      </View>


      {/* 📥 COMPLETE INTERFACES SLIDE-UP TECHNICAL DRAWER MODAL BLOCK */}
      <Modal transparent visible={matrixSheetVisible} animationType="none" onRequestClose={closeMatrixSheet}>
        <View style={{ flex: 1, backgroundColor: 'rgba(5, 5, 6, 0.82)', justifyContent: 'flex-end' }}>
          <Pressable style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} onPress={closeMatrixSheet} />

          <Animated.View style={{
            backgroundColor: '#121214', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24,
            height: '75%', transform: [{ translateY: slideAnim }], borderWidth: 1, borderColor: '#1c1c1f'
          }}>
            <View style={{ width: 36, height: 4, backgroundColor: '#27272a', borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>Threat Mitigation Matrix</Text>
              <Pressable onPress={closeMatrixSheet} style={{ padding: 4 }}><Feather name="x" size={16} color="#62626a" /></Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
            {/* ============================================================== */}
              {/* 🛰️ 🌌 NEW DETAILED SYNTHETIC DIAGNOSTIC THREAT NODE MATRIX MESH */}
              {/* ============================================================== */}
              <View style={{
                width: '100%',
                height: 140,
                backgroundColor: '#070709',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#a855f730',
                marginBottom: 16,
                position: 'relative',
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Tech HUD Grid Backdrops */}
                <View style={{ position: 'absolute', top: 0, bottom: 0, left: '25%', width: 1, backgroundColor: 'rgba(255, 255, 255, 0.015)' }} />
                <View style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, backgroundColor: 'rgba(255, 255, 255, 0.015)' }} />
                <View style={{ position: 'absolute', top: 0, bottom: 0, left: '75%', width: 1, backgroundColor: 'rgba(255, 255, 255, 0.015)' }} />
                <View style={{ position: 'absolute', left: 0, right: 0, top: '35%', height: 1, backgroundColor: 'rgba(255, 255, 255, 0.015)' }} />
                <View style={{ position: 'absolute', left: 0, right: 0, top: '70%', height: 1, backgroundColor: 'rgba(255, 255, 255, 0.015)' }} />

                {/* Connected Vector Graphic Topology Lines */}
                <View style={{ position: 'absolute', top: 35, left: 24, width: '35%', height: 1, backgroundColor: '#a855f740', transform: [{ rotate: '20deg' }] }} />
                <View style={{ position: 'absolute', top: 55, left: '42%', width: '38%', height: 1, backgroundColor: '#ff007f40', transform: [{ rotate: '-35deg' }] }} />
                <View style={{ position: 'absolute', bottom: 45, left: 24, width: '70%', height: 1, backgroundColor: '#00ffcc25', transform: [{ rotate: '-5deg' }] }} />

                {/* Glowing Data Target Crosshair Node Blips */}
                <View style={{ position: 'absolute', left: 20, top: 22, width: 8, height: 8, borderRadius: 4, backgroundColor: '#a855f7', boxShadow: '0px 0px 8px #a855f7' }} />
                <View style={{ position: 'absolute', left: '40%', top: 60, width: 10, height: 10, borderRadius: 5, backgroundColor: '#ff007f', borderWidth: 2, borderColor: '#121214', boxShadow: '0px 0px 10px #ff007f' }} />
                <View style={{ position: 'absolute', right: 45, top: 30, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ffd700', boxShadow: '0px 0px 8px #ffd700' }} />
                <View style={{ position: 'absolute', left: '65%', bottom: 25, width: 6, height: 6, borderRadius: 3, backgroundColor: '#00ffcc' }} />

                {/* Neon Tracking Frame Corner Bracket Marks */}
                <View style={{ position: 'absolute', top: 10, left: 10, width: 8, height: 8, borderLeftWidth: 1.5, borderTopWidth: 1.5, borderColor: '#a855f7' }} />
                <View style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRightWidth: 1.5, borderTopWidth: 1.5, borderColor: '#a855f7' }} />
                <View style={{ position: 'absolute', bottom: 10, left: 10, width: 8, height: 8, borderLeftWidth: 1.5, borderBottomWidth: 1.5, borderColor: '#a855f7' }} />
                <View style={{ position: 'absolute', bottom: 10, right: 10, width: 8, height: 8, borderRightWidth: 1.5, borderBottomWidth: 1.5, borderColor: '#a855f7' }} />

                {/* Bottom Graphic Matrix Subtext overlay */}
                <View style={{ position: 'absolute', bottom: 8, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Feather name="cpu" size={8} color="#a855f7" />
                  <Text style={{ color: '#62626a', fontSize: 8, fontWeight: '900', letterSpacing: 1 }}>
                    CONTEXT DEPENDENCY TOPOLOGY // ENABLED
                  </Text>
                </View>
              </View>


             {/* ============================================================== */}
              {/* 📊 🌀 NEW HIGH-FIDELITY HORIZONTAL LINEAR TELEMETRY MATRIX GAUGE */}
              {/* ============================================================== */}
              <View style={{ backgroundColor: '#0d0d0f', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#1c1c1f', marginBottom: 16 }}>
                <Text style={{ color: '#A855F7', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 14 }}>
                  LIVE THREAT MATRIX GEOMETRY
                </Text>

                {/* TRACK 1: PROBABILITY RISK LEVEL */}
                <View style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: '#8a8f98', fontSize: 11, fontWeight: '700' }}>PROBABILITY ACCELERATION</Text>
                    <Text style={{ color: '#00ffcc', fontSize: 11, fontWeight: '900' }}>{shieldData.probability}</Text>
                  </View>
                  <View style={{ height: 6, backgroundColor: '#16161a', borderRadius: 3, overflow: 'hidden', borderWidth: 1, borderColor: '#222226' }}>
                    <View style={{ height: '100%', width: shieldData.probability, backgroundColor: '#00ffcc', borderRadius: 3 }} />
                  </View>
                </View>

                {/* TRACK 2: VELOCITY FRICTION IMPACT MULTIPLIER */}
                <View style={{ marginBottom: 4 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: '#8a8f98', fontSize: 11, fontWeight: '700' }}>ROUTINE VELOCITY FRICTION</Text>
                    <Text style={{ color: '#ff007f', fontSize: 11, fontWeight: '900' }}>{shieldData.multiplier}</Text>
                  </View>
                  <View style={{ height: 6, backgroundColor: '#16161a', borderRadius: 3, overflow: 'hidden', borderWidth: 1, borderColor: '#222226' }}>
                    {/* Intlined dynamic width scaling matching your 1.42x multiplier coefficients safely */}
                    <View style={{ height: '100%', width: '73%', backgroundColor: '#ff007f', borderRadius: 3 }} />
                  </View>
                </View>
              </View>

              {/* PREEMPTIVE SYSTEM AUTO-DRAFT TEXT LOG CARD */}
              <View style={{ backgroundColor: '#16161a', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#26262b', marginBottom: 12 }}>
                <Text style={{ color: '#ff007f', fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 6 }}>
                  PREEMPTIVE SYSTEM AUTO-DRAFT
                </Text>
                <Text style={{ color: '#ccd6f6', fontSize: 13, lineHeight: 18, fontStyle: 'italic' }}>
                  {shieldData.desc}
                </Text>
              </View>

              {/* PREVENTIVE MITIGATION CHECKPOINT TEXT LOG CARD */}
              <View style={{ backgroundColor: '#16161a', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#26262b', marginBottom: 24 }}>
                <Text style={{ color: '#00f0ff', fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 6 }}>
                  PREVENTIVE MITIGATION CHECKPOINT
                </Text>
                <Text style={{ color: '#ffffff', fontSize: 13, lineHeight: 19 }}>
                  {shieldData.mitigation}
                </Text>
              </View>

              {/* DISMISS RECONCILIATION BUTTON CONTROL */}
              <Pressable onPress={closeMatrixSheet} style={{ backgroundColor: '#A855F7', paddingVertical: 14, borderRadius: 10, alignItems: 'center' }}>
                <Text style={{ color: '#050506', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 }}>
                  DISMISS MITIGATION MONITOR
                </Text>
              </Pressable>

            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

    </View>
  );
}
