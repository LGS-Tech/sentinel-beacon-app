import React from "react"
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"

export default function AnalyticsScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >


      {/* Quick Stats */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Overview
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>42</Text>
            <Text style={styles.statLabel}>Active Cases</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>318</Text>
            <Text style={styles.statLabel}>Closed Cases</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>1h 52m</Text>
            <Text style={styles.statLabel}>Avg Case Duration</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>96%</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>
      </View>

      {/* Incident Types */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Number of incidents
        </Text>

        <View style={styles.item}>
          <Text style={styles.itemTitle}>Fire</Text>
          <Text style={styles.itemValue}>18 Cases</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.itemTitle}>Intruder</Text>
          <Text style={styles.itemValue}>42 Cases</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.itemTitle}>Injury</Text>
          <Text style={styles.itemValue}>27 Cases</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.itemTitle}>Maintenance</Text>
          <Text style={styles.itemValue}>95 Cases</Text>
        </View>
      </View>

      

      {/* Hotspots */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Incident Hotspots
        </Text>

        <View style={styles.item}>
          <Text style={styles.itemTitle}>
            Main Lecture Theatre
          </Text>

          <Text style={styles.itemValue}>
            34 incidents
          </Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.itemTitle}>
            Corridor
          </Text>

          <Text style={styles.itemValue}>
            28 incidents
          </Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.itemTitle}>
            Cafeteria
          </Text>

          <Text style={styles.itemValue}>
            17 incidents
          </Text>
        </View>
      </View>

      {/* Services */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Emergency Services
        </Text>

        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>
            Police Called
          </Text>

          <Text style={styles.metricValue}>
            6 Times
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>
            Fire Brigade Called
          </Text>

          <Text style={styles.metricValue}>
            16 Times
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>
            Ambulance Called
          </Text>

          <Text style={styles.metricValue}>
            24 Times
          </Text>
        </View>
      </View>

      {/* AI */}

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

      

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  content: {
    padding: 18,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
    marginTop: 10,
  },

  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 24,
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
    marginTop: 28,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    elevation: 2,
  },

  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2563EB",
  },

  statLabel: {
    marginTop: 6,
    color: "#6B7280",
    fontSize: 14,
  },

  metricCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    elevation: 2,
  },

  metricTitle: {
    fontSize: 15,
    color: "#6B7280",
  },

  metricValue: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },

  item: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 10,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    elevation: 2,
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  itemValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563EB",
  },
})