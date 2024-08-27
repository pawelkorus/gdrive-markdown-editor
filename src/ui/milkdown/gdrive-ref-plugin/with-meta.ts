import type { Meta, MilkdownPlugin } from '@milkdown/kit/ctx'

export function withMeta<T extends MilkdownPlugin>(plugin: T, meta: Partial<Meta> & Pick<Meta, 'displayName'>): T {
  Object.assign(plugin, {
    meta: {
      package: '@gdrive-markdown-editor/gdrive-ref-plugin',
      ...meta,
    },
  })

  return plugin
}
