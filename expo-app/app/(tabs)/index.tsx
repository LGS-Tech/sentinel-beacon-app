//dashboard - specialised prompts added for each case type
import React, { useEffect, useState } from "react"

import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"


import ChatSheet from "@/components/chat"



import IntruderMap from "@/components/intruder-map"

import LiveFeedSheet, {
  addFeedItem,
  clearFeed,
  ensureFeedTable,
  getAllFeedItems,
} from "@/components/live-feed"

import CaseClosedSheet from "@/components/close-sheet"
import PoliceConfirmation from "@/components/police-confirmation"
import BottomSheet from "@/components/sheet"

import { ThemedView } from "@/components/themed-view"

import { db } from "@/lib/db"



//const db = SQLite.openDatabaseSync("app.db")



const floorPlan = require("../../assets/images/LGSUniFloorPlan.png")
const logo = require("../../assets/images/LGS-logo.png")

const defaultCoords = {

  x: 0.52,
  y: 0.79,
}


const caseQuestions: Record<string, string[]> = {
  Fire: [
    "Has everyone present been evacuated?",
    "Have the fire department been contacted?",
  ],

  Intruder: [
    "Describe the intruder",
    "Are they carrying out anti-social behaviour?",
    "Have the police been contacted?",
  ],

  Injury: [
    "Who was injured?",
    "Describe the injury",
    "Have the emergency services contacted?",
    "What medical assistance has been provided?",
  ],

  Missing: [
    "Who/what is missing?",
    "Where and when was the last known location?",
    "Have the police been contacted?",
  ],

  Maintenance: [
    "Describe the maintenance issue",
    "Does/did it pose a danger to anyone?",
    "Have the maintenance team been contacted?",
  ],
}

function createLocationTable() {

  db.execSync(`
    CREATE TABLE IF NOT EXISTS intruder_location (
      id INTEGER PRIMARY KEY NOT NULL,
      x REAL,
      y REAL,
      label TEXT
    );
  `)
}

function saveLocation(
  x: number,
  y: number,
  label: string
) {

  db.runSync(
    `
      INSERT OR REPLACE INTO intruder_location
      (id, x, y, label)
      VALUES (1, ?, ?, ?)
    `,
    [x, y, label]
  )
}



export default function HomeScreen() {

  const [caseActive, setCaseActive] = useState(false)

  const [incidentType, setIncidentType] =
    useState("Intruder")

  const [showSituationModal, setShowSituationModal] =
    useState(false)

  const [locationConfirmed, setLocationConfirmed] =
    useState(false)

  const [showCaseClosed, setShowCaseClosed] =
    useState(false)

  const [intruderLocation, setIntruderLocation] =
    useState("")

  const [movementStatus] = useState("Stationary")

  const [serviceStatus, setServiceStatus] =
  useState("Not notified")

  const [confirmedCoords, setConfirmedCoords] =
    useState(defaultCoords)

  const [updatingLocation, setUpdatingLocation] =
    useState(false)

  const [selectedCoords, setSelectedCoords] =
    useState<{ x: number; y: number } | null>(null)

  const [showLabelModal, setShowLabelModal] =
    useState(false)


  const [locationInput, setLocationInput] =
    useState("")

  const [chatVisible, setChatVisible] =
    useState(false)

  const [feedVisible, setFeedVisible] =
    useState(false)

  const [policeModalVisible, setPoliceModalVisible] =
    useState(false)

  const [actionsOpen, setActionsOpen] =
    useState(false)

  const [mapRefreshKey, setMapRefreshKey] =
    useState(0)

  const [showQuestionModal, setShowQuestionModal] =useState(false)

  const [selectedCaseType, setSelectedCaseType] = useState("")

  const [questionAnswers, setQuestionAnswers] = useState<string[]>(["", ""])

  const [currentVaultCaseId, setCurrentVaultCaseId] = useState<number | null>(null)


  const [showMap, setShowMap] = useState(false)

  const [openCases, setOpenCases] =  useState<any[]>([])
  const [showDashboard, setShowDashboard] = useState(false)



  useEffect(() => {

    createLocationTable()

    createActiveCaseTable()

    ensureFeedTable()

    ensureLastUpdatedColumn()

    loadOpenCases()

  }, [])

  useEffect(() => {

  if (!caseActive) {
    loadOpenCases()
  }

}, [caseActive])

useEffect(() => {

  const interval = setInterval(() => {

    if (!caseActive) {
      loadOpenCases()
    }

  }, 1000)

  return () => clearInterval(interval)

}, [caseActive])

  function openCase(type: string) {


    clearFeed()

    setIncidentType(type)

    setCaseActive(true)

    setUpdatingLocation(true)
    setLocationConfirmed(false)
    setSelectedCoords(null)
    setShowDashboard(false)

    addFeedItem(
      `Mr C Wallace started a new ${type.toLowerCase()} case`
    )

    updateVaultCaseData()

    const answers = questionAnswers.filter(
      answer => answer.trim().length > 0
    )

    answers.forEach((answer, index) => {

      const question =
        caseQuestions[type][index]

      addFeedItem(
        `${question}: ${answer}`
      )

      updateVaultCaseData()

    })

    db.runSync(
  `
    INSERT INTO vault_cases
    (
      title,
      createdAt,
      lastUpdatedAt,
      status,
      chat,
      feed
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `,
  [
  `${type} Case`,
  Date.now(),
  Date.now(),
  "OPEN",
  "",
  "",
  ]
)

const result = db.getFirstSync(
  `
    SELECT id
    FROM vault_cases
    ORDER BY id DESC
    LIMIT 1
  `
) as any

if (result?.id) {

  setCurrentVaultCaseId(result.id)

  loadOpenCases()

  db.runSync(
    `
      INSERT OR REPLACE INTO active_case
      (id, vaultCaseId)
      VALUES (1, ?)
    `,
    [result.id]
  )

}

  }

  function handleCloseCase() {

    Alert.alert(
      "Close Case",
      "Are you sure you want to close this case?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Yes",
          style: "destructive",

          onPress: () => {

            

            const feedItems = getAllFeedItems()

            

            const feedHistory = feedItems
              .map((item) => {

                return `[${new Date(
                  item.createdAt
                ).toLocaleTimeString()}] ${item.message}`

              })
              .join("\n")

            if (currentVaultCaseId) {

              db.runSync(
    `
                UPDATE vault_cases
                SET
                  feed = ?,
                  status = 'CLOSED'
                  WHERE id = ?
    `           ,
                [
                  feedHistory,
                  currentVaultCaseId,
                ]
              )

}

            setCaseActive(false)
            setCurrentVaultCaseId(null)

            db.runSync(
  `
    DELETE FROM active_case
    WHERE id = 1
  `
)

            setLocationConfirmed(false)

            setUpdatingLocation(false)

            setSelectedCoords(null)

            setIntruderLocation("")

            setLocationInput("")


            addFeedItem(
              "Mr C Wallace closed the case"
            )

            updateVaultCaseData()

            setShowCaseClosed(true)
          },
        },
      ]
    )
  }


  
  function handleStartCase() {

    setShowSituationModal(true)

  }

  function createActiveCaseTable() {

    db.execSync(`
      CREATE TABLE IF NOT EXISTS active_case (
        id INTEGER PRIMARY KEY,
       vaultCaseId INTEGER
      );
  ` )

}

  

  function loadOpenCases() {

    const rows = db.getAllSync(`
      SELECT *
      FROM vault_cases
      WHERE status = 'OPEN'
      ORDER BY lastUpdatedAt DESC
  ` ) as any[]

    setOpenCases(rows)  
  } 

  function updateVaultCaseData() {

      
    if (!currentVaultCaseId) {
      return
    }


    const feedItems = getAllFeedItems()


  const feedHistory = feedItems
    .map(item => {

      return `[${new Date(
        item.createdAt
      ).toLocaleTimeString()}] ${item.message}`

    })
    .join("\n")

  db.runSync(
    `
      UPDATE vault_cases
      SET
        feed = ?,
        lastUpdatedAt = ?,
      WHERE id = ?
    `,
    [
      feedHistory,
      Date.now(),
      currentVaultCaseId,
    ]
  )
}

function ensureLastUpdatedColumn() {

  try {

    db.execSync(`
      ALTER TABLE vault_cases
      ADD COLUMN lastUpdatedAt INTEGER
    `)

  } catch {}

  db.execSync(`
    UPDATE vault_cases
    SET lastUpdatedAt = createdAt
    WHERE lastUpdatedAt IS NULL
  `)

}




  function formatDate(
  timestamp: number
) {

  const date = new Date(timestamp)

  const today = new Date()

  const yesterday = new Date()

  yesterday.setDate(
    yesterday.getDate() - 1
  )

  const time = date.toLocaleTimeString(
    "en-GB",
    {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
  )

  const sameDay =
    date.toDateString() ===
    today.toDateString()

  const sameYesterday =
    date.toDateString() ===
    yesterday.toDateString()

  if (sameDay) {
    return `Today, ${time}`
  }

  if (sameYesterday) {
    return `Yesterday, ${time}`
  }

  return `${date.toLocaleDateString(
    "en-GB"
  )}, ${time}`
}


  function getServicesLabel() {

    return incidentType === "Maintenance"
      ? "Maintenance Services"
      : "Emergency Services"

  }


  return (

    <View style={styles.container}>

      <View style={styles.header}>

        <Image
          source={logo}
          style={styles.logo}
          resizeMode="contain"
        />

      </View>

      {caseActive && (

      <ThemedView style={styles.alertBox}>

        <Text style={styles.alertText}>
          ALERT
        </Text>

        {!caseActive ? (

          <Text style={styles.infoText}>
            No current developments
          </Text>

        ) : (

          <>
            <Text style={styles.infoText}>
              {incidentType} last seen in{" "}
              {intruderLocation}
            </Text>


            <View style={styles.row}>

              <Text style={styles.smallText}>
                {getServicesLabel()}
              </Text>

              <Text style={styles.smallText}>
                  
              </Text>

              <Text style={styles.blueText}>
                {serviceStatus}
              </Text>

            </View>
          </>
        )}

      </ThemedView>

      )}

      <View style={styles.content}>

  {(!caseActive || showDashboard) && !showMap && (

    <View style={styles.dashboardContainer}>

      <Text style={styles.sectionTitle}>
        Active Cases
      </Text>

      <ScrollView>

        {openCases.length === 0 ? (

          <Text style={styles.emptyText}>
            There are no open cases
          </Text>

        ) : (

          openCases.map((item) => (

            <View
  key={item.id}
  style={styles.caseCard}
>

  <View style={styles.caseHeaderRow}>

    <View style={{ flex: 1 }}>

      <Text style={styles.caseTitleCard}>
        {item.title}
      </Text>

      <Text style={styles.caseDateCard}>
        Last Updated:{" "}
        {formatDate(
          item.lastUpdatedAt ||
          item.createdAt
        )}
      </Text>

      <Text style={styles.caseDateCard}>
        Created:{" "}
        {formatDate(
          item.createdAt
        )}
      </Text>

    </View>

    <Pressable
      style={styles.closeCaseBtn}
      onPress={() => {

        db.runSync(
          `
            UPDATE vault_cases
            SET status = 'CLOSED'
            WHERE id = ?
          `,
          [item.id]
        )

        loadOpenCases()

      }}
    >

      <Text style={styles.closeCaseBtnText}>
        Close
      </Text>

    </Pressable>

  </View>

</View>

          ))

        )}

      </ScrollView>

      <View style={styles.bottomButtons}>

        <Pressable
          style={[
            styles.actionBottomButton,
            {
              backgroundColor: "#2563EB",
            },
          ]}
          onPress={() =>
            setShowMap(true)
          }
        >

          <Text style={styles.buttonText}>
            See Map
          </Text>

        </Pressable>

        <Pressable
          style={[
            styles.actionBottomButton,
            {
              backgroundColor: "#DC2626",
            },
          ]}
          onPress={handleStartCase}
        >

          <Text style={styles.buttonText}>
            Start Case
          </Text>

        </Pressable>

      </View>

    </View>

  )}

  {(!caseActive || showDashboard) && showMap && (

    <View style={{ flex: 1 }}>

      <Pressable
        style={styles.mapBackBtn}
        onPress={() =>
          setShowMap(false)
        }
      >

        <Text>
          ← Back
        </Text>

      </Pressable>

      <IntruderMap
        key={mapRefreshKey}
        floorPlan={floorPlan}
        updateMode={false}
        selectedCoords={confirmedCoords}
        showMarker={false}
      />

    </View>

  )}

  {caseActive && !showDashboard && (

    <>

      <View style={styles.mapContainer}>

        <IntruderMap
          key={mapRefreshKey}
          floorPlan={floorPlan}
          updateMode={updatingLocation}
          selectedCoords={
            selectedCoords || confirmedCoords
          }
          showMarker={
            selectedCoords !== null ||
            (
              caseActive &&
              intruderLocation.length > 0
            )
          }
          onMapPress={(coords) => {

            if (updatingLocation) {

              setSelectedCoords(coords)

            }

          }}
        />

      </View>

      {updatingLocation && (

        <Pressable
          style={[
            styles.confirmButton,
            {
              backgroundColor:
                selectedCoords
                  ? "#16A34A"
                  : "#6B7280",

              opacity:
                selectedCoords
                  ? 1
                  : 0.4,
            },
          ]}
          disabled={!selectedCoords}
          onPress={() => {

            if (selectedCoords) {
              setShowLabelModal(true)
            }

          }}
        >

          <Text style={styles.buttonText}>
            Confirm Location
          </Text>

        </Pressable>

      )}

      {!updatingLocation && (

        <View style={styles.actionsWrap}>

          <Pressable
            style={styles.handle}
            onPress={() => {

              setActionsOpen(
                !actionsOpen
              )

            }}
          >

            <View
              style={styles.handleLine}
            />

            <Text
              style={styles.handleLabel}
            >
              {actionsOpen
                ? "Hide Actions"
                : "Show Actions"}
            </Text>

          </Pressable>

          {actionsOpen && (

            <View
              style={styles.actionsBox}
            >

              <View
                style={
                  styles.actionButtonsRow
                }
              >

                <Pressable
                  style={[
                    styles.actionButton,
                    styles.feedButton,
                  ]}
                  onPress={() =>
                    setFeedVisible(true)
                  }
                >

                  <Text
                    style={
                      styles.actionButtonText
                    }
                  >
                    Live Feed
                  </Text>

                </Pressable>

              </View>

              <Pressable
                style={styles.redButton}
                onPress={() => {

                  setPoliceModalVisible(
                    true
                  )

                }}
              >

                <Text
                  style={styles.buttonText}
                >
                  {getServicesLabel()}
                </Text>

              </Pressable>

              <Pressable
                style={[
                  styles.redButton,
                  {
                    backgroundColor:
                      "#2563EB",
                    marginTop: 10,
                  },
                ]}
                onPress={() => {

                  setUpdatingLocation(
                    true
                  )

                  setSelectedCoords(
                    null
                  )

                }}
              >

                <Text
                  style={styles.buttonText}
                >
                  Update Location
                </Text>

              </Pressable>

              <View style={styles.caseBottomRow}>

  <Pressable
    style={[
      styles.caseBottomButton,
      {
        backgroundColor: "#4c6186",
      },
    ]}
    onPress={() => {

      loadOpenCases()

      setShowDashboard(true)

    }}
  >

    <Text style={styles.buttonText}>
      Home
    </Text>

  </Pressable>

  <Pressable
    style={[
      styles.caseBottomButton,
      {
        backgroundColor: "#6B7280",
      },
    ]}
    onPress={handleCloseCase}
  >

    <Text style={styles.buttonText}>
      Close Case
    </Text>

  </Pressable>

</View>

            </View>

          )}

        </View>

      )}

    </>

  )}

</View>

      <BottomSheet
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
      >

        <ChatSheet />

      </BottomSheet>

      <BottomSheet
        visible={feedVisible}
        onClose={() => setFeedVisible(false)}
      >

        <LiveFeedSheet />

      </BottomSheet>

      <BottomSheet
        visible={policeModalVisible}
        onClose={() => setPoliceModalVisible(false)}
      >

        <PoliceConfirmation
          serviceType={
            incidentType === "Maintenance"
              ? "Maintenance"
              : "Emergency"
          }
          onCancel={() => {
            setPoliceModalVisible(false)
          }}
          onConfirm={() => {

          setServiceStatus(
            incidentType === "Maintenance"
              ? "Maintenance notified"
              : "Emergency services notified"
          )

          addFeedItem(
            incidentType === "Maintenance"
              ? "Maintenance services have been notified"
              : "Emergency services have been notified"
          )

          updateVaultCaseData()

          setPoliceModalVisible(false)
          }}
        />

      </BottomSheet>

      <BottomSheet
        visible={showCaseClosed}
        onClose={() => setShowCaseClosed(false)}
      >

        <CaseClosedSheet
          onClose={() => {
            setShowCaseClosed(false)
          }}
        />

      </BottomSheet>

      <Modal
        visible={showSituationModal}
        transparent
        animationType="fade"
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalBox}>

            <Text style={styles.modalTitle}>
              What describes the situation?
            </Text>

            {[
              "Fire",
              "Intruder",
              "Injury",
              "Missing",
              "Maintenance",
            ].map((type) => (

              <Pressable
                key={type}
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: "#2563EB",
                    marginTop: 10,
                  },
                ]}
                onPress={() => {

                  setSelectedCaseType(type)

                  setQuestionAnswers(["", ""])

                  setShowSituationModal(false)

                  setShowQuestionModal(true)

                }}
              >

                <Text style={styles.modalButtonText}>
                  {type}
                </Text>

              </Pressable>
            ))}

            <Pressable
              style={[
                styles.modalButton,
                {
                  backgroundColor: "#6B7280",
                  marginTop: 16,
                },
              ]}
              onPress={() => {
                setShowSituationModal(false)
              }}
            >

              <Text style={styles.modalButtonText}>
                Cancel
              </Text>

            </Pressable>

          </View>

        </View>

      </Modal>

      <Modal
        visible={showQuestionModal}
        transparent
        animationType="fade"
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalBox}>

            <ScrollView
              showsVerticalScrollIndicator={false}
            >

              <Text style={styles.modalTitle}>
                {selectedCaseType} Details
              </Text>

              {(caseQuestions[selectedCaseType] || [])
                .map((question, index) => (

                  <View
                    key={question}
                    style={{ marginBottom: 16 }}
                  >

                    <Text style={styles.questionLabel}>
                      {question}
                    </Text>

                    <TextInput
                      style={styles.input}
                      placeholder="Enter response..."
                      placeholderTextColor="#999"
                      value={questionAnswers[index] || ""}
                      onChangeText={(text) => {

                        const updated = [...questionAnswers]

                        updated[index] = text

                        setQuestionAnswers(updated)

                      }}
                    />

                  </View>
                ))}

              <Pressable
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: "#16A34A",
                    marginTop: 10,
                  },
                ]}
                onPress={() => {

                  setShowQuestionModal(false)

                  openCase(selectedCaseType)

                }}
              >

                <Text style={styles.modalButtonText}>
                  Continue
                </Text>

              </Pressable>

            </ScrollView>

          </View>

        </View>

      </Modal>

      <Modal
        visible={showLabelModal}
        transparent
        animationType="fade"
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalBox}>

            <Text style={styles.modalTitle}>
              Enter Location
            </Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Corridor"
              placeholderTextColor="#999"
              value={locationInput}
              maxLength={15}
              onChangeText={(text) => {

                if (text.length <= 15) {
                  setLocationInput(text)
                }

              }}
            />

            <Pressable
              style={[
                styles.modalButton,
                {
                  backgroundColor: "#16A34A",
                  marginTop: 15,
                },
              ]}
              onPress={() => {

                if (
                  !locationInput.trim() ||
                  !selectedCoords
                ) {
                  return
                }

                const cleanLabel =
                  locationInput.trim()

                const coords = selectedCoords

                setConfirmedCoords(coords)

                setLocationConfirmed(true)

                setIntruderLocation(cleanLabel)

                if (currentVaultCaseId) {

                  db.runSync(
    `
                    UPDATE vault_cases
                    SET 
                      title = ?,
                      lastUpdatedAt = ?
                    WHERE id = ?
                    `,
                    [
                      `${incidentType} Case in ${cleanLabel}`,
                      Date.now(),
                      currentVaultCaseId,
                    ]
                  )

                }

                saveLocation(
                  coords.x,
                  coords.y,
                  cleanLabel
                )

                addFeedItem(
                  intruderLocation
                    ? `UPDATE! ${incidentType} location is now ${cleanLabel}`
                    : `CAUTION! ${incidentType} spotted in ${cleanLabel}`
                )

                updateVaultCaseData()

                setMapRefreshKey(
                  prev => prev + 1
                )

                setUpdatingLocation(false)

                setSelectedCoords(null)

                setLocationInput("")

                setShowLabelModal(false)

              }}
            >

              <Text style={styles.modalButtonText}>
                Continue
              </Text>

            </Pressable>

          </View>

        </View>

      </Modal>

    </View>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
    elevation: 3,
  },

  logo: {
    width: 150,
    height: 50,
    marginLeft: -25,
  },

  alertBox: {
    marginTop: 5,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#1F2937",
    borderLeftWidth: 8,
    borderLeftColor: "#DC2626",
    alignItems: "center",
  },

  alertText: {
    color: "#FCA5A5",
    fontSize: 16,
    fontWeight: "700",
  },

  infoText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    marginTop: 2,
  },

  smallText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  yellowText: {
    color: "#FACC15",
    fontSize: 15,
  },

  blueText: {
    color: "#60A5FA",
    fontSize: 15,
  },

  content: {
    flex: 1,
  },

  mapContainer: {
    flex: 1,
    width: "100%",
  },

  startButtonWrap: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    paddingHorizontal: 16,
  },

  actionsWrap: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },

  handle: {
    backgroundColor: "#111827",
    alignItems: "center",
    paddingVertical: 8,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },

  handleLine: {
    width: 40,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#6B7280",
    marginBottom: 6,
  },

  handleLabel: {
    color: "#D1D5DB",
    fontSize: 12,
    fontWeight: "600",
  },



  actionsBox: {
    backgroundColor: "#111827",
    padding: 12 ,
  },

  actionButtonsRow: {
    flexDirection: "row",
    marginBottom: 10,
  },

  actionButton: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#30497C",
    alignItems: "center",
  },

  feedButton: {
    backgroundColor: "#075B44",
  },

  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  redButton: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#DC2626",
    alignItems: "center",
  },

  confirmButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    width: "90%",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "85%",
    maxHeight: "75%",
    backgroundColor: "#1F2937",
    padding: 20,
    borderRadius: 16,
  },

  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  questionLabel: {
    color: "#D1D5DB",
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#111827",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#374151",
  },

  modalButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
  },


  dashboardContainer: {
  flex: 1,
  backgroundColor: "#FFFFFF",
  padding: 16,
},

sectionTitle: {
  fontSize: 24,
  fontWeight: "700",
  color: "#111827",
  marginBottom: 14,
  marginTop: 25,
},

emptyText: {
  color: "#6B7280",
  fontSize: 16,
},

caseCard: {
  backgroundColor: "#F9FAFB",
  padding: 16,
  borderRadius: 12,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: "#E5E7EB",
},

bottomButtons: {
  position: "absolute",
  bottom: 25,
  left: 16,
  right: 16,
  flexDirection: "row",
  gap: 12,
},

actionBottomButton: {
  flex: 1,
  borderRadius: 12,
  paddingVertical: 14,
  alignItems: "center",
},

mapBackBtn: {
  padding: 16,
},

caseDate: {
  color: "#6B7280",
  marginTop: 4,
},


caseTitleCard: {
  fontSize: 16,
  fontWeight: "700",
  color: "#111827",
  marginBottom: 5,
},

caseDateCard: {
  marginTop: 4,
  fontSize: 12,
  color: "#6B7280",
},

caseHeaderRow: {
  flexDirection: "row",
  alignItems: "center",
},

closeCaseBtn: {
  backgroundColor: "#DC2626",
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
},

closeCaseBtnText: {
  color: "#FFFFFF",
  fontWeight: "600",
},


caseBottomRow: {
  flexDirection: "row",
  marginTop: 10,
  gap: 10,
},

caseBottomButton: {
  flex: 1,
  paddingVertical: 10,
  borderRadius: 12,
  alignItems: "center",
},


}
)