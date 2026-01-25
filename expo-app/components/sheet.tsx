// Reusable bottom sheet used across the app (chat, live updates, etc.)

import React from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    View,
} from "react-native";

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function BottomSheet({
  visible,
  onClose,
  children,
}: BottomSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Tap outside the sheet to close */}
      <Pressable style={styles.overlay} onPress={onClose}>
        <View />
      </Pressable>

      <View style={styles.sheet}>
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },

  sheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    minHeight: 300,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,

    // shadows
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 20,
  },
});
