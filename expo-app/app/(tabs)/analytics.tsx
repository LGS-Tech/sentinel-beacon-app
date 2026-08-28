
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

// analytics:
// needs a line chart for the average response time
// also needs the actual values connected
// might need a page for when there isn't enough data

const overviewData = [
  {
    number: '42',
    title: 'Active Cases',
    extra: '+3 from last month',
  },
  {
    number: '318',
    title: 'Closed Cases',
    extra: '+12 from last month',
  },
  {
    number: '1h 52m',
    title: 'Avg Case Duration',
    extra: 'Needs attention',
  },
  {
    number: '96%',
    title: 'Resolved',
    extra: '+2% from last month',
  },
];

const incidentData = [
  {
    name: 'Fire',
    number: 18,
    text: '18 Cases',
  },
  {
    name: 'Intruder',
    number: 42,
    text: '42 Cases',
  },
  {
    name: 'Injury',
    number: 27,
    text: '27 Cases',
  },
  {
    name: 'Maintenance',
    number: 95,
    text: '95 Cases',
  },
];

const hotspots = [
  {
    name: 'Main Lecture Theatre',
    incidents: '34 incidents',
  },
  {
    name: 'Corridor',
    incidents: '28 incidents',
  },
  {
    name: 'Cafeteria',
    incidents: '17 incidents',
  },
];

const emergencyServices = [
  {
    name: 'Police Called',
    amount: '6 Times',
  },
  {
    name: 'Fire Brigade Called',
    amount: '16 Times',
  },
  {
    name: 'Ambulance Called',
    amount: '24 Times',
  },
];

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

  const highestIncidentNumber = 95;

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
        <Text style={styles.sectionTitle}>Overview</Text>

        <View
          style={[
            styles.stats,
            desktop && styles.statsDesktop,
          ]}
        >
          {overviewData.map((item) => (
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

              <Text
                style={[
                  styles.statExtra,
                  item.extra === 'Needs attention' &&
                    styles.warningText,
                ]}
              >
                {item.extra}
              </Text>
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

