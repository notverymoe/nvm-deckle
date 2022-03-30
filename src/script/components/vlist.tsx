import "./vlist.scss";

import * as Preact from "preact";
import { useLayoutEffect, useMemo, useState } from "preact/hooks";
import { ScrollBar } from "./scrollbar";
import { useRangeVirtual } from "./hooks";


export function VList({lines: linesRaw, setRange, length, children}: {
    setRange: (v: [number, number]) => void,
    lines?: number,
    length: number,
    children?: Preact.VNode[],
}) {
    const lines = linesRaw ?? 1;
    const [scrollPosition, setScrollPosition] = useState(0);
    const [refContent, setRefContent] = useState<HTMLDivElement | null>(null);
    const [refContentSize, setRefContentSize] = useState<HTMLDivElement | null>(null);

    const offset = Math.min(Math.floor(scrollPosition * length), length - 1);
    const count  = (refContent && refContentSize && Math.ceil(refContent.clientHeight/refContentSize.offsetHeight)) || 0;
    const step   = 1/length;

    useLayoutEffect(() => setRange([offset, count]), [offset, count])

    return <div class="vlist">
        <div
            class="vlist-content" 
            ref={setRefContent} 
            style={{"--entry-height": `${refContentSize?.clientHeight ?? 0}px`}}
            onWheel={e => setScrollPosition(clamp(scrollPosition + step*Math.sign(e.deltaY)))}
        >
            <div 
                class="vlist-content-scaler"
                ref={setRefContentSize}
            >
                {Array.from({length: lines}, () => ".").join("\n")}
            </div>
            {children}
        </div>
        <ScrollBar
            direction="vertical"
            value={scrollPosition}
            setValue={setScrollPosition}
            step={step}
        />
    </div>;
}

function clamp(v: number) {
    return Math.min(Math.max(v, 0), 1);
}