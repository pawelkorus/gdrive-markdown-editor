import React from 'react';
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
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
    content: string
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

          ctx.get(listenerCtx)
          .updated((_, doc) => {
            console.log('updated' + doc.toJSON());
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
        <MilkdownEditor content={props.content}/>
    </ProsemirrorAdapterProvider>
</MilkdownProvider>
    );
};
