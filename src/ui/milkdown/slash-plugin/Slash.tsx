import React, { useEffect, useRef } from 'react';
import { usePluginViewContext } from "@prosemirror-adapter/react";
import { EditorView } from '@milkdown/prose/view';
import type { Node } from '@milkdown/prose/model';
import { findParentNode } from '@milkdown/prose';
import { TextSelection } from '@milkdown/prose/state';
import { Modal } from 'react-bootstrap';

export default function():React.ReactElement {
    const { view, prevState } = usePluginViewContext();
    const [visible, setVisible] = React.useState(false);
    const ref = useRef<any>(null);
    const trigger = '/';

    useEffect(() => {
        const { state, composing } = view
        const { selection, doc } = state
        // const { ranges } = selection
        // const from = Math.min(...ranges.map(range => range.$from.pos))
        // const to = Math.max(...ranges.map(range => range.$to.pos))
        const isSame = prevState && prevState.doc.eq(doc) && prevState.selection.eq(selection)

        if (composing || isSame)
        return

        if(_shouldShow(view)) {
            setVisible(true);
        } else {
            console.log("hide")
        }
    });

    function _shouldShow(view: EditorView): boolean {
        const currentTextBlockContent = getContent(view)

        if (!currentTextBlockContent)
            return false

        const target = currentTextBlockContent.slice(-1)

        if (!target)
            return false

        return Array.isArray(trigger) ? trigger.includes(target) : trigger === target
    }

    function getContent(view: EditorView, matchNode: (node: Node) => boolean = node => node.type.name === 'paragraph'): string | undefined {
        const { selection } = view.state
        const { empty } = selection
        const isTextBlock = view.state.selection instanceof TextSelection
    
        // const isSlashChildren = ref.current.contains(document.activeElement)
    
        const notHasFocus = !view.hasFocus() //&& !isSlashChildren
    
        const isReadonly = !view.editable
    
        const paragraph = findParentNode(matchNode)(view.state.selection)
    
        const isNotInParagraph = !paragraph
    
        if (notHasFocus || isReadonly || !empty || !isTextBlock || isNotInParagraph)
        return
    
        return paragraph.node.textContent
      }

    return (
<Modal show={visible} ref={ref}>
    <Modal.Body>
        <div className="list-group">
            <a href="#" className="list-group-item list-group-item-action active" aria-current="true">Item 1</a>
            <a href="#" className="list-group-item list-group-item-action">Item 2</a>
            <a href="#" className="list-group-item list-group-item-action">Item 3</a>
        </div>
    </Modal.Body>
</Modal>
)
}
