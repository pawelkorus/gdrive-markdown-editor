import { useInstance } from '@milkdown/react'
import { useCommandManager } from '../../service/command'
import {
  wrapInHeadingCommand,
  turnIntoTextCommand,
  createCodeBlockCommand,
  insertHrCommand,
  toggleEmphasisCommand,
  toggleStrongCommand,
  wrapInBlockquoteCommand,
} from '@milkdown/preset-commonmark'
import { gdriveCommand } from './gdrive-embed-plugin'
import { commandsCtx } from '@milkdown/core'
import type { $Command } from '@milkdown/utils'
import { useCallback, useEffect, useMemo } from 'react'

export default function useMilkdownCommands() {
  const [loading, getInstance] = useInstance()
  const [registerCommand, unregisterCommand] = useCommandManager()

  const callCommand = useCallback(function<T>(cmd: $Command<T>, payload?: T) {
    return () => !loading && getInstance().ctx.get(commandsCtx).call(cmd.key, payload)
  }, [loading, getInstance])

  const commands = useMemo(() => [{
    id: 'heading1',
    execute: callCommand(wrapInHeadingCommand, 1),
    name: 'Heading 1',
  },
  {
    id: 'heading2',
    execute: callCommand(wrapInHeadingCommand, 2),
    name: 'Heading 2',
  },
  {
    id: 'heading3',
    execute: callCommand(wrapInHeadingCommand, 3),
    name: 'Heading 3',
  },
  {
    id: 'heading4',
    execute: callCommand(wrapInHeadingCommand, 4),
    name: 'Heading 4',
  },
  {
    id: 'heading5',
    execute: callCommand(wrapInHeadingCommand, 5),
    name: 'Heading 5',
  },
  {
    id: 'heading6',
    execute: callCommand(wrapInHeadingCommand, 6),
    name: 'Heading 6',
  },
  {
    id: 'turnIntoText',
    execute: callCommand(turnIntoTextCommand),
    name: 'Turn into text',
  },
  {
    id: 'codeblock',
    execute: callCommand(createCodeBlockCommand),
    name: 'Code block',
  },
  {
    id: 'blockquote',
    execute: callCommand(wrapInBlockquoteCommand),
    name: 'Blockquote',
  },
  {
    id: 'hr',
    execute: callCommand(insertHrCommand),
    name: 'Horizontal divider',
  },
  {
    id: 'gdrive',
    execute: callCommand(gdriveCommand),
    name: 'Insert image from google drive',
  },
  {
    id: 'emphasize',
    execute: callCommand(toggleEmphasisCommand),
    name: 'Toggle emphasize',
  },
  {
    id: 'strong',
    execute: callCommand(toggleStrongCommand),
    name: 'Toggle strong',
  },
  ], [callCommand])

  useEffect(() => {
    console.log('register milkdown commands')
    registerCommand(commands)
    return () => {
      console.log('unregister milkdown commands')
      unregisterCommand(commands)
    }
  }, [commands])
}
