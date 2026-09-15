import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Image as RNImage,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getAuth, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, collection, query, where, orderBy, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import colors from '@/constants/colors';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { fetchGeminiSignalAnalysis, fetchGeminiProfileRadarInsights } from '../config/geminiService';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";


interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
  styles?: any;
  theme?: any;
}

export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const auth = getAuth();
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const storage = getStorage(app);
  const currentFirebaseUser = auth.currentUser;
  const theme = colors.light;
  const userId = currentFirebaseUser ? currentFirebaseUser.uid : "Admin_ForgetMeNotAI";

  const [username, setUsername] = useState<string>("Syncing Identifier...");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [dbStats, setDbStats] = useState({ totalSignals: "00", omissionsAvoided: "00", clarityIndex: "92%" });
  const [lastTwoSignals, setLastTwoSignals] = useState<string[]>(["Awaiting signal sync...", "No logged matrix tracks."]);

  const [localCoordinates, setLocalCoordinates] = useState<string>("Detecting active telemetry...");
  const [dynamicRestaurants, setDynamicRestaurants] = useState<any[]>([]);
  const [dynamicPlaces, setDynamicPlaces] = useState<any[]>([]);
  const [tripPlannerTimeline, setTripPlannerTimeline] = useState<any[] | null>(null);
  const [isLocalDataLoading, setIsLocalDataLoading] = useState<boolean>(false);

  const [calendarSync, setCalendarSync] = useState(true);
  const [messagesSync, setMessagesSync] = useState(true);
  const [placesSync, setPlacesSync] = useState(false);
  const [gentleNudges, setGentleNudges] = useState(true);
  const [signalSensitivity, setSignalSensitivity] = useState(true);

    // ✅ 1. Add missing state tracker variable
    const [isManualRefreshing, setIsManualRefreshing] = useState<boolean>(false);


  // ✅ 2. DEFINE THE CORE RETRIEVAL LOGIC BLOCK (Must come before it is called)
  const executeForceGeminiFetchAndSave = async (cacheDocRef: any, locationStr: string) => {
    console.log("Compiling precise 30-mile proximity culinary mapping loop via Gemini SDK...");

    // Uses the new custom API signature function we created to pull strict array configurations
    try {
      const parsedInsights = await fetchGeminiProfileRadarInsights(locationStr);

      const finalRestaurants = parsedInsights?.restaurants || [];
      const finalPlaces = parsedInsights?.attractions || [];
      const finalItinerary = parsedInsights?.tripPlanner || null;

      // Update Firestore document cache line persistently
      await setDoc(cacheDocRef, {
        location_name: locationStr,
        restaurants: finalRestaurants,
        attractions: finalPlaces,
        tripPlanner: finalItinerary,
        updated_at: new Date().toISOString()
      });

      // Update user interface state registers dynamically
      setDynamicRestaurants(finalRestaurants);
      setDynamicPlaces(finalPlaces);
      setTripPlannerTimeline(finalItinerary);
    } catch (apiErr) {
      console.error("Gemini Radar API compilation exception:", apiErr);
      // Clean safe default arrays to prevent screen from freezing blank if credentials timeout
      setDynamicRestaurants([{ name: "Local Dining Hub", detail: "Nearby Options Mapped", score: "⭐ 4.2" }]);
      setDynamicPlaces([{ name: "Regional Waypoint Landmark", detail: "Scenic Area Spot", score: "Standard" }]);
    }
  };

    // ✅ 2. Add missing manual refetch function handler
    const handleManualSignalRefresh = async () => {
      if (isManualRefreshing || isLocalDataLoading) return;
      setIsManualRefreshing(true);
      console.log("Manual sync request caught. Overwriting data collection layer...");

      // Generates a sanitized database document collection key
      const targetKey = localCoordinates.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const docRef = doc(db, "location_insights_cache", targetKey);

      try {
        // Re-invokes your background execution function with active parameters loop state
        await executeForceGeminiFetchAndSave(docRef, localCoordinates);
      } catch (err) {
        console.error("Manual signal refresh request bypassed:", err);
      } finally {
        setIsManualRefreshing(false);
      }
    };


       useEffect(() => {
         if (!currentFirebaseUser) return;

         const userDocRef = doc(db, "users", userId);
         const unsubsUser = onSnapshot(userDocRef, (docSnap) => {
           if (docSnap.exists()) {
             const data = docSnap.data();

             if (data.email) {
               const splitParts = data.email.split('@');
               const prefixString = splitParts[0] || "seeker";
               setUsername(prefixString.charAt(0).toUpperCase() + prefixString.slice(1));
             } else if (currentFirebaseUser.email) {
               const splitParts = currentFirebaseUser.email.split('@');
               const prefixString = splitParts[0] || "seeker";
               setUsername(prefixString.charAt(0).toUpperCase() + prefixString.slice(1));
             }

             if (data.profile_picture) setProfileImage(data.profile_picture);

             if (data.preferences) {
               setCalendarSync(data.preferences.calendarSync ?? true);
               setMessagesSync(data.preferences.messagesSync ?? true);
               setPlacesSync(data.preferences.placesSync ?? false);
               setGentleNudges(data.preferences.gentleNudges ?? true);
               setSignalSensitivity(data.preferences.signalSensitivity ?? true);
             }
           }
         });

         const analysesQuery = query(
           collection(db, "analyses"),
           where("user_id", "==", "Admin_ForgetMeNotAI"),
           orderBy("created_at", "desc")
         );

         const unsubsAnalyses = onSnapshot(analysesQuery, async (snapshot) => {
           if (!snapshot.empty && snapshot.docs) {
             const totalCount = snapshot.docs.length;
             const pulledTitles: string[] = [];

             const newestDoc = snapshot.docs[0].data();
             let targetLocation = "Active Geolocation Area";

             if (newestDoc?.rawPrompt) {
               const promptText = newestDoc.rawPrompt;
               let extractedWord = "";

               if (promptText.includes(" at ")) {
                 const fragments = promptText.split(" at ");
                 const isolatedEnd = fragments[fragments.length - 1] || "";
                 extractedWord = isolatedEnd.split(".")[0].split(" from")[0];
               } else if (promptText.includes(" in ")) {
                 const fragments = promptText.split(" in ");
                 const isolatedEnd = fragments[fragments.length - 1] || "";
                 extractedWord = isolatedEnd.split(".")[0].split(" from")[0];
               }

               targetLocation = extractedWord.trim() ? extractedWord.trim() : promptText;
             }

             setLocalCoordinates(targetLocation);
             const locationCacheKey = targetLocation.toLowerCase().replace(/[^a-z0-9]/g, "_");
             setIsLocalDataLoading(true);

             // Defined generation sub-routine inside loop for clean recurring trigger capabilities
             const executeForceGeminiFetchAndSave = async (cacheDocRef: any) => {
               console.log("Empty or missing dataset verified. Triggering/Overwriting location matrix via Gemini...");

               const promptContext = `You are an elite localized geographic intelligence assistant. Task: Generate real-world location recommendations based on the target area: "${targetLocation}".
               CRITICAL GEOGRAPHIC CONSTRAINT: Every restaurant, attraction, and landmark generated MUST be situated strictly within a 30-mile proximity radius surrounding the target location center. Do not suggest spots outside this 30-mile perimeter.

               Do not return any explanatory text or markdown backtick block wrappers. Return ONLY a single raw valid stringified JSON object following this exact structural interface definition template:
               {
                 "restaurants": [
                   {"name": "string (Find 1 famous upscale high-end Italian restaurant strictly within 30 miles of this target)", "detail": "string (Cuisine style, specific neighborhood area or street address info)", "score": "string (Rating and cost marker)"},
                   {"name": "string (Find 1 authentic Spanish tapas or rooftop venue strictly within 30 miles of this target)", "detail": "string (Ambience, neighborhood location and menu overview)", "score": "string (Rating and cost marker)"},
                   {"name": "string (Find 1 famous expensive high-end US steakhouse strictly within 30 miles of this target)", "detail": "string (Chic lounge vibe and premium steak cuts overview)", "score": "string (Rating and cost marker)"}
                 ],
                 "attractions": [
                   {"name": "string (Most popular historical, cultural, or spiritual landmark plaza within a 30-mile radius)", "detail": "string (Local historic context)", "score": "string (Exact entry cost & approximate time coverage needed to tour the whole place)"},
                   {"name": "string (Most popular zoo, wildlife center, aquarium, or canyon nature park within a 30-mile radius)", "detail": "string (Eco summary)", "score": "string (Exact entry cost & approximate time coverage needed to tour the whole place)"},
                   {"name": "string (Most popular landmark pioneer park, living-history village, or local heritage museum within a 30-mile radius)", "detail": "string (Excursion details)", "score": "string (Exact entry cost & approximate time coverage needed to tour the whole place)"}
                 ],
                 "tripPlanner": [
                   {"day": "Day 1 - Core", "task": "string (Actionable task itinerary blueprint line combining the 30-mile landmark plaza and the steakhouse)"},
                   {"day": "Day 2 - Canyon", "task": "string (Actionable task itinerary blueprint line combining the 30-mile canyon/nature park and the Italian restaurant)"},
                   {"day": "Day 3 - Heritage", "task": "string (Actionable task itinerary blueprint line combining the 30-mile heritage village and the Spanish restaurant)"}
                 ]
               }`;

               //const geminiRawResponse = await fetchGeminiSignalAnalysis(promptContext, "things");

               const geminiRawResponse = await fetchGeminiProfileRadarInsights(targetLocation);

               let parsedInsights: any = { restaurants: [], attractions: [], tripPlanner: [] };

               if (typeof geminiRawResponse === "object" && geminiRawResponse !== null) {
                 parsedInsights = geminiRawResponse;
               } else if (typeof geminiRawResponse === "string") {
                 const cleanJsonStr = geminiRawResponse.replace(/```json/g, "").replace(/```/g, "").trim();
                 parsedInsights = JSON.parse(cleanJsonStr);
               }

               const finalRestaurants = parsedInsights.restaurants || [];
               const finalPlaces = parsedInsights.attractions || [];
               const finalItinerary = parsedInsights.tripPlanner || null;

               // Push fresh, structured data parameters down to the database record row instantly
               await setDoc(cacheDocRef, {
                 location_name: targetLocation,
                 restaurants: finalRestaurants,
                 attractions: finalPlaces,
                 tripPlanner: finalItinerary,
                 updated_at: new Date().toISOString()
               });

               setDynamicRestaurants(finalRestaurants);
               setDynamicPlaces(finalPlaces);
               setTripPlannerTimeline(finalItinerary);
             };

             try {
               const cacheDocRef = doc(db, "location_insights_cache", locationCacheKey);
               const cachedSnap = await getDoc(cacheDocRef);

               if (cachedSnap.exists()) {
                 const cachedData = cachedSnap.data();

                 // ✅ VERIFICATION LAYER: If document exists but is empty or corrupt, force re-trigger
                 if (!cachedData.restaurants || cachedData.restaurants.length === 0 || !cachedData.attractions || cachedData.attractions.length === 0) {
                   await executeForceGeminiFetchAndSave(cacheDocRef);
                 } else {
                   setDynamicRestaurants(cachedData.restaurants || []);
                   setDynamicPlaces(cachedData.attractions || []);
                   setTripPlannerTimeline(cachedData.tripPlanner || null);
                 }
                 setIsLocalDataLoading(false);
               } else {
                 // Trigger loop if document key is completely absent from database collection tracking indexes
                 await executeForceGeminiFetchAndSave(cacheDocRef);
                 setIsLocalDataLoading(false);
               }
             } catch (error) {
               console.error("Dynamic location correction execution error:", error);
               setIsLocalDataLoading(false);
             }

             snapshot.docs.slice(0, 2).forEach(doc => {
               pulledTitles.push(doc.data().title || doc.data().analysis?.signal || "Context frame event logged.");
             });
             setLastTwoSignals(pulledTitles);

             let avoidedCount = 0;
             snapshot.docs.forEach(doc => {
               if ((doc.data().analysis?.confidence || 85) > 80) avoidedCount++;
             });

             setDbStats({
               totalSignals: totalCount < 10 ? `0${totalCount}` : `${totalCount}`,
               omissionsAvoided: avoidedCount < 10 ? `0${avoidedCount}` : `${avoidedCount}`,
               clarityIndex: totalCount > 0 ? "94%" : "92%"
             });
           }
         });

         return () => {
           unsubsAnalyses();
           unsubsUser();
         };
       }, [userId, currentFirebaseUser]);

    const handleProfileImageUpload = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
          alert("System permissions required to update your profile image asset map.");
          return;
        }

       const result = await ImagePicker.launchImageLibraryAsync({
             mediaTypes: ImagePicker.MediaTypeOptions.Images,
             allowsEditing: true,
             aspect: [1,1], // Strict square boundary mapping
             quality: 0.6, // Compressed to keep payload safe for Firestore string storage limits
             base64: true, // ✅ CRITICAL WEB PERSISTENCE FIX: Forces Base64 generation natively
           });

         // ✅ FIXED: Safely evaluate assets array mapping length to intercept new selection events
            if (!result.canceled && result.assets && result.assets.length > 0) {
                  const selectedAsset = result.assets[0];
                  let finalizedImageUri = selectedAsset.uri;

                  // 🌐 MULTIPLATOR COMPLIANCE LAYER: Handles clean Base64 rendering natively on the Web platform
                  if (Platform.OS === 'web') {
                    setIsLocalDataLoading(true); // Re-uses the layout activity node spinner during background conversions
                    try {
                      // Creating an isolated hardware canvas wrapper element to process raw pixels directly
                      finalizedImageUri = await new Promise((resolve, reject) => {
                        const imgElement = new Image();
                        imgElement.crossOrigin = "anonymous";
                        imgElement.src = selectedAsset.uri;

                        imgElement.onload = () => {
                          const htmlCanvas = document.createElement('canvas');
                          htmlCanvas.width = imgElement.naturalWidth || imgElement.width;
                          htmlCanvas.height = imgElement.naturalHeight || imgElement.height;

                          const canvasContext = htmlCanvas.getContext('2d');
                          if (canvasContext) {
                            canvasContext.drawImage(imgElement, 0, 0);
                            // Forces exact image format strings extraction path data structures
                            const base64DataString = htmlCanvas.toDataURL('image/jpeg', 0.5);
                            resolve(base64DataString);
                          } else {
                            reject(new Error("Could not initialize local canvas context layer."));
                          }
                        };

                        imgElement.onerror = (err) => {
                          console.error("Canvas element loading exception:", err);
                          reject(err);
                        };
                      });
                      console.log("🔒 Web canvas compilation verified successfully. Payload starts with data:image/jpeg");
                    } catch (readError) {
                      console.error("Web Canvas fallback extractor execution issue:", readError);
                    } finally {
                      setIsLocalDataLoading(false);
                    }
                  }

                  // Sync data changes directly to local layout hooks registers instantly
                  setProfileImage(finalizedImageUri);

                  // 🛡️ PUSH PERSISTENT METRICS TO CLOUD DOCUMENTS
                  try {
                    console.log("Overwriting raw index.html structures with clear data:image/jpeg pixels wrapper strings...");
                    await setDoc(doc(db, "users", userId), {
                      profile_picture: finalizedImageUri,
                      email: currentFirebaseUser?.email || "arpitarobertpattinson@gmail.com"
                    }, { merge: true });
                    console.log("🛡️ Success: Verified data string pushed down to Cloud DB user record row.");
                  } catch (e) {
                    console.error("💥 Error syncing avatar string up to Firebase cloud dictionary:", e);
                  }
                }
              };

     const updatePreferenceInCloud = async (key: string, newValue: boolean) => {
       if (!currentFirebaseUser) return;
       try {
         await setDoc(doc(db, "users", userId), {
           preferences: {
             calendarSync: key === 'calendar' ? newValue : calendarSync,
             messagesSync: key === 'messages' ? newValue : messagesSync,
             placesSync: key === 'places' ? newValue : placesSync,
             gentleNudges: key === 'nudges' ? newValue : gentleNudges,
             signalSensitivity: key === 'sensitivity' ? newValue : signalSensitivity
           }
         }, { merge: true });
       } catch (e) {
         console.error("💥 Error syncing preference updates:", e);
       }
     };

     const executeSessionSignOut = async () => {
       try {
         await signOut(auth);
         onNavigate('home');
       } catch (error) {
         console.error("Sign out sequence interrupted.");
       }
     };

   return (
     <View style={localStyles.screen}>
       <View style={localStyles.header}>
         <View style={localStyles.headerRow}>
           <Pressable onPress={() => onNavigate('Home')} style={localStyles.iconButton}>
             <Feather name="arrow-left" size={20} color="#FFFFFF" />
           </Pressable>
           <View style={localStyles.headerCopy}>
             <Text style={localStyles.headerTitle}>Your space</Text>
             <Text style={localStyles.headerSubtitle}>{currentFirebaseUser?.email || "Verification Pending Channel"}</Text>
           </View>
         </View>
       </View>

       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={localStyles.innerScroll}>
         <View style={localStyles.profileHero}>
           <Pressable onPress={handleProfileImageUpload} style={localStyles.avatarTouchableAnchor}>
             <View style={localStyles.profileAvatar}>
               {profileImage ? (
                 <RNImage
                   // ✅ THE FIX: Evaluates the source format dynamically.
                   // If it already has the prefix data string, pass it directly;
                   // if it's a raw Base64 code string from the database, wrap it safely!
                   source={{
                     uri: profileImage.startsWith('data:') || profileImage.startsWith('http')
                       ? profileImage
                       : `data:image/jpeg;base64,${profileImage}`
                   }}
                   style={localStyles.profileImageAsset}
                 />
               ) : (
                 <Text style={localStyles.profileAvatarText}>{username.charAt(0).toUpperCase()}</Text>
               )}
               <View style={localStyles.profileSpark}>
                 <Feather name="camera" size={12} color="#050506" />
               </View>
             </View>

           </Pressable>
           <Text style={localStyles.profileName}>{username}</Text>
           <Text style={localStyles.profileHandle}>THE SIGNAL SEEKER · ACTIVE PROFILE</Text>
         </View>

         <View style={localStyles.profileStats}>
           <View><Text style={localStyles.profileStatValue}>{dbStats.totalSignals}</Text><Text style={localStyles.profileStatLabel}>signals held</Text></View>
           <View style={localStyles.statDivider} />
           <View><Text style={localStyles.profileStatValue}>{dbStats.omissionsAvoided}</Text><Text style={localStyles.profileStatLabel}>omissions avoided</Text></View>
           <View style={localStyles.statDivider} />
           <View><Text style={localStyles.profileStatValue}>{dbStats.clarityIndex}</Text><Text style={localStyles.profileStatLabel}>signal clarity</Text></View>
         </View>

         <View style={localStyles.sectionHeaderRow}>
           <Text style={localStyles.eyebrow}>CONNECTIONS</Text>
           <Text style={localStyles.sectionTitle}>What I can see</Text>
         </View>

         <View style={localStyles.settingCard}>
           <View style={localStyles.settingRow}>
             <View style={localStyles.settingIcon}><Feather name="calendar" size={17} color={theme.cyan} /></View>
             <View style={localStyles.settingCopy}><Text style={localStyles.settingTitle}>Calendar</Text><Text style={localStyles.settingDetail}>Your events and movement logs</Text></View>
             <Pressable onPress={() => { setCalendarSync(!calendarSync); updatePreferenceInCloud('calendar', !calendarSync); }} style={[localStyles.toggle, calendarSync && localStyles.toggleOn]}><View style={[localStyles.toggleKnob, calendarSync && localStyles.toggleKnobOn]} /></Pressable>
           </View>

           <View style={[localStyles.settingRow, { minHeight: 92, paddingVertical: 14, alignItems: 'flex-start' }]}>
             <View style={[localStyles.settingIcon, { marginTop: 2 }]}><Feather name="message-square" size={17} color={theme.pink} /></View>
             <View style={localStyles.settingCopy}>
               <Text style={localStyles.settingTitle}>Messages (Last 2 Live Signals)</Text>
               {lastTwoSignals.map((signalText, index) => (
                 <Text key={index} style={localStyles.liveSignalTraceItem} numberOfLines={1}>• {signalText}</Text>
               ))}
             </View>
             <Pressable onPress={() => { setMessagesSync(!messagesSync); updatePreferenceInCloud('messages', !messagesSync); }} style={[localStyles.toggle, messagesSync && localStyles.toggleOn]}><View style={[localStyles.toggleKnob, messagesSync && localStyles.toggleKnobOn]} /></Pressable>
           </View>

           <View style={[localStyles.settingRow, { borderBottomWidth: 0 }]}>
             <View style={localStyles.settingIcon}><Feather name="map-pin" size={17} color={theme.cyan} /></View>
             <View style={localStyles.settingCopy}><Text style={localStyles.settingTitle}>Places & local radar</Text><Text style={localStyles.settingDetail}>Local parameters surrounding your destination</Text></View>
             <Pressable onPress={() => { setPlacesSync(!placesSync); updatePreferenceInCloud('places', !placesSync); }} style={[localStyles.toggle, placesSync && localStyles.toggleOn]}><View style={[localStyles.toggleKnob, placesSync && localStyles.toggleKnobOn]} /></Pressable>
           </View>
         </View>

// Section 2 of 3: Local Scope Radar Telemetry Lists, Maps, and Trip Planner Render Arrays
               <View style={localStyles.sectionHeaderRow}>
                 <Text style={localStyles.eyebrow}>LOCAL DATA SCOPES</Text>
                 <Text style={localStyles.sectionTitle}>Contextual Radar Parameters</Text>

                {/* ✅ NATIVE RE-TRIGGER BUTTON: Zero-widget layout compliance */}
                          <Pressable
                            onPress={handleManualSignalRefresh}
                            disabled={isManualRefreshing || isLocalDataLoading}
                            style={({ pressed }) => [
                              {
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                                backgroundColor: pressed ? '#222226' : '#171717',
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: '#262626'
                              }
                            ]}
                          >
                            {isManualRefreshing || isLocalDataLoading ? (
                              <ActivityIndicator size="small" color="#00f0ff" style={{ transform: [{ scale: 0.75 }] }} />
                            ) : (
                              <Feather name="refresh-cw" size={12} color="#00f0ff" />
                            )}
                            <Text style={{ color: '#00f0ff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>
                              {isManualRefreshing || isLocalDataLoading ? 'SYNCING...' : 'REFRESH'}
                            </Text>
                          </Pressable>
                        </View>

               <View style={localStyles.mapPlacementBox}>
                 <Text style={localStyles.mapOverlayFloatingLabel}>🎯 ACTIVE GEOLOCATION TELEMETRY CHANNEL</Text>
                 <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                   <Feather name="compass" size={18} color="#00f0ff" style={{ marginBottom: 6 }} />
                   <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '700', textAlign: 'center', paddingHorizontal: 12 }} numberOfLines={2}>
                     {localCoordinates}
                   </Text>
                   <Text style={{ color: '#737373', fontSize: 10, marginTop: 4 }}>Dynamic Intent Signal mapping engine active</Text>
                 </View>
               </View>

               <View style={localStyles.placesTelemetryBox}>
                 {isLocalDataLoading ? (
                   <View style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
                     <ActivityIndicator size="small" color="#00f0ff" />
                     <Text style={{ color: '#737373', fontSize: 11, marginTop: 10 }}>Querying Gemini intelligence layer...</Text>
                   </View>
                 ) : (
                   <>
                     <Text style={localStyles.placesSubHeader}>🍕 DYNAMIC FINE DINING (ITALIAN / SPANISH / US)</Text>
                     {dynamicRestaurants.length === 0 ? (
                       <Text style={{ color: '#737373', fontSize: 11, paddingVertical: 8, fontStyle: 'italic' }}>No active restaurants map tracks resolved.</Text>
                     ) : (
                       dynamicRestaurants.map((restaurant, idx) => (
                         <View key={`rest-${idx}`} style={[localStyles.placeRowItem, idx === dynamicRestaurants.length - 1 && { borderBottomWidth: 0 }]}>
                           <View style={localStyles.placeIndicatorDotPink} />
                           <View style={{ flex: 1 }}>
                             <Text style={localStyles.placeMainName}>{restaurant.name}</Text>
                             <Text style={localStyles.placeSecondaryDetail}>{restaurant.detail}</Text>
                           </View>
                           <Text style={localStyles.placePriceRatingInfo}>{restaurant.score}</Text>
                         </View>
                       ))
                     )}

                     <Text style={[localStyles.placesSubHeader, { marginTop: 18 }]}>🏔️ TOP POPULAR ATTRACTIONS (COST & DURATION)</Text>
                     {dynamicPlaces.length === 0 ? (
                       <Text style={{ color: '#737373', fontSize: 11, paddingVertical: 8, fontStyle: 'italic' }}>No location landmarks mapped.</Text>
                     ) : (
                       dynamicPlaces.map((place, idx) => (
                         <View key={`place-${idx}`} style={[localStyles.placeRowItem, idx === dynamicPlaces.length - 1 && { borderBottomWidth: 0 }]}>
                           <View style={localStyles.placeIndicatorDotCyan} />
                           <View style={{ flex: 1 }}>
                             <Text style={localStyles.placeMainName}>{place.name}</Text>
                             <Text style={localStyles.placeSecondaryDetail}>{place.detail}</Text>
                           </View>
                           <Text style={localStyles.placePriceRatingInfo}>{place.score}</Text>
                         </View>
                       ))
                     )}
                   </>
                 )}
               </View>

               {tripPlannerTimeline && !isLocalDataLoading && (
                 <View style={{ marginBottom: 24 }}>
                   <View style={localStyles.sectionHeaderRow}>
                     <Text style={localStyles.eyebrow}>BLUEPRINT MATRIX</Text>
                     <Text style={localStyles.sectionTitle}>Dynamic Trip Planner Timeline</Text>
                   </View>
                   <View style={{ backgroundColor: '#171717', borderRadius: 15, borderWidth: 1, borderColor: '#262626', padding: 14 }}>
                     {tripPlannerTimeline.map((step, idx) => (
                       <View key={`step-${idx}`} style={{ flexDirection: 'row', gap: 12, paddingVertical: 10, borderBottomWidth: idx === tripPlannerTimeline.length - 1 ? 0 : 1, borderBottomColor: '#262626' }}>
                         <View style={{ backgroundColor: 'rgba(0, 240, 255, 0.08)', borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, height: 24, justifyContent: 'center' }}>
                           <Text style={{ color: '#00f0ff', fontSize: 9, fontWeight: '900' }}>{step.day}</Text>
                         </View>
                         <Text style={{ color: '#bdb8c5', fontSize: 12, lineHeight: 17, flex: 1 }}>{step.task}</Text>
                       </View>
                     ))}
                   </View>
                 </View>
               )}

// Section 3 of 3: User Preferences Config Toggles, Session Closures, and File Closing Declarations
                <View style={localStyles.sectionHeaderRow}>
                  <Text style={localStyles.eyebrow}>PREFERENCES</Text>
                  <Text style={localStyles.sectionTitle}>Shape the signal</Text>
                </View>

                <View style={localStyles.settingCard}>
                  <View style={localStyles.settingRow}>
                    <View style={[localStyles.settingIcon, { backgroundColor: 'rgba(255, 191, 0, 0.12)' }]}><Feather name="bell" size={17} color={theme.gold} /></View>
                    <View style={localStyles.settingCopy}><Text style={localStyles.settingTitle}>Gentle nudges</Text><Text style={localStyles.settingDetail}>{gentleNudges ? "Only interrupt when it matters" : "Muted perimeter radar check variance alerts"}</Text></View>
                    <Pressable onPress={() => { setGentleNudges(!gentleNudges); updatePreferenceInCloud('nudges', !gentleNudges); }} style={[localStyles.toggle, gentleNudges && localStyles.toggleOn]}><View style={[localStyles.toggleKnob, gentleNudges && localStyles.toggleKnobOn]} /></Pressable>
                  </View>

                  <View style={[localStyles.settingRow, { borderBottomWidth: 0 }]}>
                    <View style={[localStyles.settingIcon, { backgroundColor: 'rgba(57, 255, 20, 0.12)' }]}><Feather name="sliders" size={17} color={theme.green} /></View>
                    <View style={localStyles.settingCopy}><Text style={localStyles.settingTitle}>Signal sensitivity</Text><Text style={localStyles.settingDetail}>{signalSensitivity ? "Balanced · fewer, sharper predictions" : "Maximum tracking · hypersensitive velocity detection"}</Text></View>
                    <Pressable onPress={() => { setSignalSensitivity(!signalSensitivity); updatePreferenceInCloud('sensitivity', !signalSensitivity); }} style={[localStyles.toggle, signalSensitivity && localStyles.toggleOn]}><View style={[localStyles.toggleKnob, signalSensitivity && localStyles.toggleKnobOn]} /></Pressable>
                  </View>
                </View>

                <View style={{ width: '100%', marginTop: 12, marginBottom: 12 }}>
                  <Pressable
                    onPress={executeSessionSignOut}
                    style={({ pressed }) => [
                      localStyles.logoutButtonContainer,
                      pressed && { backgroundColor: 'rgba(255, 0, 85, 0.18)' }
                    ]}
                  >
                    <Feather name="log-out" size={14} color="#ff0055" />
                    <Text style={localStyles.logoutButtonText}>TERMINATE SECURITY SESSION</Text>
                  </Pressable>
                </View>

                <Text style={localStyles.version}>FORGETMENOT AI · CONTEXT HYDRATED · v0.1.0</Text>
              </ScrollView>
            </View>
          );
        }



const localStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#050506',
    width: '100%',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#050506',
    paddingTop: Platform.OS === 'web' ? 30 : 50,
  },
  headerRow: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerCopy: { flex: 1 },
  headerTitle: { color: '#ffffff', fontSize: 21, fontWeight: '700', letterSpacing: -0.45 },
  headerSubtitle: { color: '#737373', fontSize: 12, marginTop: 3 },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#262626'
  },
  innerScroll: {
    paddingHorizontal: 20,
    paddingBottom: 140,
    paddingTop: 8,
  },
  profileHero: { alignItems: 'center', paddingTop: 5, paddingBottom: 22 },
  avatarTouchableAnchor: { borderRadius: 44, overflow: 'hidden', marginBottom: 12 },
  profileAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255, 0, 127, 0.08)',
    borderWidth: 1.2,
    borderColor: '#ff007f',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileImageAsset: { width: '100%', height: '100%', borderRadius: 44 },
  profileAvatarText: { color: '#ff007f', fontSize: 34, fontWeight: '700' },
  profileSpark: {
    position: 'absolute',
    right: -2,
    bottom: 3,
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: '#00f0ff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileName: { color: '#ffffff', fontSize: 22, fontWeight: '700', marginTop: 4 },
  profileHandle: { color: '#737373', fontSize: 9, letterSpacing: 1.1, fontWeight: '700', marginTop: 6 },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#262626',
    marginBottom: 25
  },
  profileStatValue: { color: '#ffffff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  profileStatLabel: { color: '#737373', fontSize: 9, marginTop: 4, textAlign: 'center' },
  statDivider: { width: 1, height: 25, backgroundColor: '#262626' },
  sectionHeaderRow: { marginBottom: 12, marginTop: 14 },
  eyebrow: { color: '#737373', fontSize: 9, letterSpacing: 1.45, fontWeight: '700', marginBottom: 6 },
  sectionTitle: { color: '#ffffff', fontSize: 19, fontWeight: '700', letterSpacing: -0.4 },
  settingCard: { backgroundColor: '#171717', borderWidth: 1, borderColor: '#262626', borderRadius: 15, paddingHorizontal: 14, marginBottom: 24 },
  settingRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#262626', gap: 11 },
  settingIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(0, 240, 255, 0.12)', alignItems: 'center', justifyContent: 'center' },
  settingCopy: { flex: 1 },
  settingTitle: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  settingDetail: { color: '#737373', fontSize: 10, marginTop: 4 },
  liveSignalTraceItem: { color: '#a1a1aa', fontSize: 11, fontStyle: 'italic', marginTop: 4, paddingRight: 6 },
  toggle: { width: 37, height: 22, borderRadius: 11, backgroundColor: '#262626', padding: 3, justifyContent: 'center' },
  toggleOn: { backgroundColor: '#39FF14' },
  toggleKnob: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#737373' },
  toggleKnobOn: { alignSelf: 'flex-end', backgroundColor: '#050506' },
  logoutButtonContainer: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(255, 0, 85, 0.06)',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#ff0055',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutButtonText: { color: '#ff0055', fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },
  version: { color: '#737373', fontSize: 9, letterSpacing: 1.1, textAlign: 'center', marginTop: 16 },
  mapPlacementBox: {
    width: '100%',
    height: 140,
    backgroundColor: '#0d0d11',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f1f24',
    padding: 12,
    marginBottom: 12
  },
  mapOverlayFloatingLabel: {
    color: '#00f0ff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2
  },
  placesTelemetryBox: {
    backgroundColor: '#131316',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#222226',
    padding: 14,
    marginBottom: 24
  },
  placesSubHeader: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10
  },
  placeRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f24',
    gap: 10
  },
  placeIndicatorDotPink: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ff007f' },
  placeIndicatorDotCyan: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00f0ff' },
  placeMainName: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  placeSecondaryDetail: { color: '#8a8f98', fontSize: 11, marginTop: 2 },
  placePriceRatingInfo: { color: '#ffd700', fontSize: 11, fontWeight: '600' }
});
