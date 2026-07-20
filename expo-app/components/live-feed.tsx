// Live activity feed shown during incidents


import React, { useEffect, useState } from "react"

import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native"


type FeedItem = {
  id:string
  time:string
  message:string
  createdAt:number
}


// temporary in-memory feed storage
let feedItems:FeedItem[] = []



// format timestamp
const formatTime = (timestamp:number)=>{

  const d = new Date(timestamp)

  const h =
    String(d.getHours())
    .padStart(2,"0")

  const m =
    String(d.getMinutes())
    .padStart(2,"0")


  return `${h}:${m}`

}



// return all feed entries
export const getAllFeedItems = ()=>{

  return feedItems

}



// add a new feed entry
export const addFeedItem = (
  message:string
)=>{

  const item:FeedItem = {

    id:
      Date.now().toString(),

    time:
      formatTime(Date.now()),

    message,

    createdAt:
      Date.now()

  }


  feedItems.push(item)

}



// clear when starting a new case
export const clearFeed = ()=>{

  feedItems = []

}




export default function LiveFeedSheet(){

  const [logs,setLogs] =
    useState<FeedItem[]>([])



  useEffect(()=>{


    setLogs(
      [...feedItems]
      .reverse()
    )


    const interval =
      setInterval(()=>{


        setLogs(
          [...feedItems]
          .reverse()
        )


      },1000)


    return ()=>clearInterval(interval)


  },[])



  return (

    <View style={styles.container}>


      <Text style={styles.title}>
        Live Updates
      </Text>



      <FlatList

        data={logs}

        keyExtractor={
          item=>item.id
        }

        contentContainerStyle={
          styles.logContainer
        }

        showsVerticalScrollIndicator={false}


        renderItem={
          ({item})=>(

            <View style={styles.logRow}>


              <Text style={styles.time}>
                {item.time}
              </Text>


              <Text style={styles.message}>
                {item.message}
              </Text>


            </View>

          )
        }

      />


    </View>

  )

}




const styles = StyleSheet.create({

  container:{
    flex:1,
    paddingHorizontal:16,
  },


  title:{
    fontSize:22,
    fontWeight:"700",
    marginBottom:16,
  },


  logContainer:{
    backgroundColor:"#F4F6F9",
    borderRadius:14,
    overflow:"hidden",
    paddingBottom:8,
  },


  logRow:{
    flexDirection:"row",
    alignItems:"flex-start",
    paddingVertical:14,
    paddingHorizontal:16,
    borderBottomWidth:1,
    borderBottomColor:"#E5E7EB",
  },


  time:{
    width:58,
    color:"#DC2626",
    fontWeight:"700",
    fontSize:14,
    marginTop:1,
  },


  message:{
    flex:1,
    fontSize:15,
    lineHeight:21,
    color:"#333",
    paddingRight:6,
  },

})