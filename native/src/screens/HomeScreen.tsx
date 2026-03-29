import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../lib/theme';

interface Props {
  onStartSession: () => void;
  onQuickBreathe: (key: string) => void;
  onQuickSound: (key: string) => void;
}

export default function HomeScreen({ onStartSession, onQuickBreathe, onQuickSound }: Props) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.orbContainer}>
          <View style={styles.orb} />
        </View>
        <Text style={styles.title}>Stress Reset</Text>
        <Text style={styles.subtitle}>Your 15-minute science-backed calm</Text>
      </View>

      {/* Start Button */}
      <TouchableOpacity style={styles.btnPrimary} onPress={onStartSession} activeOpacity={0.8}>
        <Text style={styles.btnIcon}>▶</Text>
        <Text style={styles.btnText}>Start 15-Min Reset</Text>
      </TouchableOpacity>

      {/* How It Works */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>How It Works</Text>
        <Text style={styles.cardText}>
          This routine combines <Text style={styles.bold}>binaural beats</Text> (audio frequencies that guide your brainwaves) with <Text style={styles.bold}>evidence-based breathing techniques</Text> to reduce anxiety by up to 67% in just 15 minutes.
        </Text>
        <View style={styles.steps}>
          {[
            { num: '1', title: 'Settle & Sigh', desc: 'Physiological sighs activate your parasympathetic system instantly' },
            { num: '2', title: 'Brainwave Entrainment', desc: 'Theta & Alpha binaural beats realign your neural rhythms' },
            { num: '3', title: 'Breathe & Integrate', desc: 'Structured breathing cements the calm state' },
          ].map((step) => (
            <View key={step.num} style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{step.num}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickGrid}>
        <TouchableOpacity style={styles.quickBtn} onPress={() => onQuickBreathe('physiologicalSigh')} activeOpacity={0.7}>
          <Text style={styles.quickIcon}>🫁</Text>
          <Text style={styles.quickLabel}>Quick Calm</Text>
          <Text style={styles.quickSub}>2 min</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => onQuickSound('stressRelief')} activeOpacity={0.7}>
          <Text style={styles.quickIcon}>🎧</Text>
          <Text style={styles.quickLabel}>Stress Relief</Text>
          <Text style={styles.quickSub}>Audio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => onQuickBreathe('box')} activeOpacity={0.7}>
          <Text style={styles.quickIcon}>⬜</Text>
          <Text style={styles.quickLabel}>Box Breath</Text>
          <Text style={styles.quickSub}>3 min</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => onQuickSound('deepRelax')} activeOpacity={0.7}>
          <Text style={styles.quickIcon}>🌊</Text>
          <Text style={styles.quickLabel}>Deep Relax</Text>
          <Text style={styles.quickSub}>Audio</Text>
        </TouchableOpacity>
      </View>

      {/* Science Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>The Science</Text>
        <Text style={styles.cardText}>
          Every emotion and state of mind corresponds to specific brainwave frequencies. <Text style={styles.bold}>Delta (0.5–4 Hz)</Text> for deep sleep, <Text style={styles.bold}>Theta (4–8 Hz)</Text> for relaxation, <Text style={styles.bold}>Alpha (8–12 Hz)</Text> for calm focus.
        </Text>
        <Text style={styles.cardText}>
          Audio frequencies can help realign these rhythms, allowing your brain to return to a more peaceful state — backed by research from Yale and highlighted on the Huberman Lab Podcast.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', paddingVertical: 20 },
  orbContainer: { marginBottom: 16 },
  orb: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: theme.accent,
    shadowColor: theme.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20,
  },
  title: { fontSize: 36, fontWeight: '800', color: theme.accent2 },
  subtitle: { fontSize: 16, color: theme.text2, marginTop: 6 },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    padding: 18, borderRadius: theme.radius, backgroundColor: theme.accent, marginTop: 20,
    shadowColor: theme.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 15,
  },
  btnIcon: { fontSize: 20, color: '#fff' },
  btnText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  card: { backgroundColor: theme.surface, borderRadius: theme.radius, padding: 20, marginTop: 24 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: theme.accent2, marginBottom: 10 },
  cardText: { fontSize: 14, color: theme.text2, lineHeight: 22, marginBottom: 8 },
  bold: { fontWeight: '700', color: theme.text },
  steps: { marginTop: 16, gap: 14 },
  step: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  stepNum: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: theme.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: theme.text, marginBottom: 2 },
  stepDesc: { fontSize: 13, color: theme.text2, lineHeight: 18 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: theme.text, marginTop: 28, marginBottom: 14 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  quickBtn: {
    flexBasis: '47%', alignItems: 'center', gap: 6, padding: 18,
    backgroundColor: theme.surface, borderRadius: theme.radius, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  quickIcon: { fontSize: 28 },
  quickLabel: { fontSize: 14, fontWeight: '600', color: theme.text },
  quickSub: { fontSize: 12, color: theme.text2 },
});
