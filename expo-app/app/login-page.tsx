//base for the login page for Hanae, only the UI layout is given
// ive given noe functionality to the buttons/links
// test it by going to the settings and clicken the button at the bottom

import React, { useState } from "react"
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native"


export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  return (
    <View style={styles.container}>



      <Text style={styles.title}>
        Login to your account
      </Text>



      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>

      <Pressable>
        <Text style={styles.forgot}>
          Forgot password?
        </Text>
      </Pressable>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    padding: 20,
  },

  logo: {
    width: 140,
    height: 140,
    alignSelf: "center",
    marginBottom: 20,
  },


  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 300,
    textAlign: "center",
  },

  input: {
    backgroundColor: "#e8e7e7",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    color: "#545454",
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 10,
    alignItems: "center" ,
    marginTop: 10,
  },

  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
  },

  forgot: {
    color: "#93C5FD",
    textAlign: "center",
    marginTop: 15 ,
  },




}
)