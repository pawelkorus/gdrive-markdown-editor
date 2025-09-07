/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useState } from 'react'
// temporary disable until it supports react 19
// import { JSONTree } from 'react-json-tree'
import { usePluginViewContext } from '@prosemirror-adapter/react'

// const twilight = {
//   scheme: 'twilight',
//   base00: '#2E3440',
//   base01: '#323537',
//   base02: '#464b50',
//   base03: '#5f5a60',
//   base04: '#838184',
//   base05: '#a7a7a7',
//   base06: '#c3c3c3',
//   base07: '#ffffff',
//   base08: '#cf6a4c',
//   base09: '#cda869',
//   base0A: '#f9ee98',
//   base0B: '#8f9d6a',
//   base0C: '#afc4db',
//   base0D: '#7587a6',
//   base0E: '#9b859d',
//   base0F: '#9b703f',
// }

export default function (): React.ReactElement {
  const [, setEditorState] = useState()
  const { view, prevState } = usePluginViewContext()

  useEffect(() => {
    const state = view.state.toJSON()
    setEditorState(state)
  }, [view, prevState])

  return (
    <div>
      {/* <JSONTree
        data={editorState}
        theme={twilight}
      /> */}
    </div>
  )
}
