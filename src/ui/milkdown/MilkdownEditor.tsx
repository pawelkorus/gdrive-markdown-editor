import React from 'react';
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { commonmark } from '@milkdown/preset-commonmark';
import { history } from '@milkdown/plugin-history';
import { usePluginViewFactory, ProsemirrorAdapterProvider } from '@prosemirror-adapter/react';
import { useSlash } from './slash'

type MilkdownEditorProps = {
    content: string
}

function MilkdownEditor(props:MilkdownEditorProps) {
    const slash = useSlash();
    const pluginViewFactory = usePluginViewFactory();

    const { get } = useEditor((root) =>
      Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, root);
          ctx.set(defaultValueCtx, props.content)
          slash.config(ctx);
        })
        .use(commonmark)
        .use(history)
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
