import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../lib/theme';

interface Props {
  duration: number;
  streak: number;
  onDone: () => void;
}

export default function CompleteScreen({ duration, streak, onDone }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.orb} />
      <Text style={styles.title}>Session Complete</Text>
      <Text style={styles.msg}>
        You've completed your stress reset. Notice how your body and mind feel right now — carry this calm with you.
      </Text>

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{Math.round(duration / 60)}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.btn} onPress={onDone} activeOpacity={0.8}>
        <Text style={styles.btnText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center',
    padding: 24, gap: 20,
  },
  orb: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: theme.green,
    shadowColor: theme.green, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 25,
  },
  title: { fontSize: 28, fontWeight: '700', color: theme.text },
  msg: { fontSize: 15, color: theme.text2, lineHeight: 22, textAlign: 'center', maxWidth: 300 },
  stats: { flexDirection: 'row', gap: 16 },
  statCard: {
    backgroundColor: theme.surface, borderRadius: theme.radius, padding: 20, alignItems: 'center',
    minWidth: 100,
  },
  statValue: { fontSize: 36, fontWeight: '800', color: theme.accent2 },
  statLabel: { fontSize: 13, color: theme.text2, marginTop: 4 },
  btn: {
    paddingVertical: 18, paddingHorizontal: 48, borderRadius: theme.radius,
    backgroundColor: theme.accent,
    shadowColor: theme.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 15,
  },
  btnText: { fontSize: 18, fontWeight: '700', color: '#fff' },
});
