import { db } from './firebaseConfig'; // Ensure this points to your actual Firebase configuration file
import { collection, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { fetchGeminiSignalAnalysis } from './geminiService'; // Update path based on your file structure
import { Alert } from 'react-native';

// Define types for our payload parameters
interface SaveSignalParams {
  text: string;
  selectedTag: string;
  userId?: string | null;
  editingRecordId?: string | null; // 🌟 PASS NULL OR OMIT FOR CREATE, PASS THE STRING ID FOR EDIT
  customAccents: {
    pink: string;
    gold: string;
    cyan: string;
  };
}

/**
 * 🌟 ARCHITECTURE MODULE: UNIFIED FIRESTORE PIPELINE FOR FORGETMENOT AI™
 * Isolated data controller handling Creation, Modification, and Elimination streams.
 */

/**
 * 1️⃣ SAVE / UPDATE TELEMETRY STREAM HANDLER
 * @param params Object containing prompt text, tag preferences, tracking IDs, and theme accents.
 * @returns Resolves with the structural metadata of the saved document block.
 */
export const saveOrUpdateSignalAnalysis = async (params: SaveSignalParams): Promise<any> => {
  const { text, selectedTag, userId, editingRecordId, customAccents } = params;
  const targetUserId = userId || "Admin_ForgetMeNotAI";

  let geminiResultJson: any = null;

  try {
    console.log("🔮 Service Layer: Initiating Gemini analytical engine transmission...");
    geminiResultJson = await fetchGeminiSignalAnalysis(text.trim(), selectedTag.toLowerCase());
  } catch (parseError) {
    console.warn("🔥 Service Layer: JSON string structural truncation detected. Recovering using safe local fallback object...");
    geminiResultJson = {
      signal: "Analysis Routine Interrupted",
      confidence: 50,
      likelyOmission: "Travel Logistics Check",
      explanation: "The intelligence engine encountered a processing error while mapping this specific destination path.",
      preventiveAction: "Verify your travel route, site-access details, and hardware chargers manually.",
      category: selectedTag.toLowerCase()
    };
  }

  if (!geminiResultJson) {
    throw new Error("Critical Analysis Pipeline Defect: Gemini payload returned null or undefined vectors.");
  }

  const isPeople = selectedTag === 'People';
  const isPlaces = selectedTag === 'Places';
  const isPractical = selectedTag === 'Practical' || selectedTag === 'Things';

  const activeColor = isPeople
    ? customAccents.pink
    : isPlaces
      ? customAccents.gold
      : customAccents.cyan;

  try {
    // ✅ FIXED: Maps fields using geminiResultJson to prevent "analysis is not defined" reference crashes
    const docPayload = {
      user_id: targetUserId,
      omission_item: geminiResultJson.likelyOmission || 'Context entry logged',
      status: "active_obsession",
      created_at: serverTimestamp(), // Handled at base database layer levels
      updated_at: serverTimestamp(),
      tag: selectedTag.toUpperCase(),
      title: text.trim() || geminiResultJson.signal || `New ${selectedTag} Signal`,
      detail: geminiResultJson.explanation || "System intelligence tracking sequence active.",
      rawPrompt: text.trim(),
      categoryTag: selectedTag.toLowerCase(),

      analysis: {
        signal: geminiResultJson.signal,
        confidence: geminiResultJson.confidence,
        likelyOmission: geminiResultJson.likelyOmission,
        explanation: geminiResultJson.explanation,
        preventiveAction: geminiResultJson.preventiveAction,
        category: geminiResultJson.category,
      },

      intent_anchor: {
        anchor_point: isPeople ? "Transit Sequence Initiation (Departure Window)" : "Routine Path Execution Window",
        user_unstated_goal: `Fulfill objective regarding ${selectedTag.toLowerCase()} with zero memory drops or friction loops.`,
        routine_deviation_probability: `${geminiResultJson.confidence - 12}% Deviation Risk Index`
      },

      replies_shield: {
        critical_contact: isPlaces ? "Primary Core Contact Identity" : "Maya (System Context Coordinator)",
        preemptive_auto_draft: `System alert notification trace: Processing task addressing active ${selectedTag.toLowerCase()} parameters loop.`,
        trigger_condition: "Fires automatically upon localized telemetry perimeter radar check variance."
      },

      radar_scopes: {
        is_today: true,
        is_personal: isPeople || isPlaces,
        is_practical: isPractical
      },

      gemini_signal_read: {
        signal_signature: geminiResultJson.signal,
        confidence_rating: Number(geminiResultJson.confidence) || 95,
        structural_explanation: geminiResultJson.explanation,
        preventive_action_blueprint: geminiResultJson.preventiveAction,
        cascading_dominoes: [
          `Delayed ${(text.trim() || 'preparation').toLowerCase()} sequence (1.42x Velocity Friction engagement)`,
          "Shortened response window capacity threshold decay",
          `Downstream tracking failure risk vector for structural ${selectedTag.toLowerCase()} loops`
        ],
        holographic_network_nodes: [selectedTag.toUpperCase(), "DELAYED_PREP", "VELOCITY_FRICTION", "OMISSION_RISK"]
      },

      metrics: {
        probability_index: Number(geminiResultJson.confidence) || 95,
        loop_friction: (geminiResultJson.confidence || 95) > 80 ? "1.42x Velocity Friction" : "1.18x Routine Friction",
        time_gravity: "T-Minus 14 Hours",
        severity: (geminiResultJson.confidence || 95) > 85 ? "Catastrophic Impact" : "High Impact"
      },

      dominoes: [
        `Delayed ${(geminiResultJson.signal || 'preparation').toLowerCase()}`,
        "Shortened response window",
        `Potential downstream ${(geminiResultJson.likelyOmission || 'omission').toLowerCase()} failure risk`
      ],

      nodes: [
        (geminiResultJson.likelyOmission || 'OMISSION').toUpperCase(),
        "DELAYED PREP",
        "TIMELINE DECAY",
        "MISSED CORE"
      ],

      probability: `${geminiResultJson.confidence || 95}%`,
      multiplier: (geminiResultJson.confidence || 95) > 80 ? "1.42x Velocity Friction" : "1.18x Routine Friction",
      timeGravity: "T-Minus 14 Hours",
      severity: (geminiResultJson.confidence || 95) > 85 ? "Catastrophic Impact" : "High Impact",
      dependencyNodesCount: "04 Downstream Nodes",
      flowVelocity: `${(geminiResultJson.confidence || 95) - 5}% Flow Velocity`,
      mitigation: geminiResultJson.preventiveAction || 'Place items beside your active layout bag'
    };

    let committedDocumentId = "";

    if (editingRecordId) {
      console.log(`📝 Modifying existing record pointer ID: [${editingRecordId}]`);
      const targetDocReference = doc(db, "analyses", editingRecordId);
      await setDoc(targetDocReference, docPayload, { merge: true });
      committedDocumentId = editingRecordId;
    } else {
      console.log("🚀 Creating new document entry via addDoc...");
      const docRef = await addDoc(collection(db, "analyses"), docPayload);
      committedDocumentId = docRef.id;
    }

    console.log(`🛡️ Database operational loop complete. ID Committed: ${committedDocumentId}`);
    return { success: true, documentId: committedDocumentId, geminiData: geminiResultJson };

  } catch (firestoreError) {
    console.error("💥 Controller Layer: Crash writing telemetry data down to your collection:", firestoreError);
    throw firestoreError;
  }
};

/**
 * 2️⃣ DELETE TELEMETRY STREAM HANDLER
 * @param targetIdToDelete String document key tracking the active record to delete.
 */
export const deleteSignalAnalysis = async (targetIdToDelete: string): Promise<{ success: boolean }> => {
  if (!targetIdToDelete) {
    throw new Error("Argument Validation Failure: targetIdToDelete tracking reference cannot be empty.");
  }

  try {
    console.log(`🧹 Controller Layer: Attempting document elimination trace for path ID: [${targetIdToDelete}]`);
    const docRef = doc(db, "analyses", targetIdToDelete);

    // Physical server side deletion push
    await deleteDoc(docRef);
    console.log('🗑️ Controller Layer: Cloud document reference record purged successfully.');

    return { success: true };
  } catch (deleteError) {
    console.error('💥 Controller Layer: Crash purging telemetry reference item from Firestore:', deleteError);
    throw deleteError;
  }
};
