// services page for contact of the maintenance or emergency when needed

import React from "react"
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"




type PoliceConfirmationProps = {
  serviceType?: "Emergency" | "Maintenance"
  servicesAlreadyNotified?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function PoliceConfirmation({
  serviceType = "Emergency",
  servicesAlreadyNotified = false,
  onConfirm,
  onCancel,
}: PoliceConfirmationProps) {

  

  const message =
    serviceType === "Maintenance"
      ? "Do you wish to notify maintenance services?"
      : "Do you wish to notify the emergency services?"




  const title =
    serviceType === "Maintenance"
      ? "Maintenance Services"
      : "Emergency Services"    



  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        {title}

      </Text>




      <Text style={styles.statusQuestion}>
  Have the {serviceType.toLowerCase()} services been notified?
</Text>

<View style={styles.yesNoRow}>

  <Pressable
    style={[

      styles.yesNoButton,
      servicesAlreadyNotified && {
        backgroundColor:  "#16A34A",
      },
    ]}
  >
    <Text style={styles.yesNoText}>
      Yes
    </Text>
  </Pressable>



  <Pressable
    style={[
      styles.yesNoButton,
      !servicesAlreadyNotified && {
        backgroundColor: "#DC2626" ,
      },
    ]}
  >
    <Text style={styles.yesNoText}>
      No
    </Text>
  </Pressable>

</View>




      <Text style={styles.message}>
        {message}
      </Text>


      <View style={styles.actions}>

        <Pressable
          style={styles.cancelBtn}
          onPress={onCancel}
        >

          <Text style={styles.cancelText}>
            Cancel
          </Text>

        </Pressable>

        <Pressable
          style={styles.confirmBtn}
          onPress={onConfirm}
        >

          <Text style={styles.confirmText}>
            Confirm
          </Text>

        </Pressable>

      </View>

    </View>

  )
}

const styles = StyleSheet.create({

  container: {
    padding: 20,
    alignItems: "center",
  },

  title: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 25,
  },



  message: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 15,
  },

  actions: {
    flexDirection: "row",
    width: "100%",
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    marginRight: 8,
    alignItems: "center",
  },

  confirmBtn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 12,
    backgroundColor: "#DC2626",
    marginLeft: 8,
    alignItems: "center",
  },

  cancelText: {
    fontWeight: "600",
    color: "#111827",
  },

  confirmText: {
    fontWeight: "700",
    color: "#fff",
  },


  statusQuestion: {
  fontSize: 15,
  fontWeight: "600",
  marginBottom: 12,
  marginTop: 30,
  textAlign: "center",
},

yesNoRow: {
  flexDirection: "row",
  width: "100%",
  marginBottom: 65,
  gap: 10,
},

yesNoButton: {
  flex: 1,
  paddingVertical: 12,
  borderRadius: 10,
  backgroundColor: "#f2f3f6",
  alignItems: "center",
},

yesNoText: {
  fontWeight: "600",
  color: "#111827",
},

})