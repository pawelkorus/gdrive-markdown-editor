import { Cmd } from '@milkdown/core'
import { Ctx } from '@milkdown/ctx'
import { EditorState, Transaction } from '@milkdown/prose/state'
import { $node, $view, $command } from '@milkdown/utils'
import { expectDomTypeError } from '@milkdown/exception'
import { withMeta } from './with-meta'
import { useNodeViewFactory } from '@prosemirror-adapter/react'
import GDriveRef from './GDriveRef'
import { showPicker } from '../../../google'
import type { NodeViewConstructor } from '@milkdown/prose/view'

const node = $node('gdrive-ref', () => ({
  inline: true,
  group: 'inline',
  selectable: false,
  draggable: false,
  marks: '',
  atom: true,
  isolating: true,
  attrs: {
    src: {
      default: '',
    },
  },
  parseDOM: [{
    tag: 'a[data-type="gdrive-ref"]',
    getAttrs: (dom) => {
      if (!(dom instanceof HTMLElement))
        throw expectDomTypeError(dom)

      return { src: dom.dataset.src }
    },
  }],
  parseMarkdown: {
    match: node => node.type === 'textDirective' && node.name === 'gdrive-ref',
    runner: (state, node, type) => {
      state.addNode(type, {
        src: (node.attributes as { src: string }).src,
      })
    },
  },
  toMarkdown: {
    match: node => node.type.name === 'gdrive-ref',
    runner: (state, node) => {
      state.addNode('textDirective', undefined, undefined, {
        name: 'gdrive-ref',
        attributes: {
          src: node.attrs.src,
        },
      })
    },
  },
}))

withMeta(node, {
  displayName: 'Node<gdrive-ref>',
  group: 'gdrive',
})

function executeReferenceGdriveFileCommand(ctx: Ctx): Cmd<unknown> {
  return () => {
    return (state: EditorState, dispatch?: (tr: Transaction) => void): boolean => {
      if (dispatch) {
        showPicker().then((fileId) => {
          dispatch(state.tr.replaceSelectionWith(node.type(ctx).create({ src: fileId })))
        })
      }
      return true
    }
  }
}

const referenceGdriveFileCommand = $command('Choose file to reference', executeReferenceGdriveFileCommand)

withMeta(referenceGdriveFileCommand, {
  displayName: 'Command<gdrive-ref>',
  group: 'gdrive',
})

export const useGdriveRef = () => {
  const nodeViewFactory = useNodeViewFactory()

  const view = $view(node, (): NodeViewConstructor => {
    return nodeViewFactory({
      component: GDriveRef,
    })
  })

  withMeta(view, {
    displayName: 'NodeView<gdrive-ref>',
    group: 'gdrive',
  })

  return {
    plugins: [
      node,
      view,
      referenceGdriveFileCommand,
    ].flat(),
  }
}

export const useGdriveRefCommands = () => {
  return {
    referenceGdriveFileCommand: referenceGdriveFileCommand,
  }
}
