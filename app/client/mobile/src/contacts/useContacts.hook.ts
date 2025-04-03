import {useState, useContext, useEffect} from 'react';
import {AppContext} from '../context/AppContext';
import {DisplayContext} from '../context/DisplayContext';
import {RingContext} from '../context/RingContext';
import {ContextType} from '../context/ContextType';
import {Card} from 'databag-client-sdk';

export function useContacts() {
  let app = useContext(AppContext) as ContextType;
  let ring = useContext(RingContext) as ContextType;
  let display = useContext(DisplayContext) as ContextType;
  let [state, setState] = useState({
    layout: '',
    strings: display.state.strings,
    cards: [] as Card[],
    filtered: [] as Card[],
    sortAsc: false,
    filter: '',
  });

  let updateState = (value: any) => {
    setState(s => ({...s, ...value}));
  };

  useEffect(() => {
    let {layout} = display.state;
    updateState({layout});
  }, [display.state]);

  useEffect(() => {
    let contact = app.state.session?.getContact();
    let setCards = (cards: Card[]) => {
      let filtered = cards.filter(card => !card.blocked);
      updateState({cards: filtered});
    };
    contact.addCardListener(setCards);
    return () => {
      contact.removeCardListener(setCards);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let compare = (a: Card, b: Card) => {
      let aval = `${a.handle}/${a.node}`;
      let bval = `${b.handle}/${b.node}`;
      if (aval < bval) {
        return state.sortAsc ? 1 : -1;
      } else if (aval > bval) {
        return state.sortAsc ? -1 : 1;
      }
      return 0;
    };
    let select = (c: Card) => {
      if (!state.filter) {
        return true;
      }
      let value = state.filter.toLowerCase();
      if (c.name && c.name.toLowerCase().includes(value)) {
        return true;
      }
      let handle = c.node ? `${c.handle}/${c.node}` : c.handle;
      if (handle.toLowerCase().includes(value)) {
        return true;
      }
      return false;
    };
    let filtered = state.cards.sort(compare).filter(select);
    updateState({filtered});
  }, [state.sortAsc, state.filter, state.cards]);

  let actions = {
    toggleSort: () => {
      let sortAsc = !state.sortAsc;
      updateState({sortAsc});
    },
    setFilter: (filter: string) => {
      updateState({filter});
    },
    call: async (card: Card) => {
      await ring.actions.call(card);
    },
    text: async (cardId: string) => {
      console.log('text', cardId);
    },
    cancel: async (cardId: string) => {
      let contact = app.state.session?.getContact();
      await contact.disconnectCard(cardId);
    },
    accept: async (cardId: string) => {
      let contact = app.state.session?.getContact();
      await contact.connectCard(cardId);
    },
    resync: async (cardId: string) => {
      let contact = app.state.session?.getContact();
      await contact.resyncCard(cardId);
    },
  };

  return {state, actions};
}
