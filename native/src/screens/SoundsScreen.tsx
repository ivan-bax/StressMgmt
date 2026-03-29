import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { PRESETS, binauralEngine } from '../lib/audio';
import { logSession } from '../lib/storage';
import { theme } from '../lib/theme';

export default function SoundsScreen() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [startTime, setStartTime] = useState<number | null>(null);

  const handlePlay = async (key: string) => {
    await binauralEngine.play(key, volume);
    setPlaying(key);
    setStartTime(Date.now());
  };

  const handleStop = async () => {
    await binauralEngine.stop();
    if (startTime) {
      const duration = Math.round((Date.now() - startTime) / 1000);
      if (duration > 10) await logSession('binaural', duration);
    }
    setPlaying(null);
    setStartTime(null);
  };

  const handleVolume = async (val: number) => {
    setVolume(val);
    await binauralEngine.setVolume(val);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Binaural Beats</Text>
      <Text style={styles.subtitle}>Use headphones for best effect</Text>

      <View style={styles.notice}>
        <Text style={styles.noticeText}>🎧 Headphones required — binaural beats need separate audio in each ear</Text>
      </View>

      {Object.entries(PRESETS).map(([key, preset]) => (
        <TouchableOpacity
          key={key}
          style={[styles.card, playing === key && styles.activeCard]}
          onPress={() => playing === key ? handleStop() : handlePlay(key)}
          activeOpacity={0.7}
        >
          <Text style={styles.cardIcon}>{preset.icon}</Text>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{preset.name}</Text>
            <Text style={styles.cardDesc}>{preset.description}</Text>
          </View>
        </TouchableOpacity>
      ))}

      {playing && (
        <View style={styles.player}>
          <Text style={styles.playerName}>{PRESETS[playing]?.name}</Text>
          <View style={styles.volumeRow}>
            <Text style={styles.volumeLabel}>Volume</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={handleVolume}
              minimumTrackTintColor={theme.accent2}
              maximumTrackTintColor={theme.bg3}
              thumbTintColor={theme.accent2}
            />
          </View>
          <TouchableOpacity style={styles.stopBtn} onPress={handleStop} activeOpacity={0.7}>
            <Text style={styles.stopBtnText}>Stop</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: theme.text, marginBottom: 4 },
  subtitle: { fontSize: 15, color: theme.text2, marginBottom: 20 },
  notice: {
    padding: 12, borderRadius: theme.radiusSm, backgroundColor: 'rgba(99,102,241,0.1)',
    borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)', marginBottom: 20,
  },
  noticeText: { fontSize: 13, color: theme.accent2 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18,
    backgroundColor: theme.surface, borderRadius: theme.radius, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)', marginBottom: 12,
  },
  activeCard: {
    borderColor: theme.accent, shadowColor: theme.accent, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 10,
  },
  cardIcon: { fontSize: 32 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: theme.text2, lineHeight: 18 },
  player: {
    marginTop: 20, padding: 20, backgroundColor: theme.surface, borderRadius: theme.radius,
    borderWidth: 1, borderColor: theme.accent, alignItems: 'center',
    shadowColor: theme.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10,
  },
  playerName: { fontSize: 18, fontWeight: '700', color: theme.accent2, marginBottom: 16 },
  volumeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%', marginBottom: 16 },
  volumeLabel: { fontSize: 14, color: theme.text2 },
  slider: { flex: 1, height: 40 },
  stopBtn: {
    paddingVertical: 14, paddingHorizontal: 28, borderRadius: theme.radiusSm,
    backgroundColor: theme.surface2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  stopBtnText: { fontSize: 15, fontWeight: '600', color: theme.text },
});
