import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { IntentAnchorWidget, DBIntentAnchor } from './IntentAnchorWidget';
import { getAuth } from 'firebase/auth';

export function IntentAnchorScreen() {
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<DBIntentAnchor | null>(null);

  useEffect(() => {
    // Verification Injection: Grab active session references safely
    const authInstance = getAuth();
    const loggedInFirebaseUser = authInstance.currentUser;
    const userId = loggedInFirebaseUser ? loggedInFirebaseUser.uid : "Admin_ForgetMeNotAI";

    console.log(`📡 Collection stream filtering by user field: [${userId}]`);

    // 📡 Updated to use an explicit collection query selector (.where)
    const unsubscribe = firestore()
      .collection('analyses_collection')
      .where('user_id', '==', userId) // 🔑 Explicitly match user fields inside documents
      .onSnapshot(
        (querySnapshot) => {
          // Check if any matching records were found in the database array snapshot
          if (querySnapshot && !querySnapshot.empty) {
            // Target the first document in the matched array list
            const matchedDoc = querySnapshot.docs[0];
            const data = matchedDoc.data();

            if (data) {
              setAnalysisData({
                intent_anchor: data.intent_anchor,
                metrics: data.metrics,
              });
            }
          } else {
            // Clear layout metrics cleanly if no matching user records exist
            setAnalysisData(null);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Firestore analysis query filtering pipeline failure:', error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []); // Runs safely on screen initialization layer

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
