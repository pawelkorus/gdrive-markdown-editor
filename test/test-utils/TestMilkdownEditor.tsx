import React from 'react'
import { CommandsContextProvider } from "@app/service/command"
import { MilkdownEditor } from "@app/ui/milkdown-editor"
import { MilkdownProvider } from "@milkdown/react"
import { ProsemirrorAdapterProvider } from "@prosemirror-adapter/react"
import { PropsWithChildren } from "react"

export const TestMilkdownEditor: React.FC<PropsWithChildren<{ content: string }>> = ({ content }) => {
  return (
    <CommandsContextProvider>
      <MilkdownProvider>
        <ProsemirrorAdapterProvider>
          <MilkdownEditor content={content} />
        </ProsemirrorAdapterProvider>
      </MilkdownProvider>
    </CommandsContextProvider>
  )
}
