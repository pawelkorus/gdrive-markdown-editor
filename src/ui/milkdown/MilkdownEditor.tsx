import React from 'react';
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { commonmark } from '@milkdown/preset-commonmark';
import { history } from '@milkdown/plugin-history';
import { usePluginViewFactory, ProsemirrorAdapterProvider } from '@prosemirror-adapter/react';
import { useSlash } from './slash'
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { useSetProseState } from '../ProseStateProvider';
import { debounce } from 'lodash';
import { gdrive } from './gdrive-plugin';

type MilkdownEditorProps = {
    content: string
}

function MilkdownEditor(props:MilkdownEditorProps) {
    const slash = useSlash();
    const setProseState = useSetProseState();
    const pluginViewFactory = usePluginViewFactory();

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
        .use(gdrive)
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
