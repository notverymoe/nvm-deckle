import * as Preact from "preact";
import * as PreactHooks from "preact/hooks";

export function VirtualChildren({offset, count, length, render}: {
    offset: number,
    count: number,
    length: number,
    render: (idx: number) => Preact.ComponentChildren
}) {
    offset = Math.max(0, Math.min(offset, length-1));
    const elements = PreactHooks.useMemo(
        () => {
            return Array.from({length: count}, (_,i) => offset+i < length
                ? <VirtualChildElement key={offset+i} idx={offset+i} render={render}/>
                : <VirtualChildElement key={offset+i} idx={offset+i} render={() => <></>}/>
            )
        }, 
        [offset, count, length, render]
    );
    return <>{elements}</>;
}

function VirtualChildElement({idx, render}: {idx: number, render: (idx: number) => void}) {
    return <>{render(idx)}</>;
}