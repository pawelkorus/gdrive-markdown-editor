import directive from 'remark-directive'
import { $remark } from '@milkdown/utils'
import { MilkdownPlugin } from '@milkdown/ctx'

export const remarkDirective = $remark('plugin-remark-directive', () => directive)

export const remarkPlugins: MilkdownPlugin[] = [
  remarkDirective,
].flat()
