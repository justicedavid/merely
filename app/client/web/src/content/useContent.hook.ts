import { useState, useContext, useEffect, useRef } from 'react'
import { AppContext } from '../context/AppContext'
import { DisplayContext } from '../context/DisplayContext'
import { ContextType } from '../context/ContextType'
import { Channel, Card, Profile, Config } from 'databag-client-sdk'
import { notes, unknown, iii_group, iiii_group, iiiii_group, group } from '../constants/Icons'

type ChannelParams = {
  cardId: string
  channelId: string
  sealed: boolean
  focused: boolean
  hosted: boolean
  unread: boolean
  imageUrl: string
  subject: (string | null)[]
  message: string
}

export function useContent() {
  const cardChannels = useRef(new Map<string | null, Channel[]>())
  const app = useContext(AppContext) as ContextType
  const display = useContext(DisplayContext) as ContextType
  const [state, setState] = useState({
    strings: display.state.strings,
    layout: null,
    guid: '',
    cards: [] as Card[],
    connected: [] as Card[],
    sealable: [] as Card[],
    sorted: [] as Channel[],
    filtered: [] as ChannelParams[],
    filter: '',
    topic: '',
    sealSet: false,
    focused: null as null | { cardId: null | string; channelId: string },
    loaded: null as null | boolean,
  })

  const compare = (a: Card, b: Card) => {
    const aval = `${a.handle}/${a.node}`
    const bval = `${b.handle}/${b.node}`
    if (aval < bval) {
      return 1
    } else if (aval > bval) {
      return -1
    }
    return 0
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateState = (value: any) => {
    setState((s) => ({ ...s, ...value }))
  }

  useEffect(() => {
    const { strings, layout } = display.state
    updateState({ strings, layout })
  }, [display.state])

  useEffect(() => {
    const channels = state.sorted.map((channel) => {
      const { cardId, channelId, unread, sealed, members, data, lastTopic } = channel
      const contacts = [] as (Card | undefined)[]
      if (cardId) {
        const card = state.cards.find((contact) => contact.cardId === cardId)
        if (!card || card.blocked) {
          return null
        }
        contacts.push(card)
      }
      const guests = members.filter((contact) => contact.guid !== state.guid)
      const guestCards = guests
        .map((contact) => state.cards.find((card) => card.guid === contact.guid))
        .sort((a, b) => {
          if (!a && !b) {
            return 0
          } else if (!a) {
            return 1
          } else if (!b) {
            return -1
          } else if (a.handle > b.handle) {
            return 1
          } else {
            return 0
          }
        })
      contacts.push(...guestCards)

      const buildSubject = () => {
        if (contacts.length === 0) {
          return []
        }
        return contacts.map((contact) => (contact ? (contact.name ? contact.name : contact.handle) : null))
      }

      const selectImage = () => {
        if (contacts.length == 0) {
          return notes
        } else if (contacts.length == 1) {
          if (contacts[0]) {
            return contacts[0].imageUrl
          } else {
            return unknown
          }
        } else if (contacts.length == 2) {
          return iii_group
        } else if (contacts.length == 3) {
          return iiii_group
        } else if (contacts.length == 4) {
          return iiiii_group
        } else {
          return group
        }
      }

      const getMessage = () => {
        if (!lastTopic || !lastTopic.status) {
          return ''
        }
        if (lastTopic.dataType === 'superbasictopic') {
          if (lastTopic.data?.text) {
            return lastTopic.data.text
          } else {
            return ''
          }
        } else if (lastTopic.dataType === 'sealedtopic') {
          if (lastTopic.data) {
            if (lastTopic.data?.text) {
              return lastTopic.data.text
            } else {
              return ''
            }
          } else {
            return null
          }
        }
        return ''
      }

      const focused = state.focused?.cardId === cardId && state.focused?.channelId === channelId
      const hosted = cardId == null
      const subject = data?.subject ? [data.subject] : buildSubject()
      const message = getMessage()
      const imageUrl = selectImage()

      return { cardId, channelId, sealed, focused, hosted, unread, imageUrl, subject, message }
    })

    const search = state.filter?.toLowerCase()
    const filtered = channels.filter((item) => {
      if (!item) {
        return false
      }
      if (search) {
        if (item.subject?.find((value) => value?.toLowerCase().includes(search))) {
          return true
        }
        if (item.message?.toLowerCase().includes(search)) {
          return true
        }
        return false
      }
      return true
    })

    updateState({ filtered })
  }, [state.sorted, state.cards, state.guid, state.filter, state.focused])

  useEffect(() => {
    if (app.state.focus) {
      const focused = app.state.focus.getFocused()
      updateState({ focused })
    } else {
      updateState({ focused: null })
    }
  }, [app.state.focus])

  useEffect(() => {
    const setConfig = (config: Config) => {
      const { sealSet, sealUnlocked } = config
      updateState({ sealSet: sealSet && sealUnlocked })
    }
    const setLoaded = (loaded: boolean) => {
      updateState({ loaded })
    }
    const setProfile = (profile: Profile) => {
      const { guid } = profile
      updateState({ guid })
    }
    const setCards = (cards: Card[]) => {
      const filtered = cards.filter((card) => !card.blocked)
      const sorted = filtered.sort(compare)
      const connected = [] as Card[]
      const sealable = [] as Card[]
      sorted.forEach((card) => {
        if (card.status === 'connected') {
          connected.push(card)
          if (card.sealable) {
            sealable.push(card)
          }
        }
      })
      updateState({ cards, connected, sealable })
    }
    const setChannels = ({ channels, cardId }: { channels: Channel[]; cardId: string | null }) => {
      cardChannels.current.set(cardId, channels)
      const merged = [] as Channel[]
      cardChannels.current.forEach((values) => {
        merged.push(...values)
      })
      const filtered = merged.filter((channel) => !channel.blocked)
      const sorted = filtered.sort((a, b) => {
        const aUpdated = a?.lastTopic?.created
        const bUpdated = b?.lastTopic?.created
        if (aUpdated == bUpdated) {
          return 0
        } else if (!aUpdated) {
          return 1
        } else if (!bUpdated) {
          return -1
        } else if (aUpdated < bUpdated) {
          return 1
        } else {
          return -1
        }
      })
      updateState({ sorted })
    }

    const { identity, contact, content, settings } = app.state.session
    identity.addProfileListener(setProfile)
    contact.addCardListener(setCards)
    content.addChannelListener(setChannels)
    content.addLoadedListener(setLoaded)
    settings.addConfigListener(setConfig)

    return () => {
      identity.removeProfileListener(setProfile)
      contact.removeCardListener(setCards)
      content.removeChannelListener(setChannels)
      content.removeLoadedListener(setLoaded)
      settings.removeConfigListener(setConfig)
    }
  }, [])

  const actions = {
    setFilter: (filter: string) => {
      updateState({ filter })
    },
    setTopic: (topic: string) => {
      updateState({ topic })
    },
    setFocus: async (cardId: string | null, channelId: string) => {
      await app.actions.setFocus(cardId, channelId)
    },
    setLoaded: () => {
      updateState({ loaded: true })
    },
    openTopic: async (cardId: string) => {
      const content = app.state.session.getContent()
      const card = state.cards.find((card) => card.cardId === cardId)
      if (card) {
        const sealable = card.sealable && state.sealSet
        const thread = state.sorted.find((channel) => {
          const { sealed, cardId, members } = channel
          if (sealed === sealable && cardId == null && members.length === 1 && members[0].guid === card.guid) {
            return true
          }
          return false
        })
        if (thread) {
          app.actions.setFocus(null, thread.channelId)
        } else {
          const topic = await content.addChannel(sealable, sealable ? 'sealed' : 'superbasic', {}, [cardId])
          app.actions.setFocus(null, topic.id)
        }
      }
    },
    addTopic: async (sealed: boolean, subject: string, contacts: string[]) => {
      const content = app.state.session.getContent()
      if (sealed) {
        const topic = await content.addChannel(true, 'sealed', { subject }, contacts)
        return topic.id
      } else {
        const topic = await content.addChannel(false, 'superbasic', { subject }, contacts)
        return topic.id
      }
    },
  }

  return { state, actions }
}
