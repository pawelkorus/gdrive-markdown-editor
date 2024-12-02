import React, { useEffect } from 'react'
import { Editor, rootCtx, defaultValueCtx, editorViewOptionsCtx, editorViewCtx, parserCtx } from '@milkdown/kit/core'
import { Slice } from '@milkdown/kit/prose/model'
import { Milkdown, useEditor } from '@milkdown/react'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { gfm } from '@milkdown/kit/preset/gfm'
import { history } from '@milkdown/kit/plugin/history'
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener'
import { cursor } from '@milkdown/kit/plugin/cursor'
import { useGdriveEmbed } from './gdrive-embed-plugin'
import { useGdriveRef } from './gdrive-ref-plugin'
import { remarkPlugins } from './remark-plugin'
import { useYoutubeEmbed } from './youtube-plugin'
import { plugins as extendedBloquotePlugins } from './blockquote-plugin'
import WrapWithProviders from './WrapWithProviders'

type MilkdownEditorProps = {
  content: string
  readonly?: boolean
  onContentUpdated?: (markdown: string) => void
}

function MilkdownEditor(props: MilkdownEditorProps) {
  const gdriveEmbed = useGdriveEmbed()
  const gdriveRef = useGdriveRef()
  const youtubeEmbed = useYoutubeEmbed()

  const { get: editor } = useEditor(root =>
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
      .use(gfm)
      .use(listener)
      .use(history)
      .use(cursor)
      .use(remarkPlugins)
      .use(gdriveEmbed.plugins)
      .use(gdriveRef.plugins)
      .use(youtubeEmbed.plugins)
      .use(extendedBloquotePlugins)
  , [])

  useEffect(() => {
    if (!editor()) return

    editor().action((ctx) => {
      const view = ctx.get(editorViewCtx)
      const parser = ctx.get(parserCtx)
      const doc = parser(props.content)
      if (!doc) return
      const state = view.state
      view.dispatch(
        state.tr.replace(
          0,
          state.doc.content.size,
          new Slice(doc.content, 0, 0),
        ),
      )
    })
  }, [props.content])

  return <Milkdown />
}

export default function (props: MilkdownEditorProps) {
  // Wrapping needs to happen here because otherwise milkdown editor will persist between renders
  return <WrapWithProviders><MilkdownEditor {...props} /></WrapWithProviders>
}
