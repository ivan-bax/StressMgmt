import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { EXERCISES } from '../lib/breathing';
import { theme } from '../lib/theme';

interface Props {
  onSelectExercise: (key: string) => void;
}

export default function BreatheScreen({ onSelectExercise }: Props) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Breathing Exercises</Text>
      <Text style={styles.subtitle}>Tap an exercise to begin</Text>
      {Object.entries(EXERCISES).map(([key, ex]) => (
        <TouchableOpacity key={key} style={styles.card} onPress={() => onSelectExercise(key)} activeOpacity={0.7}>
          <View style={[styles.dot, { backgroundColor: ex.color }]} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{ex.name}</Text>
            <Text style={styles.cardDesc}>{ex.description}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: theme.text, marginBottom: 4 },
  subtitle: { fontSize: 15, color: theme.text2, marginBottom: 24 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18,
    backgroundColor: theme.surface, borderRadius: theme.radius, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)', marginBottom: 12,
  },
  dot: { width: 32, height: 32, borderRadius: 16 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: theme.text2, lineHeight: 18 },
});
