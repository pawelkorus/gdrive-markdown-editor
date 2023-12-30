import { ReactPluginViewUserOptions, usePluginViewFactory } from "@prosemirror-adapter/react";
import { $prose, $shortcut } from "@milkdown/utils";
import { EditorState, EditorStateConfig, Plugin, PluginKey, PluginView, Transaction } from "@milkdown/prose/state";
import { EditorView } from "prosemirror-view";
import Slash from "./Slash";
import { withMeta } from "./with-meta";
import { Ctx } from "@milkdown/ctx";

// https://discuss.prosemirror.net/t/props-to-plugin-views/4672/8

export const pluginKey = new PluginKey('@gfrive-markdown-editor/slash-plugin')

function createPlugin(factory:(options: ReactPluginViewUserOptions) => (editorView:EditorView) => PluginView) {
    return $prose(() => {
        return new Plugin({
            state: {
                init: (config:EditorStateConfig, state:EditorState) => {
                    console.log("plugin state init");
                    return {
                        visible: false
                    };
                },
                apply(tr, value, oldState, newState) {
                    console.log("plugin state apply");
                    if(tr.getMeta('slash')) {
                        return {
                            visible: true
                        };
                    } else {
                        return value;
                    }
                },
            },
            view: factory({
                component: Slash,

            }),
            update: () => {
                console.log("plugin view update");
            },
            key: pluginKey
        })
    });
}

const activator = $shortcut((ctx:Ctx) => {
    return {
        '/': (state: EditorState, dispatch?: (tr: Transaction) => void, view?: EditorView) => {
            console.log("slash pressed");
            dispatch(state.tr.setMeta('slash', true));
            state.applyTransaction
            return true;
        }
    }
})

withMeta(activator, {
    displayName: 'Shortcut<slash>',
    group: 'Slash',
});

export const useSlash = () => {
    const pluginViewFactory = usePluginViewFactory();
    
    return {
        plugins: [
            createPlugin(pluginViewFactory),
            activator
        ].flat()
    };
};
