import {useEffect, useState} from 'react';
import {getLanguageStrings} from '../constants/Strings';
import {useWindowDimensions} from 'react-native';

export function useDisplayContext() {
  let dim = useWindowDimensions();
  let [state, setState] = useState({
    strings: getLanguageStrings(),
    layout: null,
    width: 0,
    height: 0,
  });

  let SMALL_LARGE = 650;

  let updateState = value => {
    setState(s => ({...s, ...value}));
  };

  useEffect(() => {
    let layout = dim.width < SMALL_LARGE ? 'small' : 'large';
    updateState({layout, width: dim.width, height: dim.height});
  }, [dim.height, dim.width]);

  let actions = {};

  return {state, actions};
}
