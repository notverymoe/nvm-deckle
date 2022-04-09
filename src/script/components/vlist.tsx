import "./vlist.scss";

import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { ScrollBar } from "./scrollbar";
import { joinClassNames } from "util/shared";
import { useElementHeight, useElementSize } from "./hooks";
import { useRef } from "react";

export function VList({length, offset, setOffset, setCount, setCountVis, setOffsetMax, lines: linesRaw, children, className, events, eventsContent: evenstContent, refElem, tabIndex}: {
    length: number,
    offset: number,
    setOffset:     (v: number) => void,
    setCount:      (v: number) => void,
    setCountVis?:  (v: number) => void,
    setOffsetMax?: (v: number) => void,
    lines?: number,
    className?: string,
    children?: React.ReactNode[],
    events?:        Partial<React.DOMAttributes<HTMLDivElement>>,
    eventsContent?: Partial<React.DOMAttributes<HTMLDivElement>>,
    refElem?: (v: HTMLDivElement | null) => void,
    tabIndex?: number,
}) {
    const lines = linesRaw ?? 1; 
    const refContent     = useRef<HTMLDivElement | null>(null);
    const refContentSize = useRef<HTMLDivElement | null>(null);

    const contentHeight    = useElementSize<number>(refContent,     v => v.clientHeight) ?? 0;
    const contentRowHeight = useElementSize<number>(refContentSize, v => v.offsetHeight) ?? 0;

    const countRaw  = (contentHeight && contentRowHeight && contentHeight/contentRowHeight) || 1;
    const countDisp = Math.ceil(countRaw);
    const countReal = Math.floor(countRaw);
    const offsetMax = length - countReal;

    useEffect(() => {
        setCount(countDisp);
        setCountVis?.(countReal);
        setOffsetMax?.(offsetMax);
    }, [countReal, countDisp, offsetMax]);

    return <div {...events} className={joinClassNames("vlist", className)} ref={refElem}>
        <div
            {...evenstContent}
            className="vlist-content" 
            ref={refContent} 
            style={{"--entry-height": `${contentRowHeight}px`} as any}
            onWheel={e => setOffset(offset + Math.sign(e.deltaY))}
            tabIndex={tabIndex}
        >
            <div 
                className="vlist-content-scaler"
                ref={refContentSize}
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
