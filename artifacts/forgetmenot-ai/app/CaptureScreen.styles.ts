import { StyleSheet } from 'react-native';

// ✅ FIX: No more external imports. Hardcoded layout colors that match your theme
const styleTheme = {
  background: '#0A0A0A',
  card: '#171717',
  border: '#262626',
  text: '#FFFFFF',
  tabIconDefault: '#737373'
};

// Explicit context highlights for Category UI states
export const customAccents = {
  pink: '#ff007f',  // People context accent
  gold: '#ffbf00',  // Places context accent
  cyan: '#00f0ff',  // Things context accent
  green: '#10B981', // Gemini shield feedback color
};

export const captureScreenStyles = StyleSheet.create({
  // --- Category Tabs Spacing Container ---
  tagSelectorContainer: {
    width: '100%',
    minHeight: 70,
    marginBottom: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  tagSelectorTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: styleTheme.tabIconDefault,
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 1.2,
  },
  tagSelectorRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  tagChip: {
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    width: '100%',
  },
  tagChipInactive: {
    borderColor: styleTheme.border,
    backgroundColor: styleTheme.card,
  },
  chipIcon: {
    marginRight: 8,
  },
  tagChipText: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  tagChipTextInactive: {
    color: '#E5E5E5', // Clearly visible near-white text contrast for unselected items
    fontWeight: '600',
  },
});
