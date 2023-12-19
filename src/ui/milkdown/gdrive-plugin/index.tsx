import { Cmd } from '@milkdown/core'; 
import { Ctx, MilkdownPlugin } from '@milkdown/ctx';
import { $node, $nodeAttr, $inputRule, $command } from '@milkdown/utils';
import { expectDomTypeError } from '@milkdown/exception'
import { setBlockType } from '@milkdown/prose/commands'
import { EditorState, Transaction } from '@milkdown/prose/state'
import { EditorView } from '@milkdown/prose/view';
import { withMeta } from './with-meta'
import { InputRule } from '@milkdown/prose/inputrules'

// import { gdriveBlockView } from './view'
import { $view } from '@milkdown/utils';
import type { NodeViewConstructor } from '@milkdown/prose/view'
import { loadBinaryFile, showPicker } from '../../../google';
import GoogleDriveEmbed from './GoogleDriveEmbed';
import { useNodeViewFactory } from '@prosemirror-adapter/react';
import { useState } from 'react';
import { node } from 'webpack';
import { gdriveNodeView } from './view';

// https://prosemirror.net/docs/ref/#model.NodeType


export const gdriveAttr = $nodeAttr('gdrive')

withMeta(gdriveAttr, {
    displayName: 'NodeAttr<gdrive>',
    group: 'Gdrive',
})

export const gdriveNode = $node('gdrive', ctx => ({
    inline: false,
    group: 'block',
    selectable: false,
    draggable: false,
    marks: '',
    atom: true,
    isolating: true,
    attrs: {
        src: {
            default: '',
        }
    },
    parseDOM: [{
        tag: 'div[data-type="gdrive"]',
        getAttrs: (dom) => {
                if (!(dom instanceof HTMLElement))
                throw expectDomTypeError(dom)

                return { src: dom.dataset.src }
            },
        },
    ],
    parseMarkdown: {
        match: (node) => node.type === 'leafDirective' && node.name === 'gdrive',
        runner: (state, node, type) => {
            state.addNode(type, { src: (node.attributes as { src: string }).src });
        },
    },
    toMarkdown: {
        match: (node) => node.type.name === 'gdrive',
        runner: (state, node) => {
            state.addNode('leafDirective', undefined, undefined, {
                name: 'gdrive',
                attributes: { src: node.attrs.src },
            });
        },
    }
}))

withMeta(gdriveNode, {
    displayName: 'Node<gdrive>',
    group: 'Gdrive',
})

export const griveInputRule = $inputRule((ctx) => new InputRule(/::gdrive\{src\="(?<src>[^"]+)?"?\}/, (state, match, start, end) => {
    const [okay, src = ''] = match;
    const { tr } = state;
  
    if (okay) {
      tr.replaceWith(start - 1, end, gdriveNode.type(ctx).create({ src }));
    }
  
    return tr;
}))

withMeta(griveInputRule, {
    displayName: 'InputRule<grive>',
    group: 'Gdrive',
})

function executeGdriveCommand(ctx: Ctx):Cmd<unknown> {
    return () => {
        return (state: EditorState, dispatch?: (tr: Transaction) => void, view?: EditorView):boolean => {
            if(dispatch) {
                showPicker().then(fileId => {
                    dispatch(state.tr.replaceSelectionWith(gdriveNode.type(ctx).create({ src: fileId })));
                });
            }
            return true;
        }
    }
}

export const gdriveCommand = $command("Choose image from Gdrive", executeGdriveCommand);

withMeta(gdriveCommand, {
    displayName: 'Command<gdrive>',
    group: 'Gdrive',
})

// export const gdriveBlockView = $view(gdriveNode, (ctx:Ctx): NodeViewConstructor => {
//     return (initialNode, view, getPos) => {
//         const domRoot = document.createElement('div');
//         domRoot.className = 'text-center';
//         domRoot.dataset.type = 'gdrive';
//         domRoot.dataset.src = initialNode.attrs.src;

//         const domP = document.createElement('p');

//         const domImg = document.createElement('img');
//         domImg.className = 'img-fluid align-center';

//         domP.appendChild(domImg);
//         domRoot.appendChild(domP);
    
//         loadBinaryFile(initialNode.attrs.src).then(fileBody => {
//             domImg.src = "data:image/jpg;base64," + fileBody;
//         });

//         return {
//             dom: domRoot,
//             destroy: () => {
//                 domRoot.remove()
//             },
//         }
//     }
// })

// withMeta(gdriveBlockView, {
//     displayName: 'NodeView<gdrive>',
//     group: 'Gdrive',
// })

// function AAA(ctx:Ctx): NodeViewConstructor {
//         const nodeViewFactory = useNodeViewFactory();
    
//     return nodeViewFactory({
//         component: GoogleDriveEmbed,
//     })
// }

// export const gdriveBlockView = $view(gdriveNode, AAA);
// export const gdriveBlockView = $view(gdriveNode, (ctx:Ctx): NodeViewConstructor => {
//     return (initialNode, view, getPos) => {
//         const domRoot = document.createElement('div');
//         domRoot.className = 'text-center';
//         domRoot.dataset.type = 'gdrive';
//         domRoot.dataset.src = initialNode.attrs.src;

//         const domP = document.createElement('p');

//         const domImg = document.createElement('img');
//         domImg.className = 'img-fluid align-center';

//         domP.appendChild(domImg);
//         domRoot.appendChild(domP);
    
//         loadBinaryFile(initialNode.attrs.src).then(fileBody => {
//             domImg.src = "data:image/jpg;base64," + fileBody;
//         });

//         return {
//             dom: domRoot,
//             destroy: () => {
//                 domRoot.remove()
//             },
//         }
//     }
// })

// withMeta(gdriveBlockView, {
//     displayName: 'NodeView<gdrive>',
//     group: 'Gdrive',
// })

export const useGdriveEmbed = () => {
    const nodeViewFactory = useNodeViewFactory();
    
    return {
        plugins: [
            gdriveAttr,
            gdriveNode,
            griveInputRule,
            gdriveNodeView(nodeViewFactory),
            gdriveCommand,
        ].flat()
    };
};
