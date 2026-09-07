import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { IntentAnchorWidget, DBIntentAnchor } from './IntentAnchorWidget';

export function IntentAnchorScreen() {
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<DBIntentAnchor | null>(null);

  useEffect(() => {
    // 💡 Replace 'analyses_collection' and 'current_session' with your real path references
    const unsubscribe = firestore()
      .collection('analyses_collection')
      .doc('current_session')
      .onSnapshot(
        (documentSnapshot) => {
          if (documentSnapshot.exists) {
            const data = documentSnapshot.data();

            if (data) {
              setAnalysisData({
                intent_anchor: data.intent_anchor,
                metrics: data.metrics, // Attaches matching telemetry metrics saved for this document snapshot
              });
            }
          }
          setLoading(false);
        },
        (error) => {
          console.error('Firestore analysis payload pipeline stream error:', error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00f0ff" />
      </View>
    );
  }

  if (!analysisData || !analysisData.intent_anchor) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No live analysis layout profile parsed on database stream.</Text>
      </View>
    );
  }

  return (
    <IntentAnchorWidget
      analysisData={analysisData}
      onSelectStrategy={(actionId) => console.log('Action sequence executed:', actionId)}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09090B',
  },
  errorText: {
    color: '#71717A',
    fontSize: 14,
  },
});
