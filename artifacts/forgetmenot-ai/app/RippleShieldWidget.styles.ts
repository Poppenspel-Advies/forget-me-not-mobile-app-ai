import { StyleSheet, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const rippleStyles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    backgroundColor: '#111113',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E1E22',
    padding: 16,
    marginVertical: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  cardBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.15,
  },
  cardImageOverlayMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 17, 19, 0.3)',
  },
  splitLayoutRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    gap: 16,
    zIndex: 2,
  },

  // --- Left Half: Cascade Progress Chain ---
  cascadeSideColumn: {
    flex: 1.1,
    justifyContent: 'space-between',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A855F7',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginLeft: 6,
  },
  alertPhraseBlock: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 18,
    marginBottom: 12,
  },
  dominoChainContainer: {
    width: '100%',
    paddingLeft: 4,
    marginVertical: 2,
  },
  dominoStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dominoIndicatorNode: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 10,
    zIndex: 2,
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
    height: 14,
    backgroundColor: '#27272A',
    zIndex: 1,
  },

  // --- Right Half: 🌟 UPGRADED THREAT MATRIX SIDE LAYOUT COLUMN ---
  riskSideColumn: {
    flex: 0.9,
    backgroundColor: '#16161A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#222226',
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative', // 🌟 Enables absolute targeting inside this specific panel layer box
    overflow: 'hidden',   // Clips the dedicated threat background within the 10px radius lines
  },

  // 🌟 NEW: Independent backdrop layout target mapping specifically for the Threat Matrix container frame
  threatMatrixBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.22, // Elevated opacity for prominent coordinate tracking grid visibility
  },
  threatMatrixFilterMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22, 22, 26, 0.4)', // Premium local mask filter overlay
  },

  riskHeaderGroup: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 3, // Guarantees header remains interactive above the local background
  },
  riskMetaHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  shieldGraphicFrame: {
    width: 44,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    position: 'relative',
    zIndex: 3, // Pushes metric dial cleanly to top layer focus view
  },
  shieldOuterShell: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#A855F7',
    borderTopWidth: 0,
    backgroundColor: 'rgba(168, 85, 247, 0.05)',
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
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  radialScoreText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EF4444',
  },
  actionDescription: {
    fontSize: 10,
    color: '#71717A',
    textAlign: 'center',
    zIndex: 3,
  },

  // --- Base Footer Row ---
  footerActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1E1E22',
    paddingTop: 12,
    marginTop: 14,
    zIndex: 2,
  },
  windowMetaText: {
    fontSize: 12,
    color: '#71717A',
  },
  boldHighlight: {
    color: '#00f0ff',
    fontWeight: '600',
  },
  shieldButtonSquare: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderColor: '#00f0ff',
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // --- Modal Slide Drawer ---
  backdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 6, 0.85)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheetContainer: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.75,
    backgroundColor: '#111113',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: '#222226',
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  dragHandleBar: {
    width: 32,
    height: 3,
    backgroundColor: '#2E2E33',
    borderRadius: 1.5,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A855F7',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  scrollContent: {
    width: '100%',
    marginBottom: 16,
  },
  matrixCard: {
    backgroundColor: '#16161A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222226',
    padding: 14,
    marginBottom: 12,
  },
  matrixHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#71717A',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  visualGraphMapFrame: {
    width: '100%',
    height: 120,
    backgroundColor: '#0F0F11',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222226',
    position: 'relative',
    overflow: 'hidden',
    marginVertical: 4,
  },
  mapFlowGridLine: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(168, 85, 247, 0.04)',
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
  },
  nodeLabelString: {
    fontSize: 9,
    fontWeight: '700',
  },
  matrixRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F24',
  },
  matrixLabel: {
    fontSize: 13,
    color: '#A1A1AA',
  },
  matrixValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
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
});
