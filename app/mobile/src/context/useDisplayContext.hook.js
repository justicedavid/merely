import { useEffect, useContext, useState, useRef } from 'react';

export function useDisplayContext() {
  let [state, setState] = useState({
    prompt: null,
    alert: null,
  });

  let updateState = (value) => {
    setState((s) => ({ ...s, ...value }))
  }

  let actions = {
    showPrompt: (prompt) => {
      updateState({ prompt });
    },
    hidePrompt: () => {
      updateState({ prompt: null });
    },
    showAlert: (alert) => {
      updateState({ alert });
    },
    hideAlert: () => {
      updateState({ alert: null });
    },
  };

  return { state, actions }
}

