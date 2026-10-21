import React from 'react'
import { StorageApiProvider } from "@app/service/storage"
import type { StorageApi } from "@app/storage"
import { createFakeStorageApi } from "./createFakeStorageApi"
import { CommandsContextProvider } from "@app/service/command"
import { MilkdownEditor } from "@app/ui/milkdown-editor"
import { MilkdownProvider } from "@milkdown/react"
import { ProsemirrorAdapterProvider } from "@prosemirror-adapter/react"
import { PropsWithChildren } from "react"

export const TestMilkdownEditor: React.FC<PropsWithChildren<{ content: string, storageApi?: StorageApi }>> = ({ content, storageApi }) => {
  const [fakeApi] = React.useState(() => storageApi ?? createFakeStorageApi())
  return (
    <StorageApiProvider api={fakeApi}>
      <CommandsContextProvider>
        <MilkdownProvider>
          <ProsemirrorAdapterProvider>
            <MilkdownEditor content={content} />
          </ProsemirrorAdapterProvider>
        </MilkdownProvider>
      </CommandsContextProvider>
    </StorageApiProvider>
  )
}
