import { StyleSheet } from 'react-native';

export const shared = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  screen: {
    width: '100%',
    maxWidth: 900,
    height: 640,
    maxHeight: '95%',
    backgroundColor: '#F0F2F5',
    borderRadius: 20,
    padding: 24,
  },
});