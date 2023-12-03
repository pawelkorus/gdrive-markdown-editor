import { schema, defaultMarkdownParser } from "prosemirror-markdown"
import { EditorState } from "prosemirror-state"
import { gapCursor } from "prosemirror-gapcursor"
import { dropCursor } from "prosemirror-dropcursor"
import { baseKeymap } from "prosemirror-commands"
import { keymap as proseMirrorKeyMap } from "prosemirror-keymap"
import { history } from "prosemirror-history"
import { menuBar } from "./menu"
import { keymap } from "./keys"
import { inputRules } from "./inputrules"


export default (initialContent:string) => {
    return EditorState.create({
        doc: defaultMarkdownParser.parse(initialContent),
        plugins: [
            inputRules(schema),
            keymap(schema),
            proseMirrorKeyMap(baseKeymap),
            menuBar(schema),
            gapCursor(),
            dropCursor(),
            history()
        ]
    })
}
