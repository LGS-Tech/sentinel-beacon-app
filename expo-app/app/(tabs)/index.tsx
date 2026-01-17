// Dashboard - MAIN FILE

import React from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const floorPlan = require('../../assets/images/LGSFloorPlan_v1.png');
//TODO: floor plan will be behind ui but should be scrollable and clickable
export default function HomeScreen() {
  const status = 'Intruder in corridor';  // TODO: replace with realtime API data

  return (
    <ImageBackground
      source={floorPlan}
      style={styles.root}
      resizeMode="cover"
    >
      <ThemedView style={styles.statusBar}>
        <ThemedText style={styles.statusText}>
          Status: {status}
        </ThemedText>
      </ThemedView>

      <View style={styles.actions}> 
        {/* TODO: button functionality added */}
        <Pressable style={[styles.roundBtn, styles.chatPos]} onPress={handleChat}>
          <Text style={styles.btnText}>Chat</Text>
        </Pressable>

        <Pressable style={[styles.roundBtn, styles.feedBtn, styles.feedPos]} onPress={handleFeed}>
          <Text style={styles.btnText}>Live feed</Text>
        </Pressable>

        <Pressable style={[styles.policeBtn, styles.policeBtnPos]} onPress={handlePolice}>
          <Text style={styles.policeText}>Call police</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}


const handleChat = () => {
  console.log('Opening chat...');
};

const handleFeed = () => {
  console.log('Opening live feed');
};


const handlePolice = () => {
  // probably should add confirmation modal here
  console.log('Calling police...');
};

const SIZE = 80;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  statusBar: {
    position: 'absolute',
    top: 0,
    width: '100%',
    paddingVertical: 48,
    backgroundColor: 'rgba(248,0,0,0.83)',
    alignItems: 'center',
  },

  statusText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginTop: 16,
  },

  actions: {
    position: 'absolute',
    bottom: 36,
    width: '100%',
    height: 190,
    justifyContent: 'center',
  },

  roundBtn: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: 'rgba(112,213,222,1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  feedBtn: {
    backgroundColor: 'rgba(101,201,131,1)',
  },

  policeBtn: {
    position: 'absolute',
    width: SIZE * 2,
    height: SIZE,
    borderRadius: 20,
    backgroundColor: 'rgba(228,10,10,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },


  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  policeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 22,
  },

  policeBtnPos: {
    alignSelf: 'center',
    bottom: 18,
  },

  chatPos: {
    bottom: 108,
    left: 28,
  },

  feedPos: {
    bottom: 108,
    right: 28,
  },


});
