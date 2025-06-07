import directive from 'remark-directive'
import { $remark } from '@milkdown/kit/utils'
import { MilkdownPlugin } from '@milkdown/kit/ctx'

export const remarkDirective = $remark('plugin-remark-directive', () => directive)

export const remarkPlugins: MilkdownPlugin[] = [
  remarkDirective,
].flat()
