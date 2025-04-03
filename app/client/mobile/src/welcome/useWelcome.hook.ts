import {useState, useContext, useEffect} from 'react';
import {DisplayContext} from '../context/DisplayContext';
import {AppContext} from '../context/AppContext';
import {ContextType} from '../context/ContextType';

export function useWelcome() {
  let app = useContext(AppContext) as ContextType;
  let display = useContext(DisplayContext) as ContextType;
  let [state, setState] = useState({
    strings: display.state.strings,
    showWelcome: null as null | boolean,
  });

  let updateState = (value: any) => {
    setState(s => ({...s, ...value}));
  };

  useEffect(() => {
    let showWelcome = app.state.showWelcome;
    updateState({showWelcome});
  }, [app.state]);

  let actions = {
    clearWelcome: async () => {
      await app.actions.setShowWelcome(false);
    },
  };

  return {state, actions};
}
