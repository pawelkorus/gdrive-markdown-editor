import { Cmd } from '@milkdown/core'; 
import { Ctx } from '@milkdown/ctx';
import { $node, $nodeAttr, $inputRule, $command } from '@milkdown/utils';
import { expectDomTypeError } from '@milkdown/exception';
import { EditorState, Transaction } from '@milkdown/prose/state';
import { withMeta } from './with-meta';
import { InputRule } from '@milkdown/prose/inputrules';
import { showPicker } from '../../../google';
import { useNodeViewFactory } from '@prosemirror-adapter/react';
import { gdriveNodeView } from './view';

// https://prosemirror.net/docs/ref/#model.NodeType


export const gdriveAttr = $nodeAttr('gdrive')

withMeta(gdriveAttr, {
    displayName: 'NodeAttr<gdrive>',
    group: 'Gdrive',
})

export const gdriveNode = $node('gdrive', () => ({
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

export const griveInputRule = $inputRule((ctx) => new InputRule(/::gdrive\{src="(?<src>[^"]+)?"?\}/, (state, match, start, end) => {
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
        return (state: EditorState, dispatch?: (tr: Transaction) => void):boolean => {
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
