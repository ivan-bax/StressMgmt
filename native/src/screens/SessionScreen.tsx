import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SessionEngine, SessionState, SessionPhase, PHASES } from '../lib/session';
import { BreathingEngine, BreathState } from '../lib/breathing';
import { binauralEngine } from '../lib/audio';
import BreathRing from '../components/BreathRing';
import { theme } from '../lib/theme';

interface Props {
  onComplete: (totalSec: number) => void;
  onCancel: () => void;
}

export default function SessionScreen({ onComplete, onCancel }: Props) {
  const [timer, setTimer] = useState('15:00');
  const [progress, setProgress] = useState(0);
  const [phaseName, setPhaseName] = useState('Preparing...');
  const [phaseDesc, setPhaseDesc] = useState('');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [breathState, setBreathState] = useState<BreathState | null>(null);
  const [showBreathing, setShowBreathing] = useState(false);

  const sessionRef = useRef<SessionEngine | null>(null);
  const breathRef = useRef<BreathingEngine | null>(null);

  useEffect(() => {
    const session = new SessionEngine(
      (state: SessionState) => {
        const rem = Math.max(0, state.globalRemaining);
        const min = Math.floor(rem / 60);
        const sec = Math.floor(rem % 60);
        setTimer(`${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`);
        setProgress(state.globalProgress);
      },
      (phase: SessionPhase, index: number, _total: number) => {
        setPhaseName(phase.name);
        setPhaseDesc(phase.description);
        setPhaseIndex(index);

        // Audio
        if (phase.audio) {
          binauralEngine.play(phase.audio, 0.4);
        }

        // Breathing
        if (breathRef.current) {
          breathRef.current.stop();
          breathRef.current = null;
        }

        if (phase.breathing) {
          setShowBreathing(true);
          const breathEngine = new BreathingEngine((s) => setBreathState(s));
          breathEngine.start(phase.breathing);
          breathRef.current = breathEngine;
        } else {
          setShowBreathing(false);
          setBreathState(null);
        }
      },
      (totalSec: number) => {
        binauralEngine.stop();
        if (breathRef.current) breathRef.current.stop();
        onComplete(totalSec);
      }
    );

    session.start();
    sessionRef.current = session;

    return () => {
      session.stop();
      binauralEngine.stop();
      if (breathRef.current) breathRef.current.stop();
    };
  }, []);

  const handlePause = useCallback(() => {
    if (!sessionRef.current) return;
    const isPaused = sessionRef.current.togglePause();
    setPaused(isPaused);
    if (isPaused && breathRef.current) breathRef.current.stop();
  }, []);

  const handleEnd = useCallback(() => {
    if (!sessionRef.current) return;
    const elapsed = sessionRef.current.globalElapsed || 0;
    sessionRef.current.stop();
    if (breathRef.current) breathRef.current.stop();
    binauralEngine.stop();
    if (elapsed > 30) {
      onComplete(elapsed);
    } else {
      onCancel();
    }
  }, [onComplete, onCancel]);

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
      </View>

      <Text style={styles.timer}>{timer}</Text>
      <Text style={styles.phaseName}>{phaseName}</Text>
      <Text style={styles.phaseDesc}>{phaseDesc}</Text>

      {showBreathing && breathState && (
        <View style={styles.breathContainer}>
          <BreathRing
            action={breathState.action}
            remaining={breathState.remaining}
            color={breathState.color}
            size={160}
          />
        </View>
      )}

      {/* Phase dots */}
      <View style={styles.dots}>
        {PHASES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < phaseIndex && styles.dotDone,
              i === phaseIndex && styles.dotCurrent,
            ]}
          />
        ))}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.btn} onPress={handlePause} activeOpacity={0.7}>
          <Text style={styles.btnText}>{paused ? 'Resume' : 'Pause'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={handleEnd} activeOpacity={0.7}>
          <Text style={styles.btnDangerText}>End Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center',
    padding: 20, gap: 16,
  },
  progressBar: {
    width: '100%', height: 4, backgroundColor: theme.bg3, borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: theme.cyan, borderRadius: 2 },
  timer: { fontSize: 56, fontWeight: '800', color: theme.accent2 },
  phaseName: { fontSize: 24, fontWeight: '700', color: theme.text },
  phaseDesc: { fontSize: 15, color: theme.text2, lineHeight: 22, textAlign: 'center', maxWidth: 320 },
  breathContainer: { marginVertical: 10 },
  dots: { flexDirection: 'row', gap: 6, marginVertical: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.bg3 },
  dotDone: { backgroundColor: theme.accent2 },
  dotCurrent: { backgroundColor: theme.cyan, shadowColor: theme.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4 },
  controls: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btn: {
    paddingVertical: 14, paddingHorizontal: 28, borderRadius: theme.radiusSm,
    backgroundColor: theme.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  btnText: { fontSize: 15, fontWeight: '600', color: theme.text },
  btnDanger: { borderColor: 'rgba(239,68,68,0.4)' },
  btnDangerText: { fontSize: 15, fontWeight: '600', color: '#f87171' },
});
