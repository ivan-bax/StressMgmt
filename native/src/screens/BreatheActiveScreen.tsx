import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BreathingEngine, EXERCISES, BreathState } from '../lib/breathing';
import * as HapticsLib from '../lib/haptics';
import BreathRing from '../components/BreathRing';
import { theme } from '../lib/theme';

interface Props {
  exerciseKey: string;
  onBack: (durationSec: number) => void;
}

export default function BreatheActiveScreen({ exerciseKey, onBack }: Props) {
  const exercise = EXERCISES[exerciseKey];
  const [state, setState] = useState<BreathState | null>(null);
  const [cycles, setCycles] = useState(0);
  const engineRef = useRef<BreathingEngine | null>(null);
  const startTimeRef = useRef(Date.now());
  const lastCountRef = useRef(-1);

  useEffect(() => {
    startTimeRef.current = Date.now();
    const engine = new BreathingEngine(
      (s) => {
        setState(s);
        // Haptic on phase start
        if (s.progress === 0) {
          HapticsLib.phaseStart(s.action);
        }
        // Haptic on count change
        if (s.remaining !== undefined && s.remaining !== lastCountRef.current) {
          lastCountRef.current = s.remaining;
          HapticsLib.count(s.action);
        }
      },
      (c) => setCycles(c)
    );
    engine.start(exerciseKey);
    engineRef.current = engine;

    return () => engine.stop();
  }, [exerciseKey]);

  const handleBack = useCallback(() => {
    engineRef.current?.stop();
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
    onBack(duration);
  }, [onBack]);

  if (!exercise) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleBack}>
        <Text style={styles.backBtn}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.name}>{exercise.name}</Text>

      <View style={styles.ringContainer}>
        <BreathRing
          action={state?.action ?? 'Ready'}
          remaining={state?.remaining}
          color={state?.color ?? exercise.color}
        />
      </View>

      <Text style={styles.cycles}>Cycles: {cycles}</Text>

      <TouchableOpacity style={styles.stopBtn} onPress={handleBack} activeOpacity={0.7}>
        <Text style={styles.stopBtnText}>Stop</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20,
  },
  backBtn: { color: theme.accent2, fontSize: 16, alignSelf: 'flex-start' },
  name: { fontSize: 22, fontWeight: '700', color: theme.text },
  ringContainer: { flex: 1, justifyContent: 'center', maxHeight: 340 },
  cycles: { fontSize: 15, color: theme.text2 },
  stopBtn: {
    paddingVertical: 14, paddingHorizontal: 28, borderRadius: theme.radiusSm,
    backgroundColor: theme.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  stopBtnText: { fontSize: 15, fontWeight: '600', color: theme.text },
});
