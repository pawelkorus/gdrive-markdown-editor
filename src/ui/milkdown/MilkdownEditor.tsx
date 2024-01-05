import React, { memo } from 'react';
import { Editor, rootCtx, defaultValueCtx, editorViewOptionsCtx } from '@milkdown/core';
import { Milkdown, useEditor } from '@milkdown/react';
import { commonmark } from '@milkdown/preset-commonmark';
import { history } from '@milkdown/plugin-history';
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { cursor } from '@milkdown/plugin-cursor';
import { useGdriveEmbed } from './gdrive-plugin';
import { remarkPlugins } from './remark-plugin';

type MilkdownEditorProps = {
    content: string,
    readonly?: boolean,
    onContentUpdated?: (markdown:string) => void
}

export default memo(function(props:MilkdownEditorProps) {
    const gdriveEmbed = useGdriveEmbed();
    
    useEditor((root) => 
        Editor.make()
                .config((ctx) => {
                    ctx.set(rootCtx, root);
                    ctx.set(defaultValueCtx, props.content)

                    ctx.update(editorViewOptionsCtx, (prev) => ({
                        ...prev,
                        editable: () => !props.readonly
                    }))

                    ctx.get(listenerCtx)
                    .markdownUpdated((_, doc) => {
                        props.onContentUpdated && props.onContentUpdated(doc);
                    })
                })
                .use(commonmark)
                .use(listener)
                .use(history)
                .use(cursor)
                .use(remarkPlugins)
                .use(gdriveEmbed.plugins)
        , [props.content]);
        
    return <Milkdown />;
});
