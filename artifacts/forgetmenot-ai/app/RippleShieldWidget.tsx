import React, { useState, useRef, useEffect } from 'react';
// ✅ FIX: Removed vanilla Image from here and imported it explicitly as RNImage below
import { View, Text, Pressable, Modal, Animated, ScrollView, Platform, Image as RNImage } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { rippleStyles } from './RippleShieldWidget.styles';

interface RippleShieldProps {
  onPreventRipple: () => void;
  omissionItem?: 'Passport' | 'Charger' | 'Key Ring';
  riskScore?: number;
}

const SCENARIO_DATA = {
  Passport: {
    eyebrow: "Critical Transit Risk",
    desc: "Passport omission affects tomorrow's flight preparation timeline.",
    mitigation: "Place passport beside\nyour travel bag tonight",
    dominoes: ["Delayed departure preparation", "Shortened check-in window", "Potential missed flight risk"],
    nodes: ["PASSPORT", "DELAYED PREP", "AIRPORT RISK", "MISSED FLIGHT"],
    probability: "91%",
    multiplier: "1.42x Velocity Friction"
  },
  Charger: {
    eyebrow: "Power Node Failure",
    desc: "Device charger omission breaks communication tracks during travel.",
    mitigation: "Plug charger into your portable power pack now",
    dominoes: ["Device battery drain", "Lost GPS navigation context", "Isolated signal network drop"],
    nodes: ["CHARGER", "BATTERY DRAIN", "LOST NAVIGATION", "OFFLINE NODES"],
    probability: "74%",
    multiplier: "1.18x Routine Friction"
  },
  "Key Ring": {
    eyebrow: "Friction Boundary Lock",
    desc: "Key ring omission triggers terminal perimeter access constraints.",
    mitigation: "Attach keys directly to your active jacket toggle loop",
    dominoes: ["Lockout at entrance boundary", "Emergency locksmith call delay", "Missed critical morning routine"],
    nodes: ["KEY RING", "LOCKOUT RISK", "TIMELINE DELAY", "ROUTINE HALT"],
    probability: "82%",
    multiplier: "1.25x Boundary Friction"
  }
};

export function RippleShieldWidget({
  onPreventRipple,
  omissionItem = "Passport",
  riskScore = 94
}: RippleShieldProps) {

  const [matrixSheetVisible, setMatrixSheetVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(400)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2200, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2200, useNativeDriver: Platform.OS !== 'web' }),
      ])
    ).start();
  }, [floatAnim]);

  useEffect(() => {
    if (matrixSheetVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 7,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    } else {
      slideAnim.setValue(400);
    }
  }, [matrixSheetVisible, slideAnim]);

  const currentFloatValue = (floatAnim as any)._value || 0;
  const floatTranslateY = currentFloatValue === 1 ? -5 : 0;

  const activeData = SCENARIO_DATA[omissionItem] || SCENARIO_DATA.Passport;

  const openMatrixSheet = () => {
    if (Platform.OS !== 'web') {
      try { require('expo-haptics').selectionAsync(); } catch {}
    }
    setMatrixSheetVisible(true);
  };

  const closeMatrixSheet = () => {
    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 200,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setMatrixSheetVisible(false);
    });
  };

  return (
    <View style={rippleStyles.cardContainer}>
      <View style={rippleStyles.splitLayoutRow}>

        {/* LEFT COLUMN: Cascade Progress Chain */}
        <View style={rippleStyles.cascadeSideColumn}>
            {/* Card Outer Main Background Asset Coupling */}
              <RNImage
                source={require('@/assets/images/shield-background.png')}
                style={rippleStyles.cardBackgroundImage}
                resizeMode="cover"
              />


        <View style={rippleStyles.splitLayoutRow}>
                {/* LEFT COLUMN: Cascade Progress Domino Thread */}
                <View style={rippleStyles.cascadeSideColumn}>
                  <View style={rippleStyles.brandGroup}>
                    <Feather name="shield" size={12} color="#A855F7" />
                    <Text style={rippleStyles.eyebrowText}>Ripple Shield™ · {activeData.eyebrow}</Text>
                  </View>

                  <Text style={rippleStyles.alertPhraseBlock}>
                    {activeData.desc}
                  </Text>

                  {/* Core Code Embedded Radar Line Area Vector Graphic Box */}
                  <View style={{
                    width: '100%',
                    height: 64,
                    backgroundColor: '#16161A',
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: '#222226',
                    marginVertical: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <View style={{ position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 1, borderColor: 'rgba(168, 85, 247, 0.04)' }} />
                    <View style={{ position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 1, borderColor: 'rgba(168, 85, 247, 0.08)' }} />
                    <View style={{ position: 'absolute', width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.15)', borderStyle: 'dashed' }} />

                    <View style={{ position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(113, 113, 122, 0.06)' }} />
                    <View style={{ position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(113, 113, 122, 0.06)' }} />

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, zIndex: 2 }}>
                      <Feather name="activity" size={12} color="#ff007f" />
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#71717A', letterSpacing: 0.5, textTransform: 'uppercase' }}>Predictive Matrix Active</Text>
                    </View>
                  </View>

          <View style={rippleStyles.dominoChainContainer}>
            {activeData.dominoes.map((step, idx) => (
              <View key={idx} style={rippleStyles.dominoStepRow}>
                <View style={[rippleStyles.dominoIndicatorNode, idx === 2 && { backgroundColor: '#B91C1C' }]} />
                <Text style={rippleStyles.dominoText} numberOfLines={1}>{step}</Text>
                {idx < 2 && <View style={rippleStyles.dominoConnectorLine} />}
              </View>
            ))}
          </View>
        </View>

        {/* RIGHT COLUMN: Interactive Shield Metric Container */}
        <Pressable
          onPress={openMatrixSheet}
          style={({ pressed }) => [rippleStyles.riskSideColumn, pressed && { opacity: 0.9 }]}
        >
        {/* Dedicated local threat background wireframe layout asset mapping */}
          <RNImage
               source={require('@/assets/images/shield-charger.png')}
               style={rippleStyles.threatMatrixBackgroundImage}
                resizeMode="cover"
            />

             <View style={rippleStyles.threatMatrixFilterMask} />


          <View style={rippleStyles.riskHeaderGroup}>
            <Text style={rippleStyles.riskMetaHeader}>Threat Matrix</Text>
            <Feather name="info" size={9} color="#52525B" />
          </View>

          <Animated.View style={[rippleStyles.shieldGraphicFrame, { transform: [{ translateY: floatTranslateY }] }]}>
            <View style={rippleStyles.shieldOuterShell} />
            <View style={rippleStyles.shieldInnerCore}>
              <Text style={rippleStyles.radialScoreText}>{riskScore}%</Text>
            </View>
          </Animated.View>

          <Text style={rippleStyles.actionDescription} numberOfLines={2}>
            Tracks dependency map nodes
          </Text>
        </Pressable>

      </View>

      {/* Base Action Footer Row */}
      <View style={rippleStyles.footerActionContainer}>
        <Text style={rippleStyles.windowMetaText}>
            Mitigation: <Text style={rippleStyles.boldHighlight}>{activeData.mitigation}</Text>
         </Text>

        <Pressable onPress={openMatrixSheet} style={rippleStyles.shieldButtonSquare}>
          <Feather name="shield" size={14} color="#00f0ff" />
        </Pressable>
      </View>

      {/* 📥 CONTEXT DEPENDENCY NODE MAP DRAWER */}
      <Modal transparent visible={matrixSheetVisible} animationType="none" onRequestClose={closeMatrixSheet}>
        <View style={rippleStyles.backdropOverlay}>
          <Pressable style={rippleStyles.dismissArea} onPress={closeMatrixSheet} />

          <Animated.View style={[rippleStyles.sheetContainer, { transform: [{ translateY: slideAnim }] }]}>
            <View style={rippleStyles.dragHandleBar} />

            <Text style={rippleStyles.sheetTitle}>Consequence Analysis Map</Text>
            <Text style={rippleStyles.sheetSubtitle}>Personal Consequence Dependency Formula Flow</Text>

            <ScrollView style={rippleStyles.scrollContent} showsVerticalScrollIndicator={false}>



                            {/* CARD 1: Flow Network Mapping */}
                            <View style={rippleStyles.matrixCard}>
                              <Text style={rippleStyles.matrixHeader}>Live Dependency Simulation Map</Text>

                              <View style={rippleStyles.visualGraphMapFrame}>
                                <View style={[rippleStyles.mapFlowGridLine, { left: '25%' }]} />
                                <View style={[rippleStyles.mapFlowGridLine, { left: '50%' }]} />
                                <View style={[rippleStyles.mapFlowGridLine, { left: '75%' }]} />

                                <View style={[rippleStyles.mapConnectionVectorWire, { left: 65, top: 32, width: 45, transform: [{ rotate: '25deg' }] }]} />
                                <View style={[rippleStyles.mapConnectionVectorWire, { left: 160, top: 48, width: 50, transform: [{ rotate: '-15deg' }] }]} />
                                <View style={[rippleStyles.mapConnectionVectorWire, { left: 260, top: 38, width: 40, transform: [{ rotate: '35deg' }] }]} />

                                {/* ✅ FIXED CLOSING TAGS: All nodes are safely closed with </View> now */}
                                <View style={[rippleStyles.mapDependencyNode, { left: 8, top: 14, backgroundColor: 'rgba(168, 85, 247, 0.1)', borderColor: '#A855F7' }]}>
                                  <Text style={[rippleStyles.nodeLabelString, { color: '#A855F7' }]}>{activeData.nodes[0]}</Text>
                                </View>

                                <View style={[rippleStyles.mapDependencyNode, { left: '30%', top: 40, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#EF4444' }]}>
                                  <Text style={[rippleStyles.nodeLabelString, { color: '#EF4444' }]}>{activeData.nodes[1]}</Text>
                                </View>

                                <View style={[rippleStyles.mapDependencyNode, { left: '58%', top: 22, backgroundColor: 'rgba(255, 191, 0, 0.1)', borderColor: '#FFBF00' }]}>
                                  <Text style={[rippleStyles.nodeLabelString, { color: '#FFBF00' }]}>{activeData.nodes[2]}</Text>
                                </View>

                                <View style={[rippleStyles.mapDependencyNode, { right: 8, top: 52, backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#EF4444' }]}>
                                  <Text style={[rippleStyles.nodeLabelString, { color: '#EF4444' }]}>{activeData.nodes[3]}</Text>
                                </View>
                              </View>
                            </View>

                            {/* CARD 2: Risk Equation Calculations Breakdown */}
                            <View style={rippleStyles.matrixCard}>
                              <Text style={rippleStyles.matrixHeader}>Risk Equation Breakdown</Text>
                              <View style={rippleStyles.matrixRow}>
                                <Text style={rippleStyles.matrixLabel}>Omission Probability Index</Text>
                                <Text style={[rippleStyles.matrixValue, { color: '#EF4444' }]}>{activeData.probability} probability</Text>
                              </View>
                              <View style={rippleStyles.matrixRow}>
                                <Text style={rippleStyles.matrixLabel}>Time Sensitivity Threshold</Text>
                                <Text style={[rippleStyles.matrixValue, { color: '#FFBF00' }]}>{activeData.timeGravity}</Text>
                              </View>
                              <View style={rippleStyles.matrixRow}>
                                <Text style={rippleStyles.matrixLabel}>Consequence Severity Vector</Text>
                                <Text style={[rippleStyles.matrixValue, { color: '#EF4444' }]}>{activeData.severity}</Text>
                              </View>
                            </View>

                            {/* CARD 3: Tracking Multipliers Loops */}
                            <View style={rippleStyles.matrixCard}>
                              <Text style={rippleStyles.matrixHeader}>Predictive Velocity Metrics</Text>
                              <View style={rippleStyles.matrixRow}>
                                <Text style={rippleStyles.matrixLabel}>Omission Loop Friction</Text>
                                <Text style={rippleStyles.matrixValue}>{activeData.multiplier}</Text>
                              </View>
                              <View style={rippleStyles.matrixRow}>
                                <Text style={rippleStyles.matrixLabel}>Cascading Dependency Count</Text>
                                <Text style={[rippleStyles.matrixValue, { color: '#ff007f' }]}>{activeData.dependencyNodesCount}</Text>
                              </View>
                              <View style={rippleStyles.matrixRow}>
                                <Text style={rippleStyles.matrixLabel}>Calculated Ripple Score™</Text>
                                <Text style={[rippleStyles.matrixValue, { color: '#00f0ff' }]}>{riskScore}% Severity Index</Text>
                              </View>
                            </View>

                            <Pressable onPress={closeMatrixSheet} style={rippleStyles.closeSheetButton}>
                              <Text style={rippleStyles.closeButtonText}>Dismiss Analysis Map</Text>
                            </Pressable>
                          </ScrollView>
                        </Animated.View>
                      </View>
                    </Modal>
                  </View>
                 </View>
                </View>
               );
           }

