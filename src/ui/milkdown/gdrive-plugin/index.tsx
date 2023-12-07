import { MilkdownPlugin } from '@milkdown/ctx';
import { $node, $nodeAttr, $nodeSchema, $inputRule, $remark } from '@milkdown/utils';
import { expectDomTypeError } from '@milkdown/exception'
import { withMeta } from './with-meta'
import { InputRule } from '@milkdown/prose/inputrules'
import directive from 'remark-directive';

export const gdriveAttr = $nodeAttr('gdrive')


export const gdriveNode = $node('gdrive', ctx => ({
    group: 'block',
    atom: true,
    isolating: true,
    marks: '',
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
    toDOM: (node) => {
        const attrs = ctx.get(gdriveAttr.key)(node)
        return ['div', {'data-type': 'gdrive', ...attrs, ...node.attrs }]
    },
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
    displayName: 'NodeSchema<gdrive>',
    group: 'Gdrive',
})

// withMeta(gdriveSNode.ctx, {
//     displayName: 'NodeSchemaCtx<gdrive>',
//     group: 'Gdrive',
// })

export const remarkDirective = $remark('plugin-gdrive', () => directive)

export const griveInputRule = $inputRule((ctx) => new InputRule(/::gdrive\{src\="(?<src>[^"]+)?"?\}/, (state, match, start, end) => {
    const [okay, src = ''] = match;
    const { tr } = state;
  
    if (okay) {
      tr.replaceWith(start - 1, end, gdriveNode.type(ctx).create({ src }));
    }
  
    return tr;
  }))

withMeta(griveInputRule, {
    displayName: 'InputRule<griveInputRule>',
    group: 'Gdrive',
})

export const gdrive: MilkdownPlugin[] = [
    gdriveAttr,
    gdriveNode,
    remarkDirective,
    griveInputRule,
  ].flat()
