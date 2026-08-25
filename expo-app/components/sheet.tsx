// a reusable bottom sheet for dashboard purposes

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

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
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  //opening and closing ani
  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // dragging
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dy) > 5;
      },

      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },

      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 120) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* background */}
      <Pressable style={styles.overlay} onPress={onClose} />

      {/* sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        {/*drag handle – hidden on web */}
        {Platform.OS !== 'web' && (
          <View {...panResponder.panHandlers} style={styles.dragZone}>
            <View style={styles.handle} />
          </View>
        )}

        {/* close button for desktop/web */}
        {Platform.OS === 'web' && (
          <View style={styles.webHeader}>
            <Pressable style={styles.webCloseBtn} onPress={onClose}>
              <Text style={styles.webCloseBtnText}>\u2715</Text>
            </Pressable>
          </View>
        )}

        {/* content */}
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  sheet: {
    position: 'absolute',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 20,
    ...Platform.select({
      web: {
        bottom: undefined,
        top: '5%',
        left: undefined,
        right: undefined,
        alignSelf: 'center',
        width: '92%',
        maxWidth: 660,
        height: '88%',
        borderRadius: 20,
      },
      default: {
        bottom: 0,
        width: '100%',
        height: '85%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      },
    }),
  },

  dragZone: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ccc',
  },

  content: {
    flex: 1,
  },

  webHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },

  webCloseBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },

  webCloseBtnText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '700',
    lineHeight: 16,
  },
});
