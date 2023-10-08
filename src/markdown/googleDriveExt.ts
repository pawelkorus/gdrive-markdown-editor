import { ShowdownExtension } from "showdown"

export default function():ShowdownExtension {
    return {
        type: "lang",
        regex: /'''gd(\[.+\])?\s(.+?)\s/g,
        replace: handleGd
    }
}

function handleGd(match:string, group1:string, group2:string) {
    const attributes = {
        "src": group2? group2 : group1,
        "alt": group1? stripBrackets(group1) : undefined
    }

    const attributesStr = Object.keys(attributes)
        .map(k => isKey(attributes, k) && attributes[k] != undefined? k + '="' + attributes[k] + '"': "")
        .filter(v => v != "")
        .join(" ")
    
    return '<gdrive '+ attributesStr +'></gdrive> '
}

function stripBrackets(v:string) {
    return v.substring(1).slice(0, -1)
}

function isKey<T extends object>(x: T, k: PropertyKey): k is keyof T {
    return k in x;
}
