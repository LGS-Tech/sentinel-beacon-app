// Chat panel used by staff to coordinate in real time

import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Message = {
  id: string;
  name: string;
  text: string;
  time: string;
};

const MESSAGES: Message[] = [
  {
    id: "1",
    name: "Mrs Smith",
    text: "Spotted a male in the corridor outside C1. He has a red hoodie and white trainers, looks like he's in his early 20s" , 
    time: "14:32",
  },
  {
    id: "2",
    name: "Mrs Martin",
    text: "Sent a picture            View",  // TODO: add actual button
    time: "14:34",
  },
  {
    id: "3",
    name: "Mr Albot",
    text: "Police have been notified and are on the way",
    time: "14:36",
  }

];


export default function ChatSheet() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Team Chat</Text>

      <FlatList
        data={MESSAGES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        renderItem={({ item }) => (
          <View style={styles.messageBlk}>
            <Text style={styles.name}>{item.name}</Text>

            <View style={styles.messageRow}>
              <Text style={styles.messageTxt}>{item.text}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.inputBar}>
        <TextInput
          placeholder="Type a message…"
          style={styles.input}
          placeholderTextColor="#888"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },

  messages: {
    paddingBottom: 12,
  },

  messageBlk: {
    marginBottom: 14,
  },

  name: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginBottom:4,
  },


  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },

  messageTxt: {
    flex: 1,
    fontSize: 15,
    color: "#222" ,
    marginRight: 8,
  },

  time: {
    fontSize:12,
    color: "#999",
  },

  inputBar: {
    borderTopWidth: 1,
    borderTopColor: "#E1E5EA",
    paddingTop: 10,
  },

  input: {
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F3F6",
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#000",
  },


});
