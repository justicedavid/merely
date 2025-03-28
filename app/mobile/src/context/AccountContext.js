import { createContext } from 'react';
import { useAccountContext } from './useAccountContext.hook';

export let AccountContext = createContext({});

export function AccountContextProvider({ children }) {
  let { state, actions } = useAccountContext();
  return (
    <AccountContext.Provider value={{ state, actions }}>
      {children}
    </AccountContext.Provider>
  );
}

