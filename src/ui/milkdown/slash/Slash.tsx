import React, { useEffect, useRef } from "react";
import { SlashProvider } from "@milkdown/plugin-slash";
import { useInstance } from "@milkdown/react";
import { Ctx } from "@milkdown/ctx";
import { usePluginViewContext } from "@prosemirror-adapter/react";
import { config } from "./config";
import { useSlashState } from "./state";

export const Slash = () => {
    const { view, prevState } = usePluginViewContext();
    const slashProvider = useRef<SlashProvider>();
    const ref = useRef<HTMLDivElement>(null);
    const instance = useInstance();
    const [loading, getEditor] = instance;
    const { root, setOpened, onKeydown, setSelected, selected } =
        useSlashState(instance);
    
    useEffect(() => {
        if (!ref.current || loading) return;

        slashProvider.current ??= new SlashProvider({
            content: ref.current,
            debounce: 50,
            tippyOptions: {
                onShow: () => {
                    setSelected(0);
                    setOpened(true);
                    root?.addEventListener("keydown", onKeydown);
                },
                onHide: () => {
                    root?.removeEventListener("keydown", onKeydown);
                    setOpened(false);
                },
            },
        });

        return () => {
            slashProvider.current?.destroy();
            slashProvider.current = undefined;
        };
    }, [loading, onKeydown, root, setOpened, setSelected]);

    useEffect(() => {
        slashProvider.current?.update(view, prevState);
    });

    function executeCommand(command: (ctx: Ctx) => void) {
        if (loading) return;

        getEditor().action((ctx) => {
            command(ctx);
        });
    }

    return (
        <div className="hidden">
            <div role="tooltip" ref={ref}>
                <div className="list-group">
                    {config.map((item, i) => (
                    <a  key={i.toString()} 
                        href="#" 
                        className={`list-group-item list-group-item-action ${i === selected ? 'active' : ''}`} 
                        aria-current={i === selected ? true : false} 
                        onMouseDown={() => executeCommand(item.onSelect)}
                        onMouseMove={() => setSelected(i)}
                        >
                        {item.renderer}
                    </a>
                    ))}
                </div>
            </div>
        </div>
    );
};
