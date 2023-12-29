import { ReactPluginViewUserOptions, usePluginViewFactory } from "@prosemirror-adapter/react";
import { $prose } from "@milkdown/utils";
import { Plugin, PluginView } from "@milkdown/prose/state";
import { EditorView } from "prosemirror-view";
import Slash from "./Slash";

function createPlugin(factory:(options: ReactPluginViewUserOptions) => (editorView:EditorView) => PluginView) {
    return $prose(() => {
        return new Plugin({
            view: factory({
                component: Slash
            })
        })
    });
}

export const useSlash = () => {
    const pluginViewFactory = usePluginViewFactory();
    
    return {
        plugins: [
            createPlugin(pluginViewFactory)
        ].flat()
    };
};
