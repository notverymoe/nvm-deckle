import "./vlist.scss";

import * as Preact from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import { ScrollBar } from "./scrollbar";
import { joinClassNames } from "util/shared";

export function VList({length, offset, setOffset, setCount, setCountVis, setOffsetMax, lines: linesRaw, children, ["class"]: className, events, refElem, tabIndex}: {
    length: number,
    offset: number,
    setOffset:     (v: number) => void,
    setCount:      (v: number) => void,
    setCountVis?:  (v: number) => void,
    setOffsetMax?: (v: number) => void,
    lines?: number,
    ["class"]?: string,
    children?: Preact.VNode[],
    events?: Partial<Preact.JSX.DOMAttributes<HTMLDivElement>>,
    refElem?: (v: HTMLDivElement | null) => void,
    tabIndex?: number,
}) {
    const lines = linesRaw ?? 1;
    const [refContent,     setRefContent    ] = useState<HTMLDivElement | null>(null);
    const [refContentSize, setRefContentSize] = useState<HTMLDivElement | null>(null);

    const countRaw  = refContent && refContentSize && (refContent.clientHeight/refContentSize.offsetHeight) || 1;
    const countDisp = Math.ceil(countRaw);
    const countReal = Math.floor(countRaw);
    const offsetMax = length - countReal;

    useEffect(() => {
        setCount(countDisp);
        setCountVis?.(countReal);
        setOffsetMax?.(offsetMax);
    }, [countReal, countDisp, offsetMax]);

    return <div {...events} class={joinClassNames("vlist", className)} ref={refElem}>
        <div
            class="vlist-content" 
            ref={setRefContent} 
            style={{"--entry-height": `${refContentSize?.clientHeight ?? 0}px`}}
            onWheel={e => setOffset(offset + Math.sign(e.deltaY))}
            tabIndex={tabIndex}
        >
            <div 
                class="vlist-content-scaler"
                ref={setRefContentSize}
            >{Array.from({length: lines}, () => ".").join("\n")}</div>
            {children}
        </div>
        <ScrollBar
            direction="vertical"
            valueMax ={offsetMax} 
            value    ={offset   }
            setValue ={setOffset}
            step     ={1}
        />
    </div>;
}
