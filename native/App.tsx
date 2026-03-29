import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import BreatheScreen from './src/screens/BreatheScreen';
import BreatheActiveScreen from './src/screens/BreatheActiveScreen';
import SoundsScreen from './src/screens/SoundsScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import SessionScreen from './src/screens/SessionScreen';
import CompleteScreen from './src/screens/CompleteScreen';
import { logSession, getStats } from './src/lib/storage';
import { theme } from './src/lib/theme';

type Screen =
  | { name: 'home' }
  | { name: 'breathe' }
  | { name: 'breathe-active'; exerciseKey: string }
  | { name: 'sounds' }
  | { name: 'progress' }
  | { name: 'session' }
  | { name: 'complete'; duration: number; streak: number };

const TAB_KEYS = ['home', 'breathe', 'sounds', 'progress'] as const;

const TAB_LABELS: Record<string, string> = {
  home: 'Home',
  breathe: 'Breathe',
  sounds: 'Sounds',
  progress: 'Progress',
};

const TAB_ICONS: Record<string, string> = {
  home: '⌂',
  breathe: '◉',
  sounds: '♪',
  progress: '▊',
};

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [activeTab, setActiveTab] = useState('home');

  const navigate = useCallback((tab: string) => {
    setActiveTab(tab);
    setScreen({ name: tab } as Screen);
  }, []);

  const showTabs = ['home', 'breathe', 'sounds', 'progress'].includes(screen.name);

  const handleStartSession = useCallback(() => {
    setScreen({ name: 'session' });
  }, []);

  const handleQuickBreathe = useCallback((key: string) => {
    setScreen({ name: 'breathe-active', exerciseKey: key });
  }, []);

  const handleQuickSound = useCallback((key: string) => {
    setActiveTab('sounds');
    setScreen({ name: 'sounds' });
  }, []);

  const handleSelectExercise = useCallback((key: string) => {
    setScreen({ name: 'breathe-active', exerciseKey: key });
  }, []);

  const handleBreatheBack = useCallback(async (duration: number) => {
    if (duration > 10) await logSession('breathing', duration);
    setActiveTab('breathe');
    setScreen({ name: 'breathe' });
  }, []);

  const handleSessionComplete = useCallback(async (totalSec: number) => {
    await logSession('full-reset', totalSec);
    const stats = await getStats();
    setScreen({ name: 'complete', duration: totalSec, streak: stats.streak });
  }, []);

  const handleSessionCancel = useCallback(() => {
    setActiveTab('home');
    setScreen({ name: 'home' });
  }, []);

  const handleCompleteDone = useCallback(() => {
    setActiveTab('home');
    setScreen({ name: 'home' });
  }, []);

  const renderScreen = () => {
    switch (screen.name) {
      case 'home':
        return (
          <HomeScreen
            onStartSession={handleStartSession}
            onQuickBreathe={handleQuickBreathe}
            onQuickSound={handleQuickSound}
          />
        );
      case 'breathe':
        return <BreatheScreen onSelectExercise={handleSelectExercise} />;
      case 'breathe-active':
        return <BreatheActiveScreen exerciseKey={screen.exerciseKey} onBack={handleBreatheBack} />;
      case 'sounds':
        return <SoundsScreen />;
      case 'progress':
        return <ProgressScreen />;
      case 'session':
        return <SessionScreen onComplete={handleSessionComplete} onCancel={handleSessionCancel} />;
      case 'complete':
        return <CompleteScreen duration={screen.duration} streak={screen.streak} onDone={handleCompleteDone} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.screenContainer}>{renderScreen()}</View>
      {showTabs && (
        <View style={styles.tabBar}>
          {TAB_KEYS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => navigate(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabIcon, activeTab === tab && styles.tabActive]}>
                {TAB_ICONS[tab]}
              </Text>
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabActive]}>
                {TAB_LABELS[tab]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  screenContainer: { flex: 1 },
  tabBar: {
    flexDirection: 'row', backgroundColor: theme.bg2,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 8, paddingBottom: 8,
  },
  tab: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 6 },
  tabIcon: { fontSize: 22, color: theme.text2 },
  tabLabel: { fontSize: 11, color: theme.text2 },
  tabActive: { color: theme.accent2 },
});
