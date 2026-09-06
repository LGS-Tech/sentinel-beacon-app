import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

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

// analytics:
// needs a line chart for the average response time
// also needs the actual values connected
// might need a page for when there isn't enough data

const responseTimes = [
  {
    month: 'Mar',
    height: '72%',
  },
  {
    month: 'Apr',
    height: '58%',
  },
  {
    month: 'May',
    height: '64%',
  },
  {
    month: 'Jun',
    height: '46%',
  },
  {
    month: 'Jul',
    height: '52%',
  },
  {
    month: 'Aug',
    height: '38%',
  },
];

export default function AnalyticsScreen() {
  const { width } = useWindowDimensions();

  const desktop = width >= 768;

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

          if (active) {
            setData(summary);
          }
        } catch (e) {
          if (active) {
            setData(null);
            setError(
              e instanceof Error
                ? e.message
                : 'Could not load analytics'
            );
          }
        } finally {
          if (active) {
            setLoading(false);
          }
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

        <Text style={styles.loadingText}>
          Loading analytics…
        </Text>
      </View>
    );
  }

  if (error && !data) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorTitle}>
          Analytics unavailable
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <Text style={styles.errorHint}>
          Start the PostgreSQL backend (`npm start` in backend/new).
        </Text>
      </View>
    );
  }

  const summary = data!;

  const overview = [
    {
      number: String(summary.active),
      title: 'Active Cases',
      extra: '',
    },
    {
      number: String(summary.closed),
      title: 'Closed Cases',
      extra: '',
    },
    {
      number: formatDuration(summary.avgDurationMs),
      title: 'Avg Case Duration',
      extra: '',
    },
    {
      number: formatResolvedRate(summary.closed, summary.total),
      title: 'Resolved',
      extra: '',
    },
  ];

  const incidentData = summary.byCategory.length
    ? summary.byCategory.map((item) => ({
        name: item.category,
        number: item.count,
        text: `${item.count} Cases`,
      }))
    : [
        {
          name: 'No data yet',
          number: 0,
          text: '0 Cases',
        },
      ];

  const highestIncidentNumber = Math.max(
    ...incidentData.map((item) => item.number),
    1
  );

  const hotspots = summary.hotspots.length
    ? summary.hotspots.map((item) => ({
        name: item.label,
        incidents: `${item.count} incidents`,
      }))
    : [
        {
          name: 'No locations yet',
          incidents: '0 incidents',
        },
      ];

  const emergencyServices = [
    {
      name: 'Police Called',
      amount: `${summary.servicesContacted.police} Times`,
    },
    {
      name: 'Fire Brigade Called',
      amount: `${summary.servicesContacted.fire} Times`,
    },
    {
      name: 'Ambulance Called',
      amount: `${summary.servicesContacted.ambulance} Times`,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        desktop && styles.desktopContent,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Overview */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Overview
        </Text>

        <View
          style={[
            styles.stats,
            desktop && styles.statsDesktop,
          ]}
        >
          {overview.map((item) => (
            <View
              key={item.title}
              style={[
                styles.statCard,
                desktop && styles.statCardDesktop,
              ]}
            >
              <Text style={styles.statNumber}>
                {item.number}
              </Text>

              <Text style={styles.statTitle}>
                {item.title}
              </Text>

              {item.extra ? (
                <Text
                  style={[
                    styles.statExtra,
                    item.extra === 'Needs attention' &&
                      styles.warningText,
                  ]}
                >
                  {item.extra}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      </View>

      {/* Incidents and hotspots */}

      <View
        style={[
          styles.largeRow,
          desktop && styles.largeRowDesktop,
        ]}
      >
        <View
          style={[
            styles.leftSide,
            desktop && styles.desktopColumn,
          ]}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Number of incidents
            </Text>

            <View style={styles.chartCard}>
              <View style={styles.barChart}>
                {incidentData.map((item) => (
                  <View
                    key={item.name}
                    style={styles.barColumn}
                  >
                    <Text style={styles.barNumber}>
                      {item.number}
                    </Text>

                    <View style={styles.barBackground}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height:
                              (item.number /
                                highestIncidentNumber) *
                              100,
                          },
                        ]}
                      />
                    </View>

                    <Text style={styles.barName}>
                      {item.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {incidentData.map((item) => (
              <View
                key={item.name}
                style={styles.listItem}
              >
                <Text style={styles.listTitle}>
                  {item.name}
                </Text>

                <Text style={styles.listValue}>
                  {item.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View
          style={[
            styles.rightSide,
            desktop && styles.desktopColumn,
          ]}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Incident Hotspots
            </Text>

            {hotspots.map((item) => (
              <View
                key={item.name}
                style={styles.listItem}
              >
                <Text style={styles.listTitle}>
                  {item.name}
                </Text>

                <Text style={styles.listValue}>
                  {item.incidents}
                </Text>
              </View>
            ))}
          </View>

          {/* Response time */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Average Response Time
            </Text>

            <View style={styles.chartCard}>
              <View style={styles.responseChart}>
                <View style={styles.responseLine} />
                <View style={styles.responseLine} />
                <View style={styles.responseLine} />

                <View style={styles.responseBars}>
                  {responseTimes.map((item) => (
                    <View
                      key={item.month}
                      style={styles.responseColumn}
                    >
                      <View
                        style={[
                          styles.responseBar,
                          {
                            height: item.height as any,
                          },
                        ]}
                      />

                      <Text style={styles.responseMonth}>
                        {item.month}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <Text style={styles.chartText}>
                Average response time: 1h 52m
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Emergency services and AI */}

      <View
        style={[
          styles.bottomRow,
          desktop && styles.bottomRowDesktop,
        ]}
      >
        <View
          style={[
            styles.emergencySection,
            desktop && styles.emergencyDesktop,
          ]}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Emergency Services
            </Text>

            <View
              style={[
                styles.emergencyCards,
                desktop && styles.emergencyCardsDesktop,
              ]}
            >
              {emergencyServices.map((item) => (
                <View
                  key={item.name}
                  style={[
                    styles.metricCard,
                    desktop && styles.metricCardDesktop,
                  ]}
                >
                  <Text style={styles.metricTitle}>
                    {item.name}
                  </Text>

                  <Text style={styles.metricNumber}>
                    {item.amount}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View
          style={[
            styles.aiSection,
            desktop && styles.aiDesktop,
          ]}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              AI Assistant
            </Text>

            <View style={styles.metricCard}>
              <Text style={styles.metricTitle}>
                Coming soon
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    color: '#6B7280',
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },

  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 8,
  },

  errorHint: {
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 13,
  },

  content: {
    padding: 18,
  },

  desktopContent: {
    maxWidth: 960,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 32,
    paddingTop: 24,
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
    marginTop: 28,
  },

  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },

  statsDesktop: {
    flexWrap: 'nowrap',
  },

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

  statCardDesktop: {
    width: 'auto',
    flex: 1,
  },

  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2563EB',
  },

  statTitle: {
    marginTop: 6,
    color: '#6B7280',
    fontSize: 14,
  },

  statExtra: {
    marginTop: 8,
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '600',
  },

  warningText: {
    color: '#D97706',
  },

  largeRow: {
    width: '100%',
  },

  largeRowDesktop: {
    flexDirection: 'row',
    gap: 20,
  },

  leftSide: {
    width: '100%',
  },

  rightSide: {
    width: '100%',
  },

  desktopColumn: {
    flex: 1,
  },

  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  barChart: {
    height: 220,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },

  barColumn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  barNumber: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },

  barBackground: {
    width: 30,
    height: 150,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },

  bar: {
    width: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },

  barName: {
    marginTop: 8,
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },

  listItem: {
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

  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },

  listValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },

  responseChart: {
    height: 210,
    justifyContent: 'flex-end',
  },

  responseLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 45,
  },

  responseBars: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },

  responseColumn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  responseBar: {
    width: 12,
    backgroundColor: '#60A5FA',
    borderRadius: 8,
  },

  responseMonth: {
    marginTop: 8,
    fontSize: 10,
    color: '#6B7280',
  },

  chartText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },

  bottomRow: {
    width: '100%',
  },

  bottomRowDesktop: {
    flexDirection: 'row',
    gap: 20,
  },

  emergencySection: {
    width: '100%',
  },

  emergencyDesktop: {
    flex: 2,
  },

  aiSection: {
    width: '100%',
  },

  aiDesktop: {
    flex: 1,
  },

  emergencyCards: {
    width: '100%',
  },

  emergencyCardsDesktop: {
    flexDirection: 'row',
    gap: 12,
  },

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

  metricCardDesktop: {
    flex: 1,
    marginBottom: 0,
  },

  metricTitle: {
    fontSize: 15,
    color: '#6B7280',
  },

  metricNumber: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },

  bottomSpace: {
    height: 40,
  },
});