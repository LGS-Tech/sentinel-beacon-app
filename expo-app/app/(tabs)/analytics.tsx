import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

export default function AnalyticsScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        isDesktop && styles.contentDesktop,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={[styles.statsRow, isDesktop && styles.statsRowDesktop]}>
          {[
            { num: '42', label: 'Active Cases' },
            { num: '318', label: 'Closed Cases' },
            { num: '1h 52m', label: 'Avg Case Duration' },
            { num: '96%', label: 'Resolved' },
          ].map((s) => (
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
            {[
              { label: 'Fire', value: '18 Cases' },
              { label: 'Intruder', value: '42 Cases' },
              { label: 'Injury', value: '27 Cases' },
              { label: 'Maintenance', value: '95 Cases' },
            ].map((row) => (
              <View key={row.label} style={styles.item}>
                <Text style={styles.itemTitle}>{row.label}</Text>
                <Text style={styles.itemValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={isDesktop ? { flex: 1 } : undefined}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Incident Hotspots</Text>
            {[
              { label: 'Main Lecture Theatre', value: '34 incidents' },
              { label: 'Corridor', value: '28 incidents' },
              { label: 'Cafeteria', value: '17 incidents' },
            ].map((row) => (
              <View key={row.label} style={styles.item}>
                <Text style={styles.itemTitle}>{row.label}</Text>
                <Text style={styles.itemValue}>{row.value}</Text>
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
                { label: 'Police Called', value: '6 Times' },
                { label: 'Fire Brigade Called', value: '16 Times' },
                { label: 'Ambulance Called', value: '24 Times' },
              ].map((m) => (
                <View
                  key={m.label}
                  style={[
                    styles.metricCard,
                    isDesktop && { flex: 1, marginBottom: 0 },
                  ]}
                >
                  <Text style={styles.metricTitle}>{m.label}</Text>
                  <Text style={styles.metricValue}>{m.value}</Text>
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
