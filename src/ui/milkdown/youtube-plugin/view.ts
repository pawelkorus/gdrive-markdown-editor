import { $view } from '@milkdown/kit/utils'
import type { NodeViewConstructor } from '@milkdown/kit/prose/view'
import { ReactNodeViewUserOptions } from '@prosemirror-adapter/react'
import { withMeta } from './with-meta'
import { youtubeNode } from '.'
import YoutubeEmbed from './YoutubeEmbed'

export const nodeView = function (factory: (options: ReactNodeViewUserOptions) => NodeViewConstructor) {
  const plugin = $view(youtubeNode, (): NodeViewConstructor => {
    return factory({
      component: YoutubeEmbed,
    })
  })

  withMeta(plugin, {
    displayName: 'NodeView<youtube>',
    group: 'Youtube',
  })

  return plugin
}
