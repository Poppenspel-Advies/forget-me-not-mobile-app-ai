import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, Modal, TextInput, Pressable, StyleSheet, Dimensions, Platform, Alert, TouchableOpacity  } from 'react-native';
import { Feather } from '@expo/vector-icons';

// FIREBASE CLOUD INFRASTRUCTURE IMPORTS
import { db } from '../config/firebaseConfig';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { saveOrUpdateSignalAnalysis, deleteSignalAnalysis } from '../config/signalDataController';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// APPMINIMALIST HIGH-CONTRAST TOKENS
const theme = { cyan: '#00f0ff', background: '#050506' };
const customAccents = { pink: '#ff007f', gold: '#ffbf00', cyan: '#00f0ff' };

interface CapturedItem {
  id: string;
  title: string;
  detail: string;
  tag: string;
  color: string;
}

interface MemoryScreenProps {
  onBack: () => void;
  captured: CapturedItem[];
}

// --- SUBCOMPONENT HEADER ELEMENTS LAYOUT ---
function ScreenHeader({ title, subtitle, onBack }: { title: string; subtitle: string; onBack: () => void }) {
  return (
    <View style={styles.headerRow}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Feather name="arrow-left" size={16} color="#FFFFFF" />
      </Pressable>
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function SectionTitle({ eyebrow, title, action }: { eyebrow: string; title: string; action: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View>
        <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
        <Text style={styles.sectionMainTitle}>{title}</Text>
      </View>
      <View style={styles.sectionActionBadge}>
        <Text style={styles.sectionActionText}>{action}</Text>
      </View>
    </View>
  );
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.pillContainer, { borderColor: color, backgroundColor: `${color}15` }]}>
      <Text style={[styles.pillText, { color: color }]}>{label}</Text>
    </View>
  );
}

function FGlobe({ size }: { size: number }) {
  return (
    <View style={[styles.globeFrame, { width: size, height: size, borderRadius: size / 2 }]}>
      <Feather name="globe" size={size * 0.5} color="#00f0ff" />
    </View>
  );
}

// =========================================================================
// 🛡️ DYNAMIC MEMORY ENGINE CONTAINER - WITH FIREBASE REAL-TIME SYNC
// =========================================================================
export function MemoryScreen({ onBack, captured = [] }: MemoryScreenProps) {
  const userId = "Admin_ForgetMeNotAI";
  const [dbSignals, setDbSignals] = useState<CapturedItem[]>([]);
  const [loading, setLoading] = useState(true);

       // 🌟 FILTER TAB STATE MANAGER: Keeps track of 'All', 'People', 'Places', 'Things'
      const [activeTab, setActiveTab] = useState<'All' | 'People' | 'Places' | 'Things'>('All');
      // 🌟 ADDED: State controls for the inline editing drawer modal overlay
      const [editModalVisible, setEditModalVisible] = useState(false);
      const [selectedEditId, setSelectedEditId] = useState<string | null>(null);
      const [editTitleText, setEditTitleText] = useState('');
      const [editDetailText, setEditDetailText] = useState('');
      const [isSavingEdit, setIsSavingEdit] = useState(false);
      // 🌟 TOAST & CONFIRMATION STATES: Manages notifications and deletion safety states
      const [toastMessage, setToastMessage] = useState<string | null>(null);
      const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
      // 🌟 LOADING ACCENTS: Manages inline operation spinners and UI toast trackers
      const [isProcessingAction, setIsProcessingAction] = useState(false);
      const [editMitigationText, setEditMitigationText] = useState('');
      const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);



      // 🌟 NATIVE TRIGGER TOAST TIMER
      const triggerToast = (msg: string) => {
          setToastMessage(msg);
          setTimeout(() => setToastMessage(null), 3000); // Fades out automatically after 3 seconds
      };

  // 🌟 UPGRADED: Pulls raw prompt, explanation paragraph, and step-by-step instructions separately
  const handleOpenEditDrawer = async (item: CapturedItem) => {
    try {
      setSelectedEditId(item.id);
      setIsProcessingAction(true);

      const docRef = doc(db, "analyses", item.id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        Alert.alert("Error", "Target record data could not be pulled from server channels.");
        setIsProcessingAction(false);
        return;
      }

       const fullData = docSnap.data();

         // 🔍 Print payload to terminal to verify keys
         console.log("✨ ACTIVE EDIT SNAPSHOT payload:", fullData);

          // 1️⃣ FIELD 1 FIX (The original typed signal): Target the root rawPrompt or query parameter explicitly
          const finalRawPrompt =
            fullData.rawPrompt ||
            fullData.text ||
            fullData.title ||
            item.title ||
            "";
          setEditTitleText(finalRawPrompt);

          // 2️⃣ FIELD 2 FIX (Strategic Cognitive Details): Inspect the child nesting metrics objects explicitly
          const finalExplanation =
            fullData.analysis?.explanation ||
            fullData.gemini_signal_read?.structural_explanation ||
            fullData.detail ||
            "System intelligence sequence active.";
          setEditDetailText(finalExplanation);

          // 3️⃣ FIELD 3 FIX (Preventive Blueprint Instructions): Exhaustively look up matching nested arrays
          const finalMitigation =
            fullData.analysis?.preventiveAction ||
            fullData.gemini_signal_read?.preventive_action_blueprint ||
            fullData.mitigation ||
            (Array.isArray(fullData.dominoes) ? fullData.dominoes.join('\n') : null) ||
            "Verify physical checkpoints manually.";
          setEditMitigationText(finalMitigation);

      setEditModalVisible(true);

    } catch (error) {
      console.error("💥 Error re-hydrating text variables for modal initialization:", error);
    } finally {
      setIsProcessingAction(false);
    }
  };

const handleExecuteThemedDelete = async () => {
  if (!deleteTargetId) return;

  try {
    setIsProcessingAction(true); // Turns on your interactive button spinner lock tracks
    console.log(`🔥 Executing server-side deletion for ID: [${deleteTargetId}]`);

    // Call your decoupled data controller function directly
    await deleteSignalAnalysis(deleteTargetId);

    // Reset views and trigger your system toast
    setDeleteTargetId(null);
    triggerToast("Signal map context deleted successfully.");
  } catch (error) {
    console.error("💥 Hard deletion execution failure:", error);
    Alert.alert("Deletion Error", "Could not clear data track from the server.");
  } finally {
    setIsProcessingAction(false);
  }
};



  // ====================================================================
    // ⚡ THE MASTER COMBINED ROUTER: HANDLES EDITS & DELETES INLINE BY ID
    // ====================================================================
    /**
     * Processes data updates and hard deletions completely inline on the Memory Screen
     * @param docId The target Firestore document string key identifier.
     * @param options Configuration object defining active action pipeline intents.
     */
    const handleSignalActionById = async (docId: string, options: { isEdit?: boolean; isDelete?: boolean }) => {
      if (!docId) return;

      // ✏️ CASE 1: INLINE DYNAMIC RE-ANALYSIS UPDATE PIPELINE
      if (options.isEdit) {
        setIsProcessingAction(true);
        try {
          console.log(`📡 Inline Edit Request: Pulling base variables for doc ID: [${docId}]`);

          // 1. Fetch historical raw data to extract the user's base prompt
          const docRef = doc(db, "analyses", docId);
          const docSnap = await getDoc(docRef);

          if (!docSnap.exists()) {
            Alert.alert("Error", "Target record no longer exists on the cloud server platforms.");
            setIsProcessingAction(false);
            return;
          }

          const historicalData = docSnap.data();
          const promptString = historicalData.rawPrompt || historicalData.title || "";
          const originalTag = historicalData.categoryTag || historicalData.tag || "practical";

          console.log(`🔮 Inline Edit: Executing saveOrUpdateSignalAnalysis controller on ID: [${docId}]`);

          // 2. Invoke separate module to run Gemini again and rewrite Firestore
          const result = await saveOrUpdateSignalAnalysis({
            text: promptString,
            selectedTag: originalTag,
            userId: userId,
            editingRecordId: docId, // 🧠 Forces inline overwrite instead of creation save!
            customAccents: customAccents // Ensure customAccents is visible to this file
          });

          console.log("✨ ACTIVE INLINE RE-ANALYSIS COMPLETE. NEW DATA:", result.geminiData);

          triggerToast(`Signal re-calculated successfully.`);
          Alert.alert("Inline Update Complete", `Gemini has refreshed diagnostic parameters for: "${result.geminiData.signal}"`);
          // ✅ THE MODAL RESTORATION OVERLAY TRIGGER ACTION VECTOR:
                // Feeds the freshly compiled Gemini outputs straight into your visual modal input state layers!
                setSelectedEditId(docId);
                setEditTitleText(promptString);

               // Field 3: Read-only preventive mitigation action blueprint instructions
                      setEditMitigationText(
                        result.geminiData?.preventiveAction ||
                        "Verify physical checkpoints manually."
                      );
                setEditDetailText(result.geminiData.explanation || "System intelligence tracking sequence active.");

                // Open the visual drawer frame panel container right on your memory list view component context line
                setEditModalVisible(true);

        } catch (editError: any) {
          console.error("💥 Inline Edit execution failure:", editError);
          Alert.alert("Pipeline Defect", `Could not complete inline refresh sequence: ${editError.message}`);
        } finally {
          setIsProcessingAction(false);
        }
        return;
      }

      // 🗑️ CASE 2: SECURE OVERLAY CONFIRMATION WINDOW DELETE LIFECYCLE
      // 🗑️ CASE 2: SECURE DANGER WARNING DELETE LIFECYCLE
        if (options.isDelete) {
          console.log(`⚠️ Activating custom themed confirmation window for doc ID: [${docId}]`);
          // ✅ Simply set the state to open your custom UI modal wrapper overlay
          setDeleteTargetId(docId);
          return;
        }
     };


       // 🌟 UPGRADED SAVE CHANGES: Triggers update success notification toast
       const handleSaveChangesPatch = async () => {
         if (!selectedEditId) return;
         setIsSavingEdit(true);
         try {
             console.log(`🔮 Modal Save: Sending updated prompt to Gemini pipeline for ID [${selectedEditId}]...`);

             // 1. Fetch current tag from your local signal array to pass along context parameters
             const currentItem = dbSignals.find(item => item.id === selectedEditId);
             const activeTag = currentItem?.tag || "Practical";

             // 2. Execute your unified schema controller API!
             // Since selectedEditId is provided, it automatically overwrites using setDoc under the hood
             await saveOrUpdateSignalAnalysis({
               text: editTitleText.trim(), // Passes the modified input text from the modal field
               selectedTag: activeTag,
               userId: userId,
               editingRecordId: selectedEditId, // 🧠 Overwrites the existing entry
               customAccents: customAccents
             });

             // 3. Clear modal view layers on success loop
             setEditModalVisible(false);
             setSelectedEditId(null);
             triggerToast("Signal tracking parameters re-analyzed and updated.");

           } catch (error: any) {
             console.error('💥 Crash writing updated text properties via saveOrUpdateSignalAnalysis:', error);
             Alert.alert("Update Error", `Could not refresh analytical variables: ${error.message}`);
           } finally {
             setIsSavingEdit(false);
           }
         }

 // ==========================================
 // 🧭 OPTIMIZED REAL-TIME LIVE LISTENING SOCKET LOOP
 // ==========================================
 useEffect(() => {
   console.log("🔮 Opening lightweight read stream channel to Firestore...");

   const q = query(
     collection(db, "analyses"),
     where("user_id", "==", userId),
     orderBy("created_at", "desc")
   );

   const unsubscribe = onSnapshot(q, (snapshot) => {
     // ✅ FIX: No more manual liveRecords.push mapping cycles!
     // We map the raw documents directly into your state tracking collection array.
     const bareSignalsArray = snapshot.docs.map((docSnapshot) => {
       const data = docSnapshot.data();
             // ✅ FIX: Match your root database tag fields casing safely
             let computedTag = (data.tag || data.categoryTag || "THINGS").toUpperCase();
             if (computedTag === 'PERSONAL') computedTag = 'PEOPLE';
             if (computedTag === 'TRAVEL') computedTag = 'PLACES';
             if (computedTag === 'OBJECT') computedTag = 'THINGS';

             let computedColor = customAccents.cyan;
             if (computedTag === 'PEOPLE') computedColor = customAccents.pink;
             else if (computedTag === 'PLACES') computedColor = customAccents.gold;

       return {
         id: docSnapshot.id,
         ...data,
         // Fallbacks to guarantee your list rendering engine doesn't break
         title: data.title || data.signal || "Active Tracking Signal",
         detail: data.detail || data.mitigation || "Monitoring active parameters.",
         tag: computedTag, // ✅ Restored for list tab filters
         color: computedColor // ✅ Restored for pill element card views rendering panels

       };
     });

     console.log(`📊 PURE READ STREAM: Synced ${bareSignalsArray.length} items from server cluster.`);
     setDbSignals(bareSignalsArray);
     setLoading(false);
   }, (error) => {
     console.error("💥 Error streaming raw database signals:", error);
     setLoading(false);
   });

   return () => unsubscribe();
 }, [userId]);

  // Consolidate cloud and local records arrays
  const combinedSignalsMap = [...dbSignals];

  // Clean matching duplicates
  const uniqueSignals = combinedSignalsMap.filter(
    (item, index, self) => index === self.findIndex((t) => t.id === item.id)
  );

  // 🌟 THE DYNAMIC FILTER TRIGGER: Computes lists based on the active selection tab
  const filteredSignals = uniqueSignals.filter((item) => {
    if (activeTab === 'All') return true;
    return item.tag.toUpperCase() === activeTab.toUpperCase();
  });

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Signal map" subtitle="Everything you’ve let me notice" onBack={onBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.innerScroll}>

        {/* --- HERO COUNTER DISPLAY --- */}
        <View style={styles.memoryHero}>
          <Image source={require('@/assets/images/memory-orb.jpg')} style={styles.memoryImage} />
          <View style={styles.memoryOverlay} />
          <View style={styles.memoryHeroCopy}>
            {/* Real-time calculated overall data length counter */}
            <Text style={styles.memoryScore}>{uniqueSignals.length}</Text>
            <Text style={styles.memoryScoreLabel}>signals in your orbit</Text>
          </View>
          <View style={styles.memoryGlobe}>
            <FGlobe size={58} />
          </View>
        </View>

        {/* --- INTERACTIVE TAB SELECTION ROW LAYOUT --- */}
        <View style={styles.memoryTabs}>
          {(['All', 'People', 'Places', 'Things'] as const).map((tabName) => (
            <Pressable key={tabName} onPress={() => setActiveTab(tabName)}>
              <Text style={[
                styles.memoryTab,
                activeTab === tabName && styles.memoryTabActive
              ]}>
                {tabName === 'All' ? 'All signals' : tabName}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* --- CORE SIGNALS MAP ITERATOR LIST --- */}
        <SectionTitle eyebrow="JUST NOW" title={`${activeTab} context`} action="Capture" />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.cyan} />
            <Text style={styles.loadingText}>Streaming Live Data...</Text>
          </View>
        ) : filteredSignals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="folder" size={24} color="#71717A" />
            <Text style={styles.emptyText}>No active {activeTab.toLowerCase()} signals tracked.</Text>
          </View>
        ) : (
          filteredSignals.map((item) => (
            <View key={item.id} style={styles.memoryRow}>
              <View style={[styles.memoryDot, { backgroundColor: item.color }]} />
              <View style={styles.memoryCopy}>
                <Text style={styles.memoryTitle}>{item.title}</Text>
                <Text style={styles.memoryDetail}>{item.detail}</Text>
              </View>
               {/* 🌟 ADDED: Symmetrical row interaction action triggers layout */}
                <View style={styles.rowActionContainer}>
                    {/* ✏️ INLINE EDIT BUTTON (Passes ID and Edit flag) */}
                          <TouchableOpacity
                            onPress={() => handleSignalActionById(item.id, { isEdit: true })}
                            disabled={isProcessingAction}
                          >
                            <Feather name="edit-2" size={16} color="#FFF" />
                          </TouchableOpacity>

                           {/* 🗑️ FORCE CLICKABLE DELETE BUTTON */}
                              <TouchableOpacity
                                onPress={() => {
                                  console.log("💥 TRASH BUTTON PRESSED FOR ID:", item.id); // Check your terminal for this!
                                  handleSignalActionById(item.id, { isDelete: true });
                                }}
                                // ✅ SAFETY NET 1: hitSlop expands the touchable area by 20 pixels in every direction
                                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                                // ✅ SAFETY NET 2: Forces this specific button to sit on top of any clipping masks
                                style={{
                                  padding: 2,
                                  zIndex: 999,
                                  backgroundColor: 'transparent',
                                  minWidth: 20,
                                  minHeight: 20,
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Feather name="trash-2" size={16} color="#FF6B6B" />
                              </TouchableOpacity>
                 </View>

              <Pill label={item.tag} color={item.color} />
            </View>
          ))
        )}

        {/* --- PRIVACY BANNER NOTE --- */}
        <View style={styles.memoryNotice}>
           <Feather name="lock" size={17} color={theme.cyan} />
           <Text style={styles.memoryNoticeText}>Your signal map belongs to you. ForgetMeNot doesn’t sell or share your context.</Text>
        </View>
      </ScrollView>

       {/* =========================================================================
                 🌟 THE WEB-SAFE FIX: Replaced <Modal> with absolute positioned <View> layouts.
                 This stops the screen from turning solid black on web browsers and unblocks all clicks!
                 ========================================================================= */}

             {/* A. EDIT TEXT ATTRIBUTES SHEET DRAWER CONTAINER */}
             {editModalVisible && (
               <View style={[StyleSheet.absoluteFillObject, { zIndex: 100, justifyContent: 'flex-end' }]}>
                 {/* Backdrop Mask - click outside to dismiss */}
                 <Pressable style={styles.drawerBackdrop} onPress={() => setEditModalVisible(false)} />

                 <View style={styles.drawerContainer}>
                  <View style={styles.formFieldBlock}>
                       <Text style={styles.inputLabelText}>ACTUAL USER SIGNAL DESCRIPTION (EDITABLE)</Text>
                       {/* 📝 FIELD 1: Bind text explicitly to editTitleText which holds your rawPrompt */}
                       <TextInput
                         style={styles.modalEditableInputField}
                         value={editTitleText}
                         onChangeText={setEditTitleText}
                         placeholder="Modify your original raw prompt description..."
                         placeholderTextColor="#555"
                         editable={true}
                         multiline={true}
                       />
                     </View>

                     <View style={styles.formFieldBlock}>
                       <Text style={styles.inputLabelText}>STRATEGIC COGNITIVE ANALYSIS DETAILS (READ-ONLY)</Text>
                       {/* 🔒 FIELD 2: Gemini Explanation Paragraph - Read Only */}
                       <TextInput
                         style={[styles.modalInputField, styles.disabledReadOnlyField]}
                         value={editDetailText}
                         placeholder="Calculated risk trajectories summary text..."
                         placeholderTextColor="#444"
                         multiline={true}
                         editable={false}
                         selectTextOnFocus={false}
                         contextMenuHidden={true}
                       />
                     </View>

                     <View style={styles.formFieldBlock}>
                       <Text style={styles.inputLabelText}>PREVENTIVE MITIGATION STRATEGY BLUEPRINT (READ-ONLY)</Text>
                       {/* 🔒 FIELD 3: Gemini Actionable Instructions - Read Only */}
                       <TextInput
                         style={[styles.modalInputField, styles.disabledReadOnlyField]}
                         value={editMitigationText}
                         placeholder="Actionable prevention protocols mapping logs..."
                         placeholderTextColor="#444"
                         multiline={true}
                         editable={false}
                         selectTextOnFocus={false}
                         contextMenuHidden={true}
                       />
                     </View>

                   <View style={styles.drawerButtonsActionRow}>
                     <Pressable onPress={() => setEditModalVisible(false)} style={styles.cancelDrawerButton}>
                       <Text style={styles.cancelButtonText}>Cancel</Text>
                     </Pressable>
                     <Pressable onPress={handleSaveChangesPatch} disabled={isSavingEdit} style={styles.saveDrawerButton}>
                       {isSavingEdit ? <ActivityIndicator size="small" color="#050506" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
                     </Pressable>
                   </View>
                 </View>
               </View>
             )}

            {/* B. DISSOLVE HARD DELETE SYSTEM THEMED OVERLAY WINDOW CONTAINER */}
            {deleteTargetId !== null && (
              <View style={[StyleSheet.absoluteFillObject, { zIndex: 110, justifyContent: 'center', alignItems: 'center' }]}>
                {/* Backdrop Mask Blur dismiss thread */}
                <Pressable style={styles.drawerBackdrop} onPress={() => setDeleteTargetId(null)} />

                {/* Custom Centered Cyber Alert Panel */}
                <View style={[styles.drawerContainer, styles.deleteAlertContainer]}>

                  <Text style={styles.dangerLabelText}>🚨 SECURE TRANSACTION DETECTED</Text>

                  <Text style={styles.deleteWarningBodyText}>
                    This is hard delete from DB/Server, do you want to continue, please confirm,
                  </Text>

                  <View style={[styles.drawerButtonsActionRow, { marginTop: 24 }]}>
                    {/* CANCEL SELECTION BUTTON */}
                    <Pressable
                      onPress={() => setDeleteTargetId(null)}
                      style={styles.cancelDrawerButton}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>

                    {/* CONFIRM HARD DELETION BUTTON */}
                    <Pressable
                      onPress={handleExecuteThemedDelete}
                      disabled={isProcessingAction}
                      style={styles.confirmDeleteActionButton}
                    >
                      {isProcessingAction ? (
                        <ActivityIndicator size="small" color="#050506" />
                      ) : (
                        <Text style={styles.deleteButtonText}>Confirm Delete</Text>
                      )}
                    </Pressable>
                  </View>

                </View>
              </View>
            )}


             {/* C. CYBER TOAST NOTIFICATION SUCCESS BANNER HUD */}
             {toastMessage && (
               <View style={{ position: 'absolute', bottom: Platform.OS === 'ios' ? 44 : 24, left: 16, right: 16, backgroundColor: '#16161A', borderWidth: 1, borderColor: '#39FF14', borderRadius: 8, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, zIndex: 200 }}>
                 <Feather name="check-circle" size={15} color="#39FF14" />
                 <Text style={{ flex: 1, fontSize: 12, fontWeight: '600', color: '#FFFFFF' }}>{toastMessage}</Text>
               </View>
             )}

           </View> // Final closing wrapper tag of your screen component matching your root rules structure
         );
       }
// =========================================================================
// 🎨 CYBER-DARK MINIMALIST DESIGN LAYOUT TOKENS STYLE CODES
// =========================================================================
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#050506',
    paddingTop: Platform.OS === 'ios' ? 44 : 12
  },
  innerScroll: {
    padding: 16
  },

  // Header section layout configurations
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 14,
    gap: 14
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#111113',
    borderWidth: 1,
    borderColor: '#1E1E22',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTextContainer: {
    flex: 1
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#71717A',
    marginTop: 1
  },

  // Hero Card layout tokens
  memoryHero: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    backgroundColor: '#111113',
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#1E1E22'
  },
  memoryImage: {
    width: '100%',
    height: '100%',
    opacity: 0.25
  },
  memoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,5,6,0.3)'
  },
  memoryHeroCopy: {
    position: 'absolute',
    left: 20,
    bottom: 20
  },
  memoryScore: {
    fontSize: 36,
    fontWeight: '900',
    color: '#00f0ff'
  },
  memoryScoreLabel: {
    fontSize: 12,
    color: '#A1A1AA',
    fontWeight: '600',
    marginTop: 2
  },
  memoryGlobe: {
    position: 'absolute',
    right: 20,
    bottom: 20
  },
  globeFrame: {
    backgroundColor: 'rgba(0,240,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center'
  },

  // Navigation tab bar triggers layout tokens
  memoryTabs: {
    flexDirection: 'row',
    gap: 14,
    marginVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E22',
    paddingBottom: 10
  },
  memoryTabActive: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00f0ff',
    borderBottomWidth: 2,
    borderBottomColor: '#00f0ff',
    paddingBottom: 8
  },
  memoryTab: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71717A'
  },

  // Section titles row layout
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 14,
    marginBottom: 12
  },
  sectionEyebrow: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A855F7',
    letterSpacing: 1
  },
  sectionMainTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2
  },
  sectionActionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(57,255,20,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(57,255,20,0.15)'
  },
  sectionActionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#39FF14',
    textTransform: 'uppercase'
  },

  // List Rows Item layout tokens
  memoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111113',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E1E22',
    gap: 12
  },
  memoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  memoryCopy: {
    flex: 1
  },
  memoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  memoryDetail: {
    fontSize: 11,
    color: '#A1A1AA',
    marginTop: 2,
    lineHeight: 14
  },

  // Custom context status text badge pills
  pillContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1
  },
  pillText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5
  },

  // Live state loader activity indicators container
  loadingContainer: {
    paddingVertical: 44,
    alignItems: 'center',
    gap: 10
  },
  loadingText: {
    fontSize: 11,
    color: '#71717A'
  },

  // Lower privacy policy informational text banner
  memoryNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16161A',
    borderWidth: 1,
    borderColor: '#222226',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    gap: 10
  },
  memoryNoticeText: {
    flex: 1,
    fontSize: 11,
    color: '#71717A',
    lineHeight: 15
  },

  drawerDismissArea: {
    flex: 1,
  },

   // 🌟 THE BACKDROP FIX: Adds a translucent tint overlay so the app behind is visible
    drawerBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(5, 5, 6, 0.75)',
      zIndex: -1,
    },

    // 🌟 THE DRAWER CONTAINER: Switched from pitch black to an elevated gunmetal grey
    drawerContainer: {
      width: '100%',
      backgroundColor: '#16161A', // Elevated dark card tone
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderWidth: 1,
      borderColor: '#26262B', // Crisp border boundary line
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: Platform.OS === 'ios' ? 34 : 20,
      zIndex: 130,
    },

    dragHandleBar: {
      width: 36,
      height: 4,
      backgroundColor: '#2E2E33',
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 20,
    },

    drawerTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: '#FFFFFF', // High contrast white
      marginBottom: 18,
    },

    inputHeadingLabel: {
      fontSize: 9,
      fontWeight: '700',
      color: '#8E9196', // Clear muted grey label
      letterSpacing: 0.75,
      marginBottom: 8,
    },

    // 🌟 THE INPUT FIELD FRAME: Explicit deep black box base with distinct borders
    textInputBoxFrame: {
      width: '100%',
      backgroundColor: '#0F0F11', // Darker offset box background
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: '#2A2A30', // Clearly visible bounding border line
      marginBottom: 18,
    },

    // 🌟 THE ACTUAL TEXT STRING INPUT INSIDE: Pushes font color to full white intensity
    drawerTextInput: {
      fontSize: 13,
      color: '#FFFFFF', // Fixes text visibility instantly
      padding: 0,
      width: '100%',
      outlineStyle: 'none' as any, // Disables browser highlight boxes on web viewports
    },

    drawerButtonsActionRow: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
      marginTop: 10,
    },

    cancelDrawerButton: {
      flex: 1,
      height: 42,
      borderRadius: 8,
      backgroundColor: '#222226',
      borderWidth: 1,
      borderColor: '#2E2E33',
      alignItems: 'center',
      justifyContent: 'center',
    },

    cancelButtonText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#E4E4E7',
    },

    saveDrawerButton: {
      flex: 1,
      height: 42,
      borderRadius: 8,
      backgroundColor: '#39FF14', // High luminosity system neon green
      alignItems: 'center',
      justifyContent: 'center',
    },

    saveButtonText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#050506', // Contrast dark text on neon background
    },
modalOverlayContainer: {
  backgroundColor: '#16161a',       // Soft dark grey background panel instead of total pitch black
  borderRadius: 12,
  padding: 20,
  borderWidth: 1,
  borderColor: '#26262b',
  marginVertical: 16,
},
formFieldBlock: {
  marginBottom: 16,                 // Disperses text rows cleanly
},
inputLabelText: {
  color: '#00ffcc',                 // Glowing cyber emerald labels to call out metrics contexts
  fontSize: 11,
  fontWeight: '700',
  letterSpacing: 1.2,
  marginBottom: 6,
},
modalEditableInputField: {
  backgroundColor: '#1e1e24',       // Raised visible canvas card for typing
  borderColor: '#00ffcc',           // Active highlighted accent indicator perimeter
  borderWidth: 1,
  borderRadius: 8,
  color: '#ffffff',                 // High-contrast clean white text
  padding: 14,
  fontSize: 14,
  minHeight: 50,
  textAlignVertical: 'top',
},
modalInputField: {
  backgroundColor: '#1a1a1f',       // Recessed surface box
  borderColor: '#2d2d34',
  borderWidth: 1,
  borderRadius: 8,
  color: '#e4e4e7',                 // High contrast text
  padding: 14,
  fontSize: 14,
  minHeight: 60,
  textAlignVertical: 'top',
},
disabledReadOnlyField: {
  backgroundColor: '#111114',       // Sinks back deeper into screen background hierarchy
  borderColor: '#202024',
  color: '#8a8f98',                 // Dims typography to convey a locked state cleanly
  opacity: 0.7,
},
modalButtonsRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 12,
  marginTop: 10,
},
cancelBtn: {
  flex: 1,
  backgroundColor: '#202024',
  borderRadius: 8,
  paddingVertical: 16,
  alignItems: 'center',
},
cancelBtnText: {
  color: '#ffffff',
  fontWeight: 'bold',
  fontSize: 15,
},
saveBtn: {
  flex: 1,
  backgroundColor: '#00ffcc',       // Bright green action indicator
  borderRadius: 8,
  paddingVertical: 16,
  alignItems: 'center',
},
saveBtnText: {
  color: '#000000',
  fontWeight: 'bold',
  fontSize: 15,
},

deleteAlertContainer: {
  maxWidth: 450,                     // Keeps the dialog box compact and centered on web browsers
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#ff4d4d',            // High-contrast alert crimson parameter lines
  alignSelf: 'center',
  padding: 24,
},
dangerLabelText: {
  color: '#ff4d4d',                  // Neon warning theme color layout weights
  fontSize: 12,
  fontWeight: '900',
  letterSpacing: 1.5,
  marginBottom: 12,
  textAlign: 'center',
},
deleteWarningBodyText: {
  color: '#e4e4e7',
  fontSize: 14,
  lineHeight: 22,
  textAlign: 'center',
},
confirmDeleteActionButton: {
  flex: 1,
  backgroundColor: '#ff4d4d',        // Solid bold warning red action trigger button
  borderRadius: 8,
  paddingVertical: 16,
  alignItems: 'center',
  justifyContent: 'center',
},
deleteButtonText: {
  color: '#050506',                  // Dark high contrast text on top of bright red canvas fields
  fontWeight: '900',
  fontSize: 15,
},


});
