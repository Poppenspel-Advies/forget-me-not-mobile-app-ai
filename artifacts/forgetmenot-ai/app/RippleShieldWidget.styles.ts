import { StyleSheet, Dimensions, Platform } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const rippleStyles = StyleSheet.create({
  // ✅ FIX 1: Removed rigid "height: 194" and swapped to dynamic minHeight bounds
  // This allows the element to grow freely while pushing the below divs down natively!
   cardContainer: {
      width: '100%',
      backgroundColor: '#111113',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#1E1E22',
      position: 'relative',
      overflow: 'hidden',

      // 👇 CRITICAL DIRECT FIX: Ensures text never runs into or hides behind the footer bar
      paddingBottom: 56,
      display: 'flex',
      flexDirection: 'column',
    },

  cardBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.12,
    zIndex: 0,
  },
  cardImageOverlayMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 17, 19, 0.4)',
    zIndex: 1,
  },
  // ✅ FIX 2: Swapped "height: 140" out for auto-expanding layouts
  splitLayoutRow: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      paddingHorizontal: 16,
      paddingTop: 16,
      zIndex: 2,
      display: 'flex',
    },

  // --- Left Half: Cascade Progress Chain ---
  // ✅ FIX 3: Unlocked column layout metrics so large text loops grow without clipping
  cascadeSideColumn: {
      flex: 1.25,                     // Takes up more horizontal space for comfortable text lines
      justifyContent: 'flex-start',
    },

  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A855F7',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginLeft: 6,
  },
  alertPhraseBlock: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 18,
    marginBottom: 8,
  },
  dominoChainContainer: {
    width: '100%',
    paddingLeft: 4,
    marginTop: 4,
    gap: 6,                        // Slightly wider vertical text spacing gap parameters
  },
  dominoStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  dominoIndicatorNode: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 10,
    zIndex: 3,
  },
  dominoText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A1A1AA',
    flex: 1,
  },
  dominoConnectorLine: {
    position: 'absolute',
    left: 2.5,
    top: 6,
    width: 1,
    height: 16,
    backgroundColor: '#27272A',
    zIndex: 2,
  },

  // --- Right Half: Threat Matrix Column ---
  // ✅ FIX 4: Removed rigid height so it matches left side dynamic updates perfectly
  riskSideColumn: {
      flex: 0.8,
      backgroundColor: '#16161A',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#222226',
      padding: 12,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
    },

  threatMatrixBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.16,
    zIndex: 0,
  },
  threatMatrixFilterMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22, 22, 26, 0.5)',
    zIndex: 1,
  },
  riskHeaderGroup: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 3,
  },
  riskMetaHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  shieldGraphicFrame: {
    width: 44,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
    position: 'relative',
    zIndex: 3,
  },
  shieldOuterShell: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#A855F7',
    borderTopWidth: 0,
    backgroundColor: 'rgba(168, 85, 247, 0.04)',
  },
  shieldInnerCore: {
    position: 'absolute',
    width: '70%',
    height: '70%',
    borderRadius: 4,
    borderWidth: 1.2,
    borderColor: '#EF4444',
    borderTopWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
  },
  radialScoreText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#EF4444',
  },
  actionDescription: {
    fontSize: 10,
    fontWeight: '500',
    color: '#71717A',
    textAlign: 'center',
    zIndex: 3,
    marginTop: 4,
  },

  // --- Base Footer Row ---
  // ✅ FIX 5: Hard absolute locks ensure active protection banner frames ground perfectly
  footerActionContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 44,                     // 👈 Locks the mitigation active protect banner bar perfectly into place
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: '#1E1E22',
      backgroundColor: '#131316',
      paddingHorizontal: 16,
      zIndex: 5,
    },

  windowMetaText: {
    fontSize: 12,
    color: '#71717A',
  },
  boldHighlight: {
    color: '#00f0ff',
    fontWeight: '700',
  },
  shieldButtonSquare: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.06)',
    borderColor: '#00f0ff',
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // --- Modal Slide Drawer HUD View ---
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 5, 6, 0.88)',
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  dismissArea: {
    flex: 1,
  },
  sheetContainer: {
    width: '100%',
    height: '82%',
    maxHeight: SCREEN_HEIGHT * 0.90,
    backgroundColor: '#0c0c0e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#1c1c1f',
    paddingHorizontal: 20,
    paddingTop: 16,
    display: 'flex',
  },
  dragHandleBar: {
    width: 36,
    height: 4,
    backgroundColor: '#27272a',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A855F7',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  scrollContent: {
    flex: 1,
    width: '100%',
  },
  matrixCard: {
    backgroundColor: '#121214',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1c1c1f',
    padding: 16,
    marginBottom: 14,
    width: '100%',
  },
  matrixHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#62626a',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  visualGraphMapFrame: {
    width: '100%',
    height: 130,
    backgroundColor: '#070709',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1c1c1f',
    position: 'relative',
    overflow: 'hidden',
    marginVertical: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapFlowGridLine: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
  },
  mapConnectionVectorWire: {
    position: 'absolute',
    height: 1.5,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
  },
  mapDependencyNode: {
    position: 'absolute',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121214',
  },
  nodeLabelString: {
    fontSize: 9,
    fontWeight: '800',
  },
  matrixRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1c1c1f',
  },
  matrixLabel: {
    fontSize: 13,
    color: '#a1a1aa',
    fontWeight: '500',
  },
  matrixValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeSheetButton: {
    width: '100%',
    backgroundColor: '#ff007f',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  closeButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#050506',
    letterSpacing: 1,
  },
});
