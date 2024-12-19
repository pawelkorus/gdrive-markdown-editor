import React, { PropsWithChildren } from 'react'
import useMilkdownCommands from './useMilkdownCommands'

const EditorCommands: React.FC<PropsWithChildren> = ({ children }) => {
  useMilkdownCommands()

  return (
    <>
      {children}
    </>
  )
}

export default EditorCommands
