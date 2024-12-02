import { blockquoteSchema } from '@milkdown/kit/preset/commonmark'

export const extendedBlockquoteSchema = blockquoteSchema.extendSchema((prev) => {
  return (ctx) => {
    const baseSchema = prev(ctx)
    return {
      ...baseSchema,
      toDOM: () => ['blockquote', { class: 'blockquote' }, 0],
    }
  }
})

export const plugins = [
  extendedBlockquoteSchema,
].flat()
