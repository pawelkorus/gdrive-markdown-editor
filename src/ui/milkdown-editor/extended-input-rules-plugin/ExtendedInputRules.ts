import { $inputRule } from '@milkdown/kit/utils'
import { withMeta } from './with-meta'
import { InputRule } from '@milkdown/kit/prose/inputrules'
import { linkSchema } from '@milkdown/kit/preset/commonmark'

export const linkInputRule = $inputRule(ctx => new InputRule(/\[(.*)\]\((.+)\)/, (state, match, start, end) => {
  const [okay, text, src = ''] = match
  const { tr } = state

  if (okay) {
    tr.insertText(text + ' ', start, end)
      .addMark(start, start + text.length, linkSchema.type(ctx).create({ href: src, title: text }))
      .removeMark(start + text.length, start + text.length + 1)
  }

  return tr
}))

withMeta(linkInputRule, {
  displayName: 'InputRule<Link>',
  group: 'ExtendedInputRules',
})

export const plugins = [
  linkInputRule,
].flat()
