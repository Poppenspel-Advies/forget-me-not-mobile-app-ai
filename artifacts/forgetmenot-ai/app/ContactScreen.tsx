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
import * as Linking from 'expo-linking';
import { getAuth } from 'firebase/auth';

// Define the interface props matching your router switchboard contracts
interface ContactScreenProps {
  onBack: () => void;
  styles: any;    // Passes shared styling tokens from the master stylesheet safely
  theme: any;     // Passes active design palette variables down dynamically
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
      const recipientMailAddress = 'poppenspeladvies@gmail.com';
      const mailSubjectLine = encodeURIComponent('ForgetMeNot AI // System Feedback & Signals Log');

      const userMailAddressMetadata = currentFirebaseUser?.email || 'Anonymous Context Node';
      const customMailBodyContent = encodeURIComponent(
        `SYSTEM LOG SIGNAL SUBMISSION:\n` +
        `----------------------------------------\n` +
        `User Registry: ${userMailAddressMetadata}\n` +
        `Timestamp Frame: ${new Date().toISOString()}\n\n` +
        `FEEDBACK NOTE:\n` +
        `"${message.trim()}"\n\n` +
        `----------------------------------------\n` +
        `Sent via ForgetMeNot Core Client Portal.`
      );

      const secureMailtoStringUri = `mailto:${recipientMailAddress}?subject=${mailSubjectLine}&body=${customMailBodyContent}`;

      console.log("📨 Launching device communications array module...");
      const supportedChannelCheck = await Linking.canOpenURL(secureMailtoStringUri);

      if (supportedChannelCheck) {
        await Linking.openURL(secureMailtoStringUri);
        setSent(true);
      } else {
        alert(`Mailing modules unavailable. Please send your notes directly to: ${recipientMailAddress}`);
      }
    } catch (error: any) {
      console.error("💥 Outbound dispatch window crash:", error);
      alert("Transmission channel timeout exception.");
    } finally {
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
            <Text style={styles.sentCopy}>Thanks for making the product a little more human. We’ll be in touch soon.</Text>
            <Pressable onPress={onBack} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Back to your space</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.contactDetails}>
          <Text style={styles.contactDetailTitle}>Prefer manual email?</Text>
          <Text style={styles.contactEmail}>poppenspeladvies@gmail.com</Text>
          <Text style={styles.contactHours}>Usually replies within one quiet day.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
