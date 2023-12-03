import { EditorState, Plugin, Command } from 'prosemirror-state';
import { Schema, MarkType, NodeType } from 'prosemirror-model'
import { 
    menuBar as prosemirrorMenuBar, 
    MenuItem, 
    MenuElement, 
    MenuItemSpec, 
    IconSpec, 
    wrapItem, 
    blockTypeItem, 
    Dropdown, 
    DropdownSubmenu, 
} from 'prosemirror-menu';
import { toggleMark } from "prosemirror-commands"
import { wrapInList } from "prosemirror-schema-list"
import { undo, redo } from "prosemirror-history"
import { EditorView } from 'prosemirror-view';

const icons = {
    em: prepareIcon('em', 'bi:type-italic'),
    strong: prepareIcon('strong', 'bi:type-bold'),
    code: prepareIcon('code', 'bi:code'),
    link: prepareIcon('link', 'bi:link-45deg'),
    bulletList: prepareIcon('bulletList', 'bi:list-ul'),
    orderedList: prepareIcon('orderedList', 'bi:list-ol'),
    blockquote: prepareIcon('blockquote', 'bi:blockquote-left'),
    horizontalRule: prepareIcon('horizontalRule', 'bi:dash-lg'),
    image: prepareIcon('image', 'bi:image'),
    heading: prepareIcon('heading', 'bi:card-heading'),
    codeBlock: prepareIcon('codeBlock', 'bi:code'),
    paragraph: prepareIcon('paragraph', 'bi:paragraph'),
    undo: prepareIcon('undo', 'bi:arrow-counterclockwise'),
    redo: prepareIcon('redo', 'bi:arrow-clockwise'),
    close: prepareIcon('close', 'bi:x-lg'),
}

function domIcon(iconName:string) {
    let dom = document.createElement('iconify-icon');
    dom.setAttribute('icon', iconName);
    return dom;
}

function prepareIcon(text:string, iconName:string):IconSpec {
    return {
        dom: domIcon(iconName),
        text: text
    }
}

function canInsert(state: EditorState, nodeType: NodeType) {
    let $from = state.selection.$from
    for (let d = $from.depth; d >= 0; d--) {
      let index = $from.index(d)
      if ($from.node(d).canReplaceWith(index, index, nodeType)) return true
    }
    return false
}

function markActive(state: EditorState, type: MarkType) {
    let {from, $from, to, empty} = state.selection
    if (empty) return !!type.isInSet(state.storedMarks || $from.marks())
    else return state.doc.rangeHasMark(from, to, type)
  }

function cmdItem(cmd: Command, options: Partial<MenuItemSpec>) {
    let passedOptions: MenuItemSpec = {
      label: options.title as string | undefined,
      run: cmd
    }
    for (let prop in options) (passedOptions as any)[prop] = (options as any)[prop]
    if (!options.enable && !options.select)
      passedOptions[options.enable ? "enable" : "select"] = state => cmd(state)
  
    return new MenuItem(passedOptions)
  }

function markItem(markType: MarkType, options: Partial<MenuItemSpec>) {
    let passedOptions: Partial<MenuItemSpec> = {
      active(state) { return markActive(state, markType) }
    }
    for (let prop in options) (passedOptions as any)[prop] = (options as any)[prop]
    return cmdItem(toggleMark(markType), passedOptions)
}

function wrapListItem(nodeType: NodeType, options: Partial<MenuItemSpec>) {
return cmdItem(wrapInList(nodeType, (options as any).attrs), options)
}

type MenuItemResult = {
    /// A menu item to toggle the [strong mark](#schema-basic.StrongMark).
    toggleStrong?: MenuItem
  
    /// A menu item to toggle the [emphasis mark](#schema-basic.EmMark).
    toggleEm?: MenuItem
  
    /// A menu item to toggle the [code font mark](#schema-basic.CodeMark).
    toggleCode?: MenuItem
  
    /// A menu item to toggle the [link mark](#schema-basic.LinkMark).
    toggleLink?: MenuItem
  
    /// A menu item to insert an [image](#schema-basic.Image).
    insertImage?: MenuItem
  
    /// A menu item to wrap the selection in a [bullet list](#schema-list.BulletList).
    wrapBulletList?: MenuItem
  
    /// A menu item to wrap the selection in an [ordered list](#schema-list.OrderedList).
    wrapOrderedList?: MenuItem
  
    /// A menu item to wrap the selection in a [block quote](#schema-basic.BlockQuote).
    wrapBlockQuote?: MenuItem
  
    /// A menu item to set the current textblock to be a normal
    /// [paragraph](#schema-basic.Paragraph).
    makeParagraph?: MenuItem
  
    /// A menu item to set the current textblock to be a
    /// [code block](#schema-basic.CodeBlock).
    makeCodeBlock?: MenuItem
  
    /// Menu items to set the current textblock to be a
    /// [heading](#schema-basic.Heading) of level _N_.
    makeHead1?: MenuItem
    makeHead2?: MenuItem
    makeHead3?: MenuItem
    makeHead4?: MenuItem
    makeHead5?: MenuItem
    makeHead6?: MenuItem
  
    /// A menu item to insert a horizontal rule.
    insertHorizontalRule?: MenuItem
  
    undo?: MenuItem

    redo?: MenuItem

    close?: MenuItem

    /// A dropdown containing the `insertImage` and
    /// `insertHorizontalRule` items.
    insertMenu: Dropdown
  
    /// A dropdown containing the items for making the current
    /// textblock a paragraph, code block, or heading.
    typeMenu: Dropdown
  
    /// Array of block-related menu items.
    blockMenu: MenuElement[][]
  
    /// Inline-markup related menu items.
    inlineMenu: MenuElement[][]
  
    /// An array of arrays of menu elements for use as the full menu
    /// for, for example the [menu
    /// bar](https://github.com/prosemirror/prosemirror-menu#user-content-menubar).
    fullMenu: MenuElement[][]
}


function cut<T>(arr: T[]): NonNullable<T>[] {
    return arr.filter(x => x) as NonNullable<T>[]
}

export function buildMenuItems(schema: Schema): MenuItemResult {
    let r: MenuItemResult = {} as any
    let mark: MarkType | undefined
    if (mark = schema.marks.strong)
        r.toggleStrong = markItem(mark, {title: "Toggle strong style", icon: icons.strong})
    if (mark = schema.marks.em)
        r.toggleEm = markItem(mark, {title: "Toggle emphasis", icon: icons.em})
    if (mark = schema.marks.code)
        r.toggleCode = markItem(mark, {title: "Toggle code font", icon: icons.code})
    // if (mark = schema.marks.link)
    //     r.toggleLink = linkItem(mark)

    let node: NodeType | undefined
    // if (node = schema.nodes.image)
    //     r.insertImage = insertImageItem(node)
    if (node = schema.nodes.bullet_list)
        r.wrapBulletList = wrapListItem(node, {
        title: "Wrap in bullet list",
        icon: icons.bulletList
        })
    if (node = schema.nodes.ordered_list)
        r.wrapOrderedList = wrapListItem(node, {
        title: "Wrap in ordered list",
        icon: icons.orderedList
        })
    if (node = schema.nodes.blockquote)
        r.wrapBlockQuote = wrapItem(node, {
        title: "Wrap in block quote",
        icon: icons.blockquote
        })
    if (node = schema.nodes.paragraph)
        r.makeParagraph = blockTypeItem(node, {
            title: "Change to paragraph",
            label: "Plain"
        })
    if (node = schema.nodes.code_block)
        r.makeCodeBlock = blockTypeItem(node, {
            title: "Change to code block",
            label: "Code"
        })
    if (node = schema.nodes.heading)
        for (let i = 1; i <= 10; i++)
        (r as any)["makeHead" + i] = blockTypeItem(node, {
            title: "Change to heading " + i,
            label: "Level " + i,
            attrs: {level: i}
        })
    if (node = schema.nodes.horizontal_rule) {
        let hr = node
        r.insertHorizontalRule = new MenuItem({
        title: "Insert horizontal rule",
        label: "Horizontal rule",
        enable(state) { return canInsert(state, hr) },
        run(state, dispatch) { dispatch(state.tr.replaceSelectionWith(hr.create())) }
        })
    }

    r.undo = new MenuItem({
        title: "Undo last change",
        run: undo,
        enable: state => undo(state),
        icon: icons.undo
    });

    r.redo = new MenuItem({
        title: "Redo last undone change",
        run: redo,
        enable: state => redo(state),
        icon: icons.redo
    });

    r.close = new MenuItem({
        title: "Close editor",
        run: (state:any, dispatch:any, view:EditorView) => {
            view.destroy();
        },
        icon: icons.close
    });

    r.insertMenu = new Dropdown(cut([r.insertHorizontalRule]), {label: "Insert"})
    r.typeMenu = new Dropdown(cut([r.makeParagraph, r.makeCodeBlock, r.makeHead1 && new DropdownSubmenu(cut([
        r.makeHead1, r.makeHead2, r.makeHead3, r.makeHead4, r.makeHead5, r.makeHead6
    ]), {label: "Heading"})]), {label: "Type..."})

    r.inlineMenu = [cut([r.toggleStrong, r.toggleEm, r.toggleCode, r.toggleLink])]
    r.blockMenu = [cut([r.wrapBulletList, r.wrapOrderedList, r.wrapBlockQuote])]
    r.fullMenu = r.inlineMenu.concat([r.insertMenu, r.typeMenu], [[r.undo, r.redo]], r.blockMenu, [[r.close]])

    return r
}

export function menuBar(schema: Schema): Plugin {
    return prosemirrorMenuBar({
        floating: false,
        content: buildMenuItems(schema).fullMenu
    })
}
