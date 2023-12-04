import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { commonmark } from '@milkdown/preset-commonmark';
import React from 'react';

type MilkdownEditorProps = {
    content: string
}

function MilkdownEditor(props:MilkdownEditorProps) {
    const { get } = useEditor((root) =>
      Editor.make()
        .config(nord)
        .config((ctx) => {
          ctx.set(rootCtx, root);
          ctx.set(defaultValueCtx, props.content)
        })
        .use(commonmark),
  );

  return <Milkdown />;
};

export default function(props:MilkdownEditorProps) {
  return (
    <MilkdownProvider>
      <MilkdownEditor content={props.content}/>
    </MilkdownProvider>
  );
};
