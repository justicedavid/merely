import { StyleSheet } from 'react-native';
import { Colors } from 'constants/Colors';

export let styles = StyleSheet.create({
  overlay: {
    marginRight: 16,
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 2,
    borderTopLeftRadius: 4,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
})

