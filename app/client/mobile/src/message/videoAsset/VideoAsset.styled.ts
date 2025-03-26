import {StyleSheet} from 'react-native';
import {Colors} from '../../constants/Colors';

export const styles = StyleSheet.create({
  modal: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  failed: {
    color: Colors.offsync,
  },
  control: {
    position: 'absolute',
    opacity: 0.6,
    borderRadius: 8,
  },
  iconButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  button: {
    position: 'absolute',
    borderRadius: 16,
  },
  blur: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  video: {
    position: 'relative',
  },
  thumb: {
    borderRadius: 4,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  full: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  close: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'row',
    top: 0,
    right: 0,
  },
  closeIcon: {
    borderRadius: 8,
    opacity: 0.7,
  },
  progress: {
    position: 'absolute',
    bottom: '10%',
    width: '50%',
  },
  alert: {
    position: 'absolute',
    bottom: 0,
  },
  alertLabel: {
    color: Colors.offsync,
  },
  spacer: {
    flexGrow: 1,
  },
});
