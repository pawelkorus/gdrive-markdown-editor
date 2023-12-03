import React, { useState } from 'react';
import markdownProseMirrorEditor from './prosemirror'
import { ProseMirror } from '@nytimes/react-prosemirror';

type Props = {
    content: string
};

export default function(props:Props):React.ReactElement {
    const [editorState, setEditorState] = useState(() => {
        return markdownProseMirrorEditor(props.content)
    });
    const [mount, setMount] = useState<HTMLDivElement | null>(null);

    return (
<div className="editor">
    <ProseMirror mount={mount} state={editorState} dispatchTransaction={(tr) => { setEditorState((s) => s.apply(tr)); }}>
        <div ref={setMount} />
    </ProseMirror>
</div>
    );
};
