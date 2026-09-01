import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';

import { getAnalyticsSummary, type AnalyticsSummary } from '@/lib/api';

function formatDuration(ms: number): string {
  if (!ms || ms <= 0) return '—';
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatResolvedRate(closed: number, total: number): string {
  if (!total) return '—';
  return `${Math.round((closed / total) * 100)}%`;
}

export default function AnalyticsScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const summary = await getAnalyticsSummary();
          if (active) setData(summary);
        } catch (e) {
          if (active) {
            setData(null);
            setError(
              e instanceof Error ? e.message : 'Could not load analytics'
            );
          }
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  if (loading && !data) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading analytics…</Text>
      </View>
    );
  }

  if (error && !data) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorTitle}>Analytics unavailable</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorHint}>
          Start the PostgreSQL backend (`npm start` in backend/new).
        </Text>
      </View>
    );
  }

  const summary = data!;
  const overview = [
    { num: String(summary.active), label: 'Active Cases' },
    { num: String(summary.closed), label: 'Closed Cases' },
    { num: formatDuration(summary.avgDurationMs), label: 'Avg Case Duration' },
    {
      num: formatResolvedRate(summary.closed, summary.total),
      label: 'Resolved',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        isDesktop && styles.contentDesktop,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={[styles.statsRow, isDesktop && styles.statsRowDesktop]}>
          {overview.map((s) => (
            <View
              key={s.label}
              style={[styles.statCard, isDesktop && styles.statCardDesktop]}
            >
              <Text style={styles.statNumber}>{s.num}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={isDesktop ? styles.twoColRow : undefined}>
        <View style={isDesktop ? { flex: 1 } : undefined}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Number of incidents</Text>
            {(summary.byCategory.length
              ? summary.byCategory
              : [{ category: 'No data yet', count: 0 }]
            ).map((row) => (
              <View key={row.category} style={styles.item}>
                <Text style={styles.itemTitle}>{row.category}</Text>
                <Text style={styles.itemValue}>{row.count} Cases</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={isDesktop ? { flex: 1 } : undefined}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Incident Hotspots</Text>
            {(summary.hotspots.length
              ? summary.hotspots
              : [{ label: 'No locations yet', count: 0 }]
            ).map((row) => (
              <View key={row.label} style={styles.item}>
                <Text style={styles.itemTitle}>{row.label}</Text>
                <Text style={styles.itemValue}>{row.count} incidents</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={isDesktop ? styles.twoColRow : undefined}>
        <View style={isDesktop ? { flex: 2 } : undefined}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Services</Text>
            <View style={isDesktop ? styles.metricsRow : undefined}>
              {[
                {
                  label: 'Police Called',
                  value: summary.servicesContacted.police,
                },
                {
                  label: 'Fire Brigade Called',
                  value: summary.servicesContacted.fire,
                },
                {
                  label: 'Ambulance Called',
                  value: summary.servicesContacted.ambulance,
                },
              ].map((m) => (
                <View
                  key={m.label}
                  style={[
                    styles.metricCard,
                    isDesktop && { flex: 1, marginBottom: 0 },
                  ]}
                >
                  <Text style={styles.metricTitle}>{m.label}</Text>
                  <Text style={styles.metricValue}>{m.value} Times</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <View style={isDesktop ? { flex: 1 } : undefined}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Assistant</Text>
            <View style={styles.metricCard}>
              <Text style={styles.metricTitle}>Coming soon</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: { marginTop: 12, color: '#6B7280' },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  errorText: { color: '#DC2626', textAlign: 'center', marginBottom: 8 },
  errorHint: { color: '#6B7280', textAlign: 'center', fontSize: 13 },
  content: { padding: 18 },
  contentDesktop: {
    maxWidth: 960,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
    marginTop: 28,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statsRowDesktop: { flexWrap: 'nowrap' },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statCardDesktop: { width: 'auto', flex: 1 },
  statNumber: { fontSize: 28, fontWeight: '700', color: '#2563EB' },
  statLabel: { marginTop: 6, color: '#6B7280', fontSize: 14 },
  twoColRow: { flexDirection: 'row', gap: 20 },
  metricsRow: { flexDirection: 'row', gap: 12 },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  metricTitle: { fontSize: 15, color: '#6B7280' },
  metricValue: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  item: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  itemValue: { fontSize: 16, fontWeight: '700', color: '#2563EB' },
});
