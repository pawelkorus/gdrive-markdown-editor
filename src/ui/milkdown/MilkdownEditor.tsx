import React, { memo } from 'react'
import { Editor, rootCtx, defaultValueCtx, editorViewOptionsCtx } from '@milkdown/kit/core'
import { Milkdown, useEditor } from '@milkdown/react'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { history } from '@milkdown/kit/plugin/history'
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener'
import { cursor } from '@milkdown/kit/plugin/cursor'
import { useGdriveEmbed } from './gdrive-embed-plugin'
import { useGdriveRef } from './gdrive-ref-plugin'
import { remarkPlugins } from './remark-plugin'
import { useYoutubeEmbed } from './youtube-plugin'

type MilkdownEditorProps = {
  content: string
  readonly?: boolean
  onContentUpdated?: (markdown: string) => void
}

export default memo(function (props: MilkdownEditorProps) {
  const gdriveEmbed = useGdriveEmbed()
  const gdriveRef = useGdriveRef()
  const youtubeEmbed = useYoutubeEmbed()

  useEditor(root =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root)
        ctx.set(defaultValueCtx, props.content)

        ctx.update(editorViewOptionsCtx, prev => ({
          ...prev,
          editable: () => !props.readonly,
        }))

        ctx.get(listenerCtx)
          .markdownUpdated((_, doc) => {
            if (props.onContentUpdated) {
              props.onContentUpdated(doc)
            }
          })
      })
      .use(commonmark)
      .use(listener)
      .use(history)
      .use(cursor)
      .use(remarkPlugins)
      .use(gdriveEmbed.plugins)
      .use(gdriveRef.plugins)
      .use(youtubeEmbed.plugins)
  , [props.content])

  return <Milkdown />
})
