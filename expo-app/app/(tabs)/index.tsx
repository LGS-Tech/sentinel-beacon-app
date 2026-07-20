//dashboard - specialised prompts to be added for each case type
//the continue button needs to be inactivated until prompts have been selecteed
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

import DashboardMap from "@/components/dashboard-map"

import IntruderMap from "@/components/intruder-map"

import LiveFeedSheet, {
  addFeedItem,
  clearFeed,
  getAllFeedItems,
} from "@/components/live-feed"

import CaseClosedSheet from "@/components/close-sheet"
import PoliceConfirmation from "@/components/police-confirmation"
import BottomSheet from "@/components/sheet"

import { ThemedView } from "@/components/themed-view"

//import { db } from "@/lib/db"

import {
  createCase,
  getCases,
  updateCase
} from "@/lib/db"




//const db = SQLite.openDatabaseSync("app.db")



const floorPlan = require("../../assets/images/LGSUniFloorPlan.png")
const logo = require("../../assets/images/LGS-logo.png")

const defaultCoords = {

  x: 0.52,
  y: 0.79,
}




const caseQuestions: Record<
  string,
  {
    question: string
    type: "text" | "yesno"
  }[]
> = {
  Fire: [
    {
      question: "Has everyone present been evacuated?",
      type: "yesno",
    },
    {
      question: "Have the fire department been contacted?",
      type: "yesno",
    },
  ],

  Intruder: [
    {
      question: "Describe the intruder",
      type: "text",
    },
    {
      question: "Are they carrying out anti-social behaviour?",
      type: "yesno",
    },
    {
      question: "Have the police been contacted?",
      type: "yesno",
    },
  ],

  Injury: [
    {
      question: "Describe the injury",
      type: "text",
    },
    {
      question: "Have the emergency services been contacted?",
      type: "yesno",
    },
    {
      question: "What medical assistance has been provided?",
      type: "text",
    },
  ],



  Maintenance: [
    {
      question: "Describe the maintenance issue",
      type: "text",
    },
    {
      question: "Does it pose a danger to anyone?",
      type: "yesno",
    },
    {
      question: "Have the maintenance team been contacted?",
      type: "yesno",
    },
  ],
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

  const [selectedCaseType, setSelectedCaseType] = useState("" )

  const [questionAnswers, setQuestionAnswers] = useState<string[]>(["", ""])
  const [currentVaultCaseId, setCurrentVaultCaseId] =  useState<number | null>(null)


  const [showMap, setShowMap] = useState(false)

  const [openCases, setOpenCases] =  useState<any[]>([])
  const [showDashboard, setShowDashboard] = useState(false)


  const [sheetExpanded, setSheetExpanded] = useState(false)
  const [selectedMapCase, setSelectedMapCase] = useState<any | null>(null)








  async function saveLocation(
    x: number,
    y: number,
    label: string
  ) {

  const newCase =
await createCase({

    title:`${incidentType} Case`,

    createdAt:Date.now(),

    lastUpdatedAt:Date.now(),

    status:"ACTIVE",

    locationX:x,

    locationY:y,

    locationLabel:label,

    feed:"",

    chat:""

});

setCurrentVaultCaseId(newCase._id ?? newCase.id)

await loadOpenCases();
}
  


  function updateServiceStatusFromAnswer(
  question: string,
  answer: string
) {

  const isEmergencyQuestion =
    question.includes("emergency services") ||
    question.includes("fire department") ||
    question.includes("police")

  const isMaintenanceQuestion =
    question.includes("maintenance team")


  if (!isEmergencyQuestion && !isMaintenanceQuestion) {
    return
  }


  if (isMaintenanceQuestion) {

    setServiceStatus(
      answer === "Yes"
        ? "Notified"
        : "Not notified"
    )

    return
  }


  setServiceStatus(
    answer === "Yes"
      ? "Notified"
      : "Not notified"
  )
}


  useEffect(() => {




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

  async function openCase(type: string) {


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
    loadOpenCases()

    const answers = questionAnswers.filter(
      answer => answer.trim().length > 0
    )

    answers.forEach((answer, index) => {

      const question =  caseQuestions[type][index].question

      addFeedItem(
        `${question}: ${answer}`
      )

      updateVaultCaseData()
      loadOpenCases()

    })

   const newCase = await createCase({

    title:`${type} Case`,

    createdAt:Date.now(),

    lastUpdatedAt:Date.now(),

    status:"ACTIVE",

    locationX:defaultCoords.x,

    locationY:defaultCoords.y,

    locationLabel:"",

    chat:"",

    feed:""

})


setCurrentVaultCaseId(
    newCase._id ?? newCase.id
)


await loadOpenCases()

}

  function openExistingCase(caseData: any) {

  setCurrentVaultCaseId( caseData._id ?? caseData.id)

  setCaseActive(true)

  setShowDashboard(false)

  setLocationConfirmed(true)

  setUpdatingLocation(false)

  clearFeed()

  if (caseData.feed) {

  caseData.feed
    .split("\n")
    .filter(Boolean)
    .forEach((line: string) => {

      const message =
        line.replace(
          /^\[[^\]]+\]\s*/,
          ""
        )

      addFeedItem(message)

    })

}


  setIncidentType(
    caseData.title.split(" Case")[0]
  )

  setIntruderLocation(
  caseData.locationLabel ||
  caseData.title.split(" in ")[1] ||
  ""
)

  setConfirmedCoords({
  x: Number(caseData.locationX ?? defaultCoords.x),
  y: Number(caseData.locationY ?? defaultCoords.y),
})

console.log("CASE OPENED")
console.log("locationX:", caseData.locationX)
console.log("locationY:", caseData.locationY)

}


  async function handleCloseCase() {

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

          onPress: async () => {

            

            //backend now handles feed items directly, no longer need to update db from live-feed.tsx
            const feedItems = getAllFeedItems() 

            

            const feedHistory = feedItems
              .map((item) => {

                return `[${new Date(
                  item.createdAt
                ).toLocaleTimeString()}] ${item.message}`

              })
              .join("\n")

            if(currentVaultCaseId){

              
              await updateCase(
                currentVaultCaseId.toString(),

              {
                status:"CLOSED",
                feed:feedHistory,
                lastUpdatedAt:Date.now()
              }

              )

            }

            setCaseActive(false)
            setCurrentVaultCaseId(null)

           

            setLocationConfirmed(false)

            setUpdatingLocation(false)

            setSelectedCoords(null)

            setIntruderLocation("")

            setLocationInput("")


            addFeedItem(
              "Mr C Wallace closed the case"
            )

            updateVaultCaseData()
            loadOpenCases()

            setShowCaseClosed(true)
          },
        },
      ]
    )
  }


  
  function handleStartCase() {

    setShowSituationModal(true)

  }



  

  async function loadOpenCases(){

    const rows =
        await getCases();

    console.log(
        rows.map((c: { id: any; _id: any; title: any }) => ({
            id: c.id,
            _id: c._id,
            title: c.title,
        }))
    );

    setOpenCases(

        rows.filter(

            (c:any)=>

            c.status==="ACTIVE"

        )

    );

}

  async function updateVaultCaseData(){

 if(!currentVaultCaseId){
   return
 }


 const feedItems=getAllFeedItems()


 const feedHistory =
 feedItems
 .map(item =>
 `[${new Date(item.createdAt)
 .toLocaleTimeString()}] ${item.message}`
 )
 .join("\n")


 await updateCase(

 currentVaultCaseId.toString(),

 {
   feed:feedHistory,
   lastUpdatedAt:Date.now()
 }

 )

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

      {caseActive && !showDashboard && (

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
              {locationConfirmed
                ? (
                    incidentType === "Intruder" ||
                    incidentType === "Missing"
                  )
                  ? `${incidentType} last seen in ${intruderLocation}`
                  : `${incidentType} in ${intruderLocation}`
                : incidentType
              }
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

{!caseActive && (

    <View style={{ flex: 1 }}>

        <DashboardMap
          cases={openCases}
          selectedCase={selectedMapCase}
          onMarkerPress={setSelectedMapCase}
          onView={openExistingCase}
        />

        <Pressable
            style={styles.floatingStartCase}
            onPress={handleStartCase}
        >
            <Text style={styles.floatingStartText}>
                Start Case
            </Text>
        </Pressable>

        {selectedMapCase ? (

            <View
                style={styles.bottomSheet}
            >

                <Text style={styles.sheetHeading}>
                    {selectedMapCase.title}
                </Text>

                <Text style={styles.sheetSubHeading}>
                    Created:{" "}
                    {formatDate(selectedMapCase.createdAt)}
                </Text>

                <Text style={styles.sheetSubHeading}>
                    Updated:{" "}
                    {formatDate(selectedMapCase.lastUpdatedAt)}
                </Text>

                <Pressable
                    style={styles.viewButton}
                    onPress={() =>
                        openExistingCase(selectedMapCase)
                    }
                >
                    <Text style={styles.buttonText}>
                        View
                    </Text>
                </Pressable>

            </View>

        ) : (

            <Pressable
                style={[
                    styles.bottomSheet,
                    sheetExpanded &&
                        styles.bottomSheetExpanded,
                ]}
                onPress={() =>
                    setSheetExpanded(!sheetExpanded)
                }
            >

                <View style={styles.sheetHandle}>
                    <View style={styles.handleBar} />
                </View>

                <Text style={styles.sheetHeading}>
                    Home
                </Text>

                <ScrollView>

                  <Pressable
    style={{
        backgroundColor: "#2563EB",
        marginTop: 18,
        marginBottom: 20,
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: "center",
    }}
    onPress={handleStartCase}
>

    <Text
        style={{
            color: "#FFF",
            fontWeight: "700",
            fontSize: 17,
        }}
    >
        Start Case
    </Text>

</Pressable>


                    {openCases.map((item) => (

                        <Pressable
                            key={item.id}
                            style={styles.caseCard}
                            onPress={() =>
                                openExistingCase(item)
                            }
                        >

                            <Text
                                style={
                                    styles.caseTitleCard
                                }
                            >
                                {item.title}
                            </Text>

                            <Text
                                style={
                                    styles.caseDateCard
                                }
                            >
                                Updated{" "}
                                {formatDate(
                                    item.lastUpdatedAt
                                )}
                            </Text>

                        </Pressable>

                    ))}

                </ScrollView>

            </Pressable>

        )}

    </View>

)}

{caseActive && (

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
  locationConfirmed
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
                    styles.redButton,
                    styles.feedButton,
                  ]}
                  onPress={() =>
                    setFeedVisible(true)
                  }
                >

                  <Text
                    style={
                      styles.buttonText
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
                      "#ffffff",
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
                    backgroundColor: "#ffffff",
                  },
                ]}
                onPress={() => {

      

                  setCaseActive(false)
                  setSelectedMapCase(null)
                  loadOpenCases()

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
        backgroundColor: "#ffffff",
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
          servicesAlreadyNotified={
            serviceStatus.includes("Notified") &&
            !serviceStatus.includes("Not notified")
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
          loadOpenCases()

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

            <Text style={styles.modalSubtitle}>
              Choose the option that best describes your report
            </Text>

            {[
              {
                label: "Fire",
                icon: "🔥",
              },
              {
                label: "Intruder",
                icon: "🚨",
              },
              {
                label: "Injury",
                icon: "🩹",
              },
              {
                label: "Maintenance",
                icon: "🔧",
              },
            ].map((item) => (

              <Pressable
                key={item.label}
                style={styles.situationCard}
                onPress={() => {

                  setSelectedCaseType(item.label)
                  setQuestionAnswers(["", ""])

                  setShowSituationModal(false)
                  setShowQuestionModal(true)

                }}
              >

                <View style={styles.situationLeft}>

                  <Text style={styles.situationEmoji}>
                    {item.icon}
                  </Text>

                  <Text style={styles.situationText}>
                    {item.label}
                  </Text>

                </View>

                <Text style={styles.chevron}>
                  ›
                </Text>

              </Pressable>

            ))}

            <Pressable
              style={[
                styles.modalButton,
                {
                  backgroundColor: "#d9dbdd",
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
                .map((item, index) => (

                  <View
                    key={item.question}
                    style={{ marginBottom: 16 }}
                  >

                    <Text style={styles.questionLabel}>
                      {item.question}
                    </Text>

                    {item.type === "yesno" ? (

                      <View
                        style={{
                          flexDirection: "row",
                          gap: 10,
                        }}
                      >

                        <Pressable
                          style={[
                            styles.yesNoButton,
                            questionAnswers[index] === "Yes" && {
                              backgroundColor: "#34b864",
                            },
                          ]}
                          onPress={() => {

                            const updated = [...questionAnswers]

                            updated[index] = "Yes"

                            setQuestionAnswers(updated)

                            updateServiceStatusFromAnswer(
                              item.question,
                              "Yes"
                            )
                          }}
                        >
      <Text style={styles.modalButtonText}>
        Yes
      </Text>
    </Pressable>

    <Pressable
      style={[
        styles.yesNoButton,
        questionAnswers[index] === "No" && {
          backgroundColor: "#e13f3f",
        },
      ]}
      onPress={() => {

        const updated = [...questionAnswers]

        updated[index] = "No"

        setQuestionAnswers(updated)

        updateServiceStatusFromAnswer(
          item.question,
          "No"
        )

      }}
    >
        <Text style={styles.modalButtonText}>
          No
        </Text>
    </Pressable>

  </View>

) : (

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

)}

              </View>
              )
              )}

              

              <Pressable
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: "#64c982",
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

              <Pressable
                style={styles.backButton}
                onPress={() => {

                  setShowQuestionModal(false)
                  setShowSituationModal(true)

                }}
              >
                <Text style={styles.backButtonText}>
                  Back
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
      backgroundColor:"#71d795",
      marginTop:15,
    },
  ]}

  onPress={async()=>{

    if(
      !locationInput.trim() ||
      !selectedCoords
    ){
      return
    }


    const cleanLabel =
      locationInput.trim()


    const coords =
      selectedCoords


    setConfirmedCoords(coords)

    setLocationConfirmed(true)

    setIntruderLocation(cleanLabel)


    if(currentVaultCaseId){

      await updateCase(

        currentVaultCaseId.toString(),

        {
          locationX:coords.x,
          locationY:coords.y,
          locationLabel:cleanLabel,
          lastUpdatedAt:Date.now()
        }

      )

    }


    addFeedItem(

      intruderLocation

      ? `UPDATE! ${incidentType} location is now ${cleanLabel}`

      : `CAUTION! ${incidentType} spotted in ${cleanLabel}`

    )


    await updateVaultCaseData()

    await loadOpenCases()


    setMapRefreshKey(
      prev=>prev+1
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
    backgroundColor: "#e3e3e3",
    borderLeftWidth: 8,
    borderLeftColor: "#b6b6b6",
    alignItems: "center",
  },

  alertText: {
    color: "#c41313",
    fontSize: 18,
    fontWeight: "700",
  },

  infoText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    marginTop: 2,
  },

  smallText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "600",
  },

  yellowText: {
    color: "#FACC15",
    fontSize: 15,
  },

  blueText: {
    color: "#000000",
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
    backgroundColor: "#e3e3e3",
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
    color: "#000000",
    fontSize: 12,
    fontWeight: "600",
  },



  actionsBox: {
    backgroundColor: "#ebeaea",
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
    backgroundColor: "#ffffff",
  },

  actionButtonText: {
    color: "#000000",
    fontWeight: "600",
  },

  redButton: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },

  viewButton: {
    width: "100%",
    marginTop: 30,
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
    color: "#000000",
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
    width: "90%",
    backgroundColor: "#F5F5F5",
    borderRadius: 28,
    padding: 24,
  },

  modalTitle: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  questionLabel: {
    color: "#545454",
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#e2e0e0",
    color: "#000000",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d4d4d4",
  },

  modalButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  modalButtonText: {
    color: "#000000",
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


yesNoButton: {
  flex: 1,
  paddingVertical: 12,
  borderRadius: 10,
  backgroundColor: "#d8d8d8",
  alignItems: "center",
},

floatingStartCase: {
    position: "absolute",

    bottom: 120,
    right: 24,

    backgroundColor: "#2563EB",

    paddingHorizontal: 22,
    paddingVertical: 14,

    borderRadius: 28,

    elevation: 8,
},

floatingStartText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
},

bottomSheet: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    height: 220,

    backgroundColor: "#f8f8f8",

    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,

    padding: 18,
},

bottomSheetExpanded: {
    height: "60%",
},

sheetHandle: {
    alignItems: "center",
    marginBottom: 12,
},

handleBar: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#C8C8C8",
},

sheetHeading: {
    fontSize: 23,
    fontWeight: "700",
    marginBottom: 16,
    marginTop: 16,
    color: "#070707",
},

sheetSubHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5a5959",
},



situationCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 18,

  paddingHorizontal: 18,
  paddingVertical: 18,

  marginBottom: 14,

  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",

  borderWidth: 1,
  borderColor: "#E5E7EB",
},

situationLeft: {
  flexDirection: "row",
  alignItems: "center",
},

situationEmoji: {
  fontSize: 24,
  marginRight: 14,
},

situationText: {
  fontSize: 17,
  fontWeight: "600",
  color: "#111827",
},

chevron: {
  fontSize: 28,
  color: "#9CA3AF",
  fontWeight: "300",
},

modalSubtitle: {
  color: "#000000",
  fontSize: 14,
  marginTop: 6,
  marginBottom: 24,
},

cancelButton: {
  marginTop: 10,
  backgroundColor: "#E5E7EB",
  borderRadius: 16,
  alignItems: "center",
  paddingVertical: 15,
},

cancelButtonText: {
  color: "#374151",
  fontWeight: "700",
  fontSize: 16,
},




backButton: {
  marginTop: 12,
  paddingVertical: 12,
  borderRadius: 12,
  backgroundColor: "#E5E7EB",
  alignItems: "center",
},

backButtonText: {
  color: "#374151",
  fontWeight: "700",
  fontSize: 16,
},


}
)