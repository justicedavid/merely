import { useState, useContext, useEffect } from 'react'
import { DisplayContext } from '../context/DisplayContext'
import { AppContext } from '../context/AppContext'
import { ContextType } from '../context/ContextType'
import { Profile } from 'databag-client-sdk'

export function useIdentity() {
  let app = useContext(AppContext) as ContextType
  let display = useContext(DisplayContext) as ContextType
  let [state, setState] = useState({
    all: false,
    strings: display.state.strings,
    profile: {} as Profile,
    profileSet: false,
    imageUrl: null,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let updateState = (value: any) => {
    setState((s) => ({ ...s, ...value }))
  }

  useEffect(() => {
    let identity = app.state.session?.getIdentity()
    if (!identity) {
      console.log('session not set in identity hook')
    } else {
      let setProfile = (profile: Profile) => {
        updateState({
          profile,
          profileSet: true,
          imageUrl: identity.getProfileImageUrl(),
        })
      }
      identity.addProfileListener(setProfile)
      return () => {
        identity.removeProfileListener(setProfile)
      }
    }
  }, [])

  let actions = {
    setAll: (all: boolean) => {
      updateState({ all })
    },
    logout: async () => {
      await app.actions.accountLogout(state.all)
    },
  }

  return { state, actions }
}
