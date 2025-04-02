import { useState, useRef } from 'react';

export function useVideoAsset(asset) {

  let revoke = useRef();
  let index = useRef(0);

  let [state, setState] = useState({
    width: 0,
    height: 0,
    active: false,
    dimension: { width: 0, height: 0 },
    loading: false,
    error: false,
    url: null,
    loaded: false,
    block: 0,
    total: 0,
  });

  let updateState = (value) => {
    setState((s) => ({ ...s, ...value }));
  }

  let actions = {
    setActive: async (width, height) => {
      if (asset.encrypted) {
        try {
          let view = index.current;
          updateState({ active: true, width, height, error: false, loaded: false, loading: true, url: null });
          let blob = await asset.getDecryptedBlob(() => view !== index.current, (block, total) => updateState({ block, total }));
          let url = URL.createObjectURL(blob);
          revoke.current = url;
          updateState({ url, loading: false });
        }
        catch (err) {
          console.log(err);
          updateState({ error: true });
        }
      }
      else {
        updateState({ active: true, width, height, loading: false, url: asset.hd });
      }
    },
    clearActive: () => {
      index.current += 1;
      updateState({ active: false });
      if (revoke.current) {
        URL.revokeObjectURL(revoke.current);
        revoke.current = null;
      }
    },
    setDimension: (dimension) => {
      updateState({ dimension });
    },
    setLoaded: () => {
      updateState({ loaded: true });
    },
  };

  return { state, actions };
}

