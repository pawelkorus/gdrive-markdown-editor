import { useEffect, useMemo } from 'react'
import { Command, useCommandManager } from '../service/command'
import { showFolderPicker, showMarkdownPicker } from '../google'
import { useNavigateTo } from '../service/navigate'

export const openMarkdownFileCmd = 'openMarkdownFile'

export const createMarkdownFileCmd = 'createMarkdownFile'

export default function useGlobalCommands() {
  const [registerCommand, unregisterCommand] = useCommandManager()
  const { navigateToFileView, navigateToFileNew } = useNavigateTo()
  const commands: Command[] = useMemo(() => {
    const openMarkdownFile = {
      id: openMarkdownFileCmd,
      execute: async () => {
        const fileId = await showMarkdownPicker()
        if (fileId) {
          navigateToFileView({ fileId })
        }
      },
      name: 'Open markdown file',
    }

    const createMarkdownFile = {
      id: createMarkdownFileCmd,
      execute: async () => {
        const details = await showFolderPicker()
        if (details.id) {
          navigateToFileNew({ folderId: details.id })
        }
      },
      name: 'Create markdown file',
    }

    return [openMarkdownFile, createMarkdownFile]
  }, [])

  useEffect(() => {
    registerCommand(commands)
    return () => unregisterCommand(commands)
  }, [commands])
}
