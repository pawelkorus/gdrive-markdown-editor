import React from "react";
import { useProseState } from "./ProseStateProvider";
import { MilkdownEditor } from "..";
import { JSONTree } from 'react-json-tree'

type Props = {
    content: string
}

const twilight = {
    scheme: "twilight",
    base00: "#2E3440",
    base01: "#323537",
    base02: "#464b50",
    base03: "#5f5a60",
    base04: "#838184",
    base05: "#a7a7a7",
    base06: "#c3c3c3",
    base07: "#ffffff",
    base08: "#cf6a4c",
    base09: "#cda869",
    base0A: "#f9ee98",
    base0B: "#8f9d6a",
    base0C: "#afc4db",
    base0D: "#7587a6",
    base0E: "#9b859d",
    base0F: "#9b703f",
  };

export default function(props:Props):React.ReactElement {
    const proseState = useProseState()

    return (
<div>
    <MilkdownEditor content={props.content} />
    <JSONTree
        data={proseState}
        theme={twilight}
    />
</div>
    );
}
