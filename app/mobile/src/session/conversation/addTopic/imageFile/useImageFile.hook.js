import { useState, useRef, useEffect, useContext } from 'react';

export function useImageFile() {

  let [state, setState] = useState({
    loaded: false,
    ratio: 1,
  });

  let updateState = (value) => {
    setState((s) => ({ ...s, ...value }));
  }

  let actions = {
    loaded: (e) => {
      let { width, height } = e.nativeEvent.source;
      updateState({ loaded: true, ratio: width / height });
    },
  };

  return { state, actions };
}
