import React from "react"
import { FlatList, Image, StyleSheet, Text, View } from "react-native"


const activityData = [
  {
    id: "1",
    text: "Mr Johnson uploaded an image to \"Case_19-03-26\"",
    timestamp: "2026-03-19T16:12:00"
  },
  {
    id: "2",
    text: "Mrs Smith closed \"Case_19-03-26\"",
    timestamp: "2026-03-19T17:30:00"
  },
  {
    id: "3",
    text: "Mrs Smith started a new case: \"Case_19-03-26\"" ,
    timestamp: "2026-03-19T14:26:00"
  },
  {
    id: "4",
    text: "Mrs Martin uploaded an image to \"Case_19-03-26\"",
    timestamp: "2026-03-19T15:38:00"
  },
  {
    id: "5",
    text: "Mr Albot was made an admin",
    timestamp: "2026-03-16T10:18:00"
  },
  {
    id: "6",
    text: "Mr Albot was added to the group",
    timestamp: "2026-03-16T10:16:00"
  },
  {
    id: "7",
    text: "Mrs Wootton was added to the group",
    timestamp: "2026-03-16T10:15:00"
  },
]


// formats: Today, 14:30 | Yesterday, 10:15 | 15/03/26, 09:00
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  const yesterday = new Date()
  yesterday.setDate(now.getDate() - 1)

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()

  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const time = `${hours}:${minutes}`

  if (isToday) return `Today, ${time}`
  if (isYesterday) return `Yesterday, ${time}`

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = String(date.getFullYear()).slice(-2)

  return `${day}/${month}/${year}, ${time}`
}


export default function ActivityScreen() {

  // sort newest first
  const sortedData = [...activityData].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })

  const logo = require("../../assets/images/LGS-logo.png");

  const renderItem = ({ item }: any) => {
    return (
      <View style={styles.row}>

        <Text style={styles.text}>
          {item.text}
        </Text>

        <Text style={styles.date}>
          {formatDateTime(item.timestamp)}
        </Text>

      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={logo} style={styles.logoImage} resizeMode="contain" />
      </View>

      <FlatList
        data={sortedData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

    </View>
  )
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff"
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

  logoImage: {
    width: 150,
    height: 50,
    marginLeft: -25,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },

  text: {
    flex: 1,
    fontSize: 15,
    color: "#222",
    paddingRight: 10
  },

  date: {
    fontSize: 13,
    color: "#777"
  }

})
