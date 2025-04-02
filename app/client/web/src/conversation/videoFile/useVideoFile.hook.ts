import { useState, useEffect } from 'react'

export function useVideoFile(source: File) {
  let [state, setState] = useState({
    videoUrl: null,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let updateState = (value: any) => {
    setState((s) => ({ ...s, ...value }))
  }

  useEffect(() => {
    let videoUrl = URL.createObjectURL(source)
    updateState({ videoUrl })
    return () => {
      URL.revokeObjectURL(videoUrl)
    }
  }, [source])

  let actions = {}

  return { state, actions }
}
