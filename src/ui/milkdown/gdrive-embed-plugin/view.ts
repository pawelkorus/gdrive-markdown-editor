import { $view } from '@milkdown/utils'
import type { NodeViewConstructor } from '@milkdown/prose/view'
import { ReactNodeViewUserOptions } from '@prosemirror-adapter/react'
import { withMeta } from './with-meta'
import { gdriveNode } from '.'
import GDriveEmbed from './GDriveEmbed'

export const gdriveNodeView = function (factory: (options: ReactNodeViewUserOptions) => NodeViewConstructor) {
  const plugin = $view(gdriveNode, (): NodeViewConstructor => {
    return factory({
      component: GDriveEmbed,
    })
  })

  withMeta(plugin, {
    displayName: 'NodeView<gdrive>',
    group: 'Gdrive',
  })

  return plugin
}
