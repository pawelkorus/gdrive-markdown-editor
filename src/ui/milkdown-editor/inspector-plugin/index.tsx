import { ReactPluginViewUserOptions, usePluginViewFactory } from '@prosemirror-adapter/react'
import { $prose } from '@milkdown/kit/utils'
import { PluginView, Plugin } from '@milkdown/kit/prose/state'
import { EditorView } from '@milkdown/kit/prose/view'
import MilkdownInspector from './MilkdownInspector'

function createPlugin(factory: (options: ReactPluginViewUserOptions) => (editorView: EditorView) => PluginView) {
  return $prose(() => {
    return new Plugin({
      view: factory({
        component: MilkdownInspector,
      }),
    })
  })
}

export const useInspector = () => {
  const pluginViewFactory = usePluginViewFactory()

  return {
    plugins: [
      createPlugin(pluginViewFactory),
    ].flat(),
  }
}
