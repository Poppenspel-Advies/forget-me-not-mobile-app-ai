import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig'; // ⚠️ Adjust this path to point to your actual firebase setup file

export function UserPreferenceTimeline() {
  const [loading, setLoading] = useState(false);
  const [recentSignalsFeed, setRecentSignalsFeed] = useState<any[]>([]);
  const [isFeedLoading, setIsFeedLoading] = useState<boolean>(true);

  useEffect(() => {
    const authInstance = getAuth();
    const activeFirebaseUser = authInstance.currentUser;
    const currentActiveUserId = activeFirebaseUser ? activeFirebaseUser.uid : "Admin_ForgetMeNotAI";

    console.log(`📡 Linking live Recent Context data streams to active channel: [${currentActiveUserId}]`);

    const feedQuery = query(
      collection(db, "analyses"),
      where("user_id", "==", currentActiveUserId),
      orderBy("created_at", "desc")
    );

    const unsubscribeFeed = onSnapshot(feedQuery, (snapshot) => {
      const compiledSignals: any[] = [];
      if (!snapshot.empty) {
        snapshot.docs.forEach((doc) => {
          const docData = doc.data();
          compiledSignals.push({
            id: doc.id,
            title: docData.title || "Context frame logged.",
            omission: docData.omission_item || "Evaluating perimeter logs...",
            preventive: docData.mitigation || "No active warning logged.",
            confidence: docData.metrics?.probability_index || docData.probability || 85,
            tag: docData.tag || "GENERAL",
            color: docData.color || "#00f0ff"
          });
        });
      }
      setRecentSignalsFeed(compiledSignals.slice(0, 3));
      setIsFeedLoading(false);
    }, (error) => {
      console.error("💥 Feed snapshot collection tracking failure:", error);
      setIsFeedLoading(false);
    });

    return () => unsubscribeFeed();
  }, [getAuth().currentUser?.uid]);

  if (loading) {
    return (
      <View style={{ width: '100%', paddingVertical: 20, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#4CD964" />
      </View>
    );
  }

  return (
    <View style={{ width: '100%', paddingHorizontal: 4, marginVertical: 10, display: 'flex' }}>
      <View style={{ flexDirection: 'row', backgroundColor: '#16171D', borderRadius: 16, paddingVertical: 18, paddingHorizontal: 20, borderWidth: 1, borderColor: '#242630', width: '100%' }}>
        <View style={{ width: '100%', marginTop: 8, marginBottom: 24 }}>
          {isFeedLoading ? (
            <View style={{ backgroundColor: 'rgba(23, 23, 27, 0.7)', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#222226', alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#00f0ff" />
              <Text style={{ color: '#737373', fontSize: 11, marginTop: 8 }}>Hydrating matrix parameters...</Text>
            </View>
          ) : recentSignalsFeed.length === 0 ? (
            <View style={{ backgroundColor: 'rgba(23, 23, 27, 0.7)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#222226' }}>
              <Text style={{ color: '#a1a1aa', fontSize: 12, textAlign: 'center', fontStyle: 'italic' }}>
                No active memory omission risks logged on this perimeter channel.
              </Text>
            </View>
          ) : (
            recentSignalsFeed.map((item, index) => (
              <View
                key={item.id}
                style={{
                  backgroundColor: 'rgba(23, 23, 27, 0.65)',
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1.2,
                  borderColor: '#222226',
                  marginBottom: index === recentSignalsFeed.length - 1 ? 0 : 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 14,
                  elevation: 4
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ color: '#00f0ff', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 }} numberOfLines={1}>
                    ⚠️ RISK DETECTED: {item.title.toUpperCase()}
                  </Text>
                  <View style={{ backgroundColor: 'rgba(255, 0, 127, 0.12)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255, 0, 127, 0.25)' }}>
                    <Text style={{ color: '#ff007f', fontSize: 9, fontWeight: '800' }}>{item.confidence}% MATCH</Text>
                  </View>
                </View>

                <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '700', marginBottom: 4 }}>
                  {item.omission}
                </Text>

                <Text style={{ color: '#a1a1aa', fontSize: 11, lineHeight: 16 }}>
                  💡 Action: {item.preventive}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>
    </View>
  );
}
