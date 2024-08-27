import { $node, $nodeAttr, $inputRule } from '@milkdown/kit/utils'
import { expectDomTypeError } from '@milkdown/exception'
import { withMeta } from './with-meta'
import { InputRule } from '@milkdown/kit/prose/inputrules'
import { useNodeViewFactory } from '@prosemirror-adapter/react'
import { nodeView } from './view'

export const youtubeAttr = $nodeAttr('youtube')

withMeta(youtubeAttr, {
  displayName: 'NodeAttr<youtube>',
  group: 'Youtube',
})

export const youtubeNode = $node('youtube', () => ({
  inline: false,
  group: 'block',
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
    tag: 'p[data-type="youtube"]',
    getAttrs: (dom) => {
      if (!(dom instanceof HTMLElement))
        throw expectDomTypeError(dom)

      const ifFrameNode = dom.children.length === 1 && dom.children[0]
      if (!(ifFrameNode instanceof HTMLIFrameElement))
        throw new Error('Expected iframe element with youtube embed')

      if (!ifFrameNode.src)
        throw new Error('Cannot find src attribute in iframe')

      const src = ifFrameNode.src.replace('https://www.youtube.com/embed/', '')
      if (!src)
        throw new Error('Cannot find youtube video id from src')

      return { src }
    },
  },
  ],
  parseMarkdown: {
    match: node => node.type === 'leafDirective' && node.name === 'youtube',
    runner: (state, node, type) => {
      state.addNode(type, { src: (node.attributes as { src: string }).src })
    },
  },
  toMarkdown: {
    match: node => node.type.name === 'youtube',
    runner: (state, node) => {
      state.addNode('leafDirective', undefined, undefined, {
        name: 'youtube',
        attributes: { src: node.attrs.src },
      })
    },
  },
}))

withMeta(youtubeNode, {
  displayName: 'Node<youtube>',
  group: 'Youtube',
})

export const youtubeInputRule = $inputRule(ctx => new InputRule(/::youtube\{src="(?<src>[^"]+)?"?\}/, (state, match, start, end) => {
  const [okay, src = ''] = match
  const { tr } = state

  if (okay) {
    tr.replaceWith(start - 1, end, youtubeNode.type(ctx).create({ src }))
  }

  return tr
}))

withMeta(youtubeInputRule, {
  displayName: 'InputRule<youtube>',
  group: 'Youtube',
})

export const useYoutubeEmbed = () => {
  const nodeViewFactory = useNodeViewFactory()

  return {
    plugins: [
      youtubeAttr,
      youtubeNode,
      youtubeInputRule,
      nodeView(nodeViewFactory),
    ].flat(),
  }
}
