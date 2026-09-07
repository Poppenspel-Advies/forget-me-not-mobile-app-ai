import { StyleSheet, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const artStyles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    backgroundColor: '#111113',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E1E22',
    padding: 16,
    marginVertical: 12,
  },
  splitLayoutRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    gap: 16,
  },

  // --- Left Half: Core Tracker ---
  trackerSideColumn: {
    flex: 1.1,
    justifyContent: 'space-between',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00f0ff',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginLeft: 6,
  },
  canvasArcTrack: {
    width: '100%',
    height: 12,
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 16,
  },
  baseLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#1C1C21',
    borderRadius: 1,
  },
  glowProgressLine: {
    position: 'absolute',
    left: 0,
    height: 2,
    backgroundColor: '#ff007f',
  },
  pulseThumb: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#ff007f',
    top: 2,
  },
  momentumTag: {
    position: 'absolute',
    right: 0,
    top: -12,
    fontSize: 9,
    fontWeight: '700',
    color: '#ff007f',
  },
  phraseRowGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  dynamicAvatarBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#1A1A1E',
    borderWidth: 1,
    borderColor: '#26262B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreIntentPhrase: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 20,
  },

  // 🧭 Concentric Arc Layer Spacing
  miniConcentricTrack: {
    width: 34,
    height: 34,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerArcGlow: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2.5,
    borderColor: '#ff007f',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '-45deg' }],
  },
  innerArcGlow: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffbf00',
    borderTopColor: 'transparent',
    transform: [{ rotate: '30deg' }],
  },

  signalPillRow: {
    flexDirection: 'column',
    gap: 4,
  },
  missingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 191, 0, 0.04)',
    borderColor: 'rgba(255, 191, 0, 0.12)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  pillLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffbf00',
    marginLeft: 4,
  },

  // --- Right Half: Layout Controls ---
  conceptSideColumn: {
    flex: 0.9,
    backgroundColor: '#151518',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#222226',
    padding: 12,
    justifyContent: 'space-between',
  },
  conceptMetaHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  conceptDescription: {
    fontSize: 11,
    color: '#A1A1AA',
    lineHeight: 15,
    marginBottom: 8,
  },

  // Dynamic Scatter Grid Fixes
  graphicVectorBox: {
    width: '100%',
    height: 46,
    backgroundColor: '#0F0F11',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1C1C21',
    position: 'relative',
    overflow: 'hidden',
  },
  chartGridLine: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(113, 113, 122, 0.08)',
  },
  networkLinkLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(255, 0, 127, 0.25)',
  },
  scatterNodeCircle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  footerActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#1E1E22',
    paddingTop: 12,
    marginTop: 14,
  },
  windowMetaText: {
    fontSize: 12,
    color: '#71717A',
  },
  boldHighlight: {
    color: '#ffbf00',
    fontWeight: '600',
  },
  anchorButtonSquareOnly: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    borderColor: '#39FF14',
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal Drawer Layout Configuration
  backdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 6, 0.85)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },

  sheetContainer: {
    position: 'absolute',
    top: 0,                           // ✅ FIXED: Stretches all the way up to eliminate the top gap
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',                   // ✅ FIXED: Expands over the full viewport boundary line
    backgroundColor: 'rgba(10, 10, 12, 0.96)', // Immersive deep cyber matte glass backdrop
    paddingHorizontal: 24,
    paddingTop: 48,
    overflow: 'hidden',
  },

hudHeaderControlRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  width: '100%',
  marginBottom: 24,
  zIndex: 15,
},

liveSystemRadarGlitchPulseRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 4,
},

neonLiveRadarGlitchPulseDot: {
  width: 6,
  height: 6,
  borderRadius: 3,
  backgroundColor: '#39FF14',
  marginRight: 6,
},
hudTelemetrySystemKicker: {
  color: '#8a8f98',
  fontSize: 8,
  fontWeight: '900',
  letterSpacing: 2,
},
hudCircleCloseButtonTouchTarget: {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: 'rgba(255, 0, 127, 0.05)',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: 'rgba(255, 0, 127, 0.2)',
},
// ✨ CYBERNETIC INTEGRATED GRAPHICS STYLE ENGINE RULES
cyberRadarGraphIllustrationCenterContainer: {
  width: '100%',
  height: 180,
  backgroundColor: '#0d0d0f',
  borderRadius: 14,
  borderWidth: 1,
  borderColor: '#1c1c1f',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 20,
  position: 'relative',
  overflow: 'hidden',
},
radarOuterCircularGlowTrackRing: {
  width: 130,
  height: 130,
  borderRadius: 65,
  borderWidth: 1,
  borderColor: 'rgba(0, 240, 255, 0.15)',
  alignItems: 'center',
  justifyContent: 'center',
},
radarInnerCircularDashedSweepingRing: {
  width: 100,
  height: 100,
  borderRadius: 50,
  borderWidth: 1.5,
  borderColor: 'rgba(0, 240, 255, 0.25)',
  borderStyle: 'dashed',
  alignItems: 'center',
  justifyContent: 'center',
},
radarCoreVectorMatrixTargetOrb: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: 'rgba(0, 240, 255, 0.08)',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: 'rgba(0, 240, 255, 0.4)',
},
radarDataCrosshairHorizontalLine: {
  position: 'absolute',
  width: '80%',
  height: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
},
radarDataCrosshairVerticalLine: {
  position: 'absolute',
  height: 130,
  width: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
},
radarTelemetryDataNodeBlipParticle: {
  position: 'absolute',
  width: 6,
  height: 6,
  borderRadius: 3,
},
radarGraphVectorOverlayLabelCaption: {
  position: 'absolute',
  bottom: 12,
  color: 'rgba(0, 240, 255, 0.4)',
  fontSize: 8,
  fontWeight: '900',
  letterSpacing: 1.2,
},
// DECORATIVE HUD ARCHITECTURE BACKDROP STRINGS
hudBackgroundMatrixLine: {
  position: 'absolute',
  top: 0,
  bottom: 0,
  width: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.015)',
},
hudHorizontalGridLine: {
  position: 'absolute',
  left: 0,
  right: 0,
  height: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.015)',
},
hudCornerPin: {
  position: 'absolute',
  width: 14,
  height: 14,
  borderColor: 'rgba(0, 240, 255, 0.25)',
},
hudFooterDismissActionPillButton: {
  flexDirection: 'row',
  backgroundColor: '#00f0ff',
  paddingVertical: 14,
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 12,
  marginBottom: 24,
  gap: 8,
},
hudFooterDismissActionPillButtonText: {
  color: '#050506',
  fontSize: 12,
  fontWeight: '900',
  letterSpacing: 1.2,
},

  dragHandleBar: {
    width: 32,
    height: 3,
    backgroundColor: '#2E2E33',
    borderRadius: 1.5,
    alignSelf: 'center',
    marginBottom: 20,
  },

  sheetSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00f0ff',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  scrollContent: {
    width: '100%',
    marginBottom: 16,
  },
  techSection: {
    backgroundColor: '#16161A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222226',
    padding: 14,
    marginBottom: 10,
  },
  techRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  techTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  techDesc: {
    fontSize: 12,
    color: '#71717A',
    lineHeight: 16,
  },
  closeSheetButton: {
    width: '100%',
    backgroundColor: '#1C1C21',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#26262B',
  },
  closeButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A1A1AA',
  },

sheetTitle: {
  color: '#ffffff',
  fontSize: 18,
  fontWeight: '800',
},

scrollContent: {
  flex: 1,
  marginTop: 14,
},
// 🎨 ✅ THE COMPLETE INTERIOR TEXT ROW BOXES STYLING FIX: Update inside your stylesheet object
techSection: {
  backgroundColor: '#16161a',       // Lighter dark background for the parameter boxes
  borderRadius: 12,
  padding: 16,                      // Generous internal space to prevent text crowding
  marginBottom: 14,
  borderWidth: 1,
  borderColor: '#26262b',           // Clean edge boundary lines
  width: '100%',
},
techRowHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  marginBottom: 8,                  // Spacing between header title and description copy
},
techTitle: {
  color: '#ffffff',                 // High contrast crisp white section headings
  fontSize: 14,
  fontWeight: '700',
},
techDesc: {
  color: '#a1a1aa',                 // Soft readable silver gray for telemetry readings text
  fontSize: 13,
  lineHeight: 20,                   // Balanced height spacing so lines do not run into each other
  fontWeight: '500',
},

// 🎨 Append these properties to complete the animated frame tracks layer:
radarSweeperLineArmPivotContainer: {
  position: 'absolute',
  width: 130,
  height: 130,
  alignItems: 'center',
  justifyContent: 'center',
},
radarSweeperLineGlowArmPointer: {
  position: 'absolute',
  top: 0,                           // Anchors to the upper radius half
  width: 2,
  height: 65,                       // Extends perfectly from center anchor to edge track
  backgroundColor: '#00f0ff',
  // Adds a sleek trailing vector appearance
  boxShadow: '0px 0px 8px #00f0ff, -2px 0px 4px rgba(0, 240, 255, 0.4)',
},
radarPulseWaveRingEcho: {
  position: 'absolute',
  width: 100,
  height: 100,
  borderRadius: 50,
  borderWidth: 2,
  borderColor: 'rgba(0, 240, 255, 0.4)',
},


});
