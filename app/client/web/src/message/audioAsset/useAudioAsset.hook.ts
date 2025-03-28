import { useState, useContext, useRef } from 'react'
import { AppContext } from '../../context/AppContext'
import { ContextType } from '../../context/ContextType'
import { MediaAsset } from '../../conversation/Conversation'

export function useAudioAsset(topicId: string, asset: MediaAsset) {
  let app = useContext(AppContext) as ContextType
  let [state, setState] = useState({
    dataUrl: null,
    loading: false,
    loadPercent: 0,
  })
  let cancelled = useRef(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let updateState = (value: any) => {
    setState((s) => ({ ...s, ...value }))
  }

  let actions = {
    cancelLoad: () => {
      cancelled.current = true
    },
    loadAudio: async () => {
      let { focus } = app.state
      let assetId = asset.audio ? asset.audio.full : asset.encrypted ? asset.encrypted.parts : null
      if (focus && assetId != null && !state.loading && !state.dataUrl) {
        cancelled.current = false
        updateState({ loading: true, loadPercent: 0 })
        try {
          let dataUrl = await focus.getTopicAssetUrl(topicId, assetId, (loadPercent: number) => {
            updateState({ loadPercent })
            return !cancelled.current
          })
          updateState({ dataUrl, loading: false })
        } catch (err) {
          updateState({ loading: false })
          console.log(err)
        }
      }
    },
  }

  return { state, actions }
}
