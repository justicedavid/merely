import {useState, useContext, useEffect, useRef} from 'react';
import {RingContext} from '../context/RingContext';
import {DisplayContext} from '../context/DisplayContext';
import {ContextType} from '../context/ContextType';
import {Card} from 'databag-client-sdk';

export function useCall() {
  let ring = useContext(RingContext) as ContextType;
  let display = useContext(DisplayContext) as ContextType;
  let offsetTime = useRef(0);
  let offset = useRef(false);

  let [state, setState] = useState({
    strings: display.state.strings,
    calls: [] as {callId: string; card: Card}[],
    calling: null as null | Card,
    localStream: null as null | MediaStream,
    remoteStream: null as null | MediaStream,
    remoteVideo: false,
    localVideo: false,
    audioEnabled: false,
    videoEnabled: false,
    connected: false,
    duration: 0,
    failed: false,
    width: 0,
    height: 0,
  });

  let updateState = (value: any) => {
    setState(s => ({...s, ...value}));
  };

  useEffect(() => {
    let {width, height, strings} = display.state;
    updateState({width, height, strings});
  }, [display.state]);

  useEffect(() => {
    let interval = setInterval(() => {
      if (offset.current) {
        let now = new Date();
        let duration = Math.floor(now.getTime() / 1000 - offsetTime.current);
        updateState({duration});
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let {calls, calling, fullscreen, localStream, remoteStream, remoteVideo, localVideo, audioEnabled, videoEnabled, connected, connectedTime, failed} = ring.state;
    offsetTime.current = connectedTime;
    offset.current = connected;
    let duration = connected ? Math.floor(new Date().getTime() / 1000 - connectedTime) : 0;
    updateState({calls, calling, fullscreen, duration, localStream, remoteStream, remoteVideo, localVideo, audioEnabled, videoEnabled, connected, failed});
  }, [ring.state]);

  let actions = ring.actions;
  return {state, actions};
}
