import { Ctx } from '@milkdown/ctx';
import { $view } from '@milkdown/utils';
import type { NodeViewConstructor } from '@milkdown/prose/view'
import { ReactNodeViewUserOptions } from '@prosemirror-adapter/react';
import { withMeta } from './with-meta';
import { gdriveNode } from '.';
import { loadBinaryFile } from '../../../google';
import GoogleDriveEmbed from './GoogleDriveEmbed';

export const gdriveNodeView = function(factory: (options: ReactNodeViewUserOptions) => NodeViewConstructor) {
    const plugin = $view(gdriveNode, (ctx:Ctx): NodeViewConstructor => {
        return factory({
            component: GoogleDriveEmbed,
        })
    })

    withMeta(plugin, {
        displayName: 'NodeView<gdrive>',
        group: 'Gdrive',
    });

    return plugin;
}
