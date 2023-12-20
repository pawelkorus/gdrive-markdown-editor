import React from 'react';
import { Editor, rootCtx, defaultValueCtx, editorViewOptionsCtx } from '@milkdown/core';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { commonmark } from '@milkdown/preset-commonmark';
import { history } from '@milkdown/plugin-history';
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/react';
import { useSlash } from './slash'
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { cursor } from '@milkdown/plugin-cursor';
import { useSetProseState } from './dev-plugin/ProseStateProvider';
import { debounce } from 'lodash';
import { useGdriveEmbed } from './gdrive-plugin';
import { remarkPlugins } from './remark-plugin';

type MilkdownEditorProps = {
    content: string,
    readonly?: boolean,
    onContentUpdated?: (markdown:string) => void
}

function MilkdownEditor(props:MilkdownEditorProps) {
    const slash = useSlash();
    const gdriveEmbed = useGdriveEmbed();
    const setProseState = useSetProseState();
    
    const { get } = useEditor((root) =>
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
            .updated((_, doc) => {
                const state = doc.toJSON();
                setProseState(state);
                debounce(setProseState, 100)(state);
            })
            .focus((_) => { console.log('focus') });

            slash.config(ctx);
        })
        .use(commonmark)
        .use(listener)
        .use(history)
        .use(cursor)
        .use(remarkPlugins)
        .use(gdriveEmbed.plugins)
        .use(slash.plugins)
);

  return <Milkdown />;
};

export default function(props:MilkdownEditorProps) {
  return (
<MilkdownProvider>
    <ProsemirrorAdapterProvider>
        <MilkdownEditor content={props.content} onContentUpdated={props.onContentUpdated} readonly={props.readonly}/>
    </ProsemirrorAdapterProvider>
</MilkdownProvider>
    );
};
