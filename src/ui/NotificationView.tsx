import React, { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
    message?: string|null,
}>

export default function(props:Props):React.ReactElement {
    if(props.message) {
        return (
<div className="container-lg mt-4">    
    <div className="row content">
        {props.message}
    </div>
</div>)
    } else {
        return <div>{props.children}</div>;
    }
}
