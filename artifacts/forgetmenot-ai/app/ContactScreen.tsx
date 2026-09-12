import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';

interface ContactScreenProps {
  onBack: () => void;
  styles: any;
  theme: any;
  tap: () => void;
  FGlobe: React.ComponentType<{ size?: number }>;
  ScreenHeader: React.ComponentType<{ title: string; subtitle?: string; onBack?: () => void }>;
}

export default function ContactScreen({ onBack, styles, theme, tap, FGlobe, ScreenHeader }: ContactScreenProps) {
  const auth = getAuth();
  const currentFirebaseUser = auth.currentUser;

  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendFeedbackEmail = async () => {
    if (!message.trim() || isSending) return;

    if (typeof tap === 'function') tap();
    setIsSending(true);

    try {
      const userLoggedInEmail = currentFirebaseUser?.email || 'anonymous-node@forgetmenot.ai';
      const recipientMailAddress = 'poppenspeladvies@gmail.com';

      console.log(`📡 Initializing secure backend REST API pipeline via 'Contact Us' template...`);

      // ==============================================================
      // 🟢 ✅ FIXED: EXTRACTING VALUES SECURELY FROM ENVIRONMENT CONFIGS
      // ==============================================================
      const EMAILJS_SERVICE_ID = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID;
      const EMAILJS_TEMPLATE_ID = process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID;
      const EMAILJS_PUBLIC_KEY = process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        throw new Error("Missing structural EmailJS environment credential parameters inside .env file context.");
      }

      // Prepares variable bundles to map precisely into your custom HTML brackets
      const emailParams = {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          name: userLoggedInEmail,
          time: new Date().toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
          }),
          message: message.trim(),
          to_email: recipientMailAddress,
          reply_to: userLoggedInEmail
        }
      };

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(emailParams),
      });

      if (response.ok || response.status === 200) {
        console.log("🚀 Custom 'Contact Us' payload transmitted seamlessly through background API web node.");
        setSent(true);
      } else {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP response status code: ${response.status}`);
      }

    } catch (error: any) {
      console.error("💥 Outbound API email background pipeline exception:", error);
      alert(`Transmission failed: ${error?.message || "Verify your network infrastructure endpoints."}`);
    } finally {
      //setIsProcessing(false); // Fallback stability reset switch
      setIsSending(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.screen}>
      <ScreenHeader title="Talk to us" subtitle="We’re listening for better signals." onBack={onBack} />

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.innerScroll}>
        <View style={styles.contactHero}>
          <FGlobe size={78} />
          <Text style={styles.contactHeroTitle}>A good assistant{"\n"}keeps learning.</Text>
          <Text style={styles.contactHeroCopy}>Tell us what ForgetMeNot helped you notice — or what it should have.</Text>
        </View>

        {!sent ? (
          <>
            <View style={styles.contactInputWrap}>
              <Text style={styles.contactInputLabel}>YOUR NOTE</Text>
              <TextInput
                testID="contact-input"
                multiline
                value={message}
                onChangeText={setMessage}
                placeholder="I wish ForgetMeNot could…"
                placeholderTextColor={theme.mutedForeground}
                style={styles.contactInput}
                editable={!isSending}
              />
            </View>

            <Pressable
              testID="send-contact"
              onPress={handleSendFeedbackEmail}
              disabled={!message.trim() || isSending}
              style={({ pressed }) => [
                styles.primaryButton,
                (!message.trim() || isSending) && styles.disabledButton,
                pressed && { opacity: 0.85 }
              ]}
            >
              {isSending ? (
                <ActivityIndicator size="small" color={theme.background} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Send to the team</Text>
                  <Feather name="send" size={16} color={theme.background} />
                </>
              )}
            </Pressable>
          </>
        ) : (
          <View style={styles.sentCard}>
            <View style={styles.sentIcon}><Feather name="check" size={24} color={theme.background} /></View>
            <Text style={styles.sentTitle}>Signal received.</Text>
            <Text style={styles.sentCopy}>Thanks for making the product a little more human. Your message was processed seamlessly using your active session context.</Text>
            <Pressable onPress={onBack} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Back to your space</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.contactDetails}>
          <Text style={styles.contactDetailTitle}>Automated Matrix Logging</Text>
          <Text style={styles.contactEmail}>Sending as: {currentFirebaseUser?.email || 'Anonymous Context Node'}</Text>
          <Text style={styles.contactHours}>Directly targets poppenspeladvies@gmail.com automatically.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
