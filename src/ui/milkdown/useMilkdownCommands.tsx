import { useInstance } from "@milkdown/react";
import Command from "../Command";
import {
    wrapInHeadingCommand,
    createCodeBlockCommand,
    insertHrCommand,
  } from "@milkdown/preset-commonmark";
import { gdriveCommand } from "./gdrive-plugin";
import { commandsCtx } from '@milkdown/core';

export default function useMilkdownCommands() {
    const [loading, getInstance] = useInstance();

    const commands:Command[] = [{
            id: "heading1",
            execute: () => getInstance().ctx.get(commandsCtx).call(wrapInHeadingCommand.key, 1),
            name: "Heading 1"
        },
        {
            id: "heading2",
            execute: () => getInstance().ctx.get(commandsCtx).call(wrapInHeadingCommand.key, 2),
            name: "Heading 2"
        },
        {
            id: "heading3",
            execute: () => getInstance().ctx.get(commandsCtx).call(wrapInHeadingCommand.key, 3),
            name: "Heading 3"
        },
        {
            id: "heading4",
            execute: () => getInstance().ctx.get(commandsCtx).call(wrapInHeadingCommand.key, 4),
            name: "Heading 4"
        },
        {
            id: "heading5",
            execute: () => getInstance().ctx.get(commandsCtx).call(wrapInHeadingCommand.key, 5),
            name: "Heading 5"
        },
        {
            id: "heading6",
            execute: () => getInstance().ctx.get(commandsCtx).call(wrapInHeadingCommand.key, 6),
            name: "Heading 6"
        },
        {
            id: "codeblock",
            execute: () => getInstance().ctx.get(commandsCtx).call(createCodeBlockCommand.key),
            name: "Code block"
        },
        {
            id: "hr",
            execute: () => getInstance().ctx.get(commandsCtx).call(insertHrCommand.key),
            name: "Horizontal divider"
        },
        {
            id: "gdrive",
            execute: () => getInstance().ctx.get(commandsCtx).call(gdriveCommand.key),
            name: "Insert image from google drive"
        }
    ];

    return [commands]
}
