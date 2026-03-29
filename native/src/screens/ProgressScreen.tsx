import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { getStats, Stats } from '../lib/storage';
import { theme } from '../lib/theme';

export default function ProgressScreen() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  if (!stats) return <View style={styles.container} />;

  const maxCount = Math.max(1, ...stats.last7Days.map(d => d.count));

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your Progress</Text>

      <View style={styles.statsGrid}>
        <StatCard value={stats.streak} label="Day Streak" />
        <StatCard value={stats.todayMinutes} label="Today (min)" />
        <StatCard value={stats.totalSessions} label="Sessions" />
        <StatCard value={stats.totalMinutes} label="Total Min" />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Last 7 Days</Text>
        <View style={styles.chart}>
          {stats.last7Days.map((d) => {
            const height = d.count > 0 ? Math.max(10, (d.count / maxCount) * 90) : 4;
            return (
              <View key={d.date} style={styles.barWrapper}>
                <Text style={styles.barCount}>{d.count > 0 ? d.count : ''}</Text>
                <View style={[styles.bar, { height: `${height}%` as any, backgroundColor: d.count > 0 ? theme.accent2 : theme.bg3 }]} />
                <Text style={styles.barLabel}>{d.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Consistency Matters</Text>
        <Text style={styles.cardText}>
          Research shows that practicing just 5–10 minutes of breathing exercises daily yields long-term improvements in stress, focus, and emotional regulation. The key is making it a habit.
        </Text>
      </View>
    </ScrollView>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 20, paddingBottom: 40 },
  container: { flex: 1, backgroundColor: theme.bg },
  title: { fontSize: 28, fontWeight: '700', color: theme.text, marginBottom: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24, justifyContent: 'space-between' },
  statCard: {
    flexBasis: '47%', backgroundColor: theme.surface, borderRadius: theme.radius,
    padding: 20, alignItems: 'center',
  },
  statValue: { fontSize: 36, fontWeight: '800', color: theme.accent2 },
  statLabel: { fontSize: 13, color: theme.text2, marginTop: 4 },
  chartCard: {
    backgroundColor: theme.surface, borderRadius: theme.radius, padding: 20, marginBottom: 24,
  },
  chartTitle: { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 16 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, gap: 8 },
  barWrapper: { flex: 1, alignItems: 'center', height: '100%' as any, justifyContent: 'flex-end', gap: 6 },
  bar: { width: '100%', maxWidth: 36, borderTopLeftRadius: 6, borderTopRightRadius: 6, minHeight: 4 },
  barCount: { fontSize: 12, fontWeight: '600', color: theme.text },
  barLabel: { fontSize: 11, color: theme.text2 },
  card: { backgroundColor: theme.surface, borderRadius: theme.radius, padding: 20 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: theme.accent2, marginBottom: 10 },
  cardText: { fontSize: 14, color: theme.text2, lineHeight: 22 },
});
