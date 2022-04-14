import "./vlist.scss";

import * as React from "react";
import { ScrollBar } from "./scrollbar";
import { isElementOrChildOf, joinClassNames } from "util/shared";
import { useDeferredAction, useElementSize } from "./hooks";
import { useRef } from "react";




export interface VListBaseProps {
    length: number,
    offset: number,
    setOffset:     (v: number) => void,
    setCount:      (v: number) => void,
    setCountVis?:  (v: number) => void,
    setOffsetMax?: (v: number) => void,
    setHasFocus:  (v: boolean) => void,
    hasFocus:      boolean,
    lines?: number,
    className?: string,
    children?: React.ReactNode[],
    refElem?: (v: HTMLDivElement | null) => void,
    tabIndex?: number,
};

export interface VListUnselectableProps extends VListBaseProps {
    selectable?: false,
}

export interface VListSelectableProps extends VListBaseProps {
    selectable: true,
    selection:  number,
    setSelection: (v: number) => void,
};

export function VList(props: VListUnselectableProps | VListSelectableProps) {
    const { length, offset, setOffset, setCount, setCountVis, setOffsetMax, lines: linesRaw, children, className, refElem, tabIndex, setHasFocus, hasFocus } = props;

    const lines = linesRaw ?? 1; 
    const refContent     = useRef<HTMLDivElement | null>(null);
    const refContentSize = useRef<HTMLDivElement | null>(null);

    const contentHeight    = useElementSize<number>(refContent,     v => v.clientHeight) ?? 0;
    const contentRowHeight = useElementSize<number>(refContentSize, v => v.offsetHeight) ?? 0;

    const countRaw  = (contentHeight && contentRowHeight && contentHeight/contentRowHeight) || 1;
    const countDisp = Math.ceil(countRaw);
    const countReal = Math.floor(countRaw);
    const offsetMax = length - countReal;

    const scrollToSelection = useDeferredAction(
        (step) => {
            if (!props.selectable) return;
            const newSelection = Math.min(length-1, Math.max(0, props.selection+step));
            props.setSelection(newSelection);
        }, 
        8
    );

    React.useLayoutEffect(() => {
        if (!props.selectable) return;
        // TODO we can limit this to animation frames, maybe?
        if (props.selection < offset) {
            setOffset(Math.max(0, props.selection));
        } else if (props.selection >= offset + countReal) {
            setOffset(Math.max(0, props.selection - countReal + 1));
        }
    }, [props.selectable ? props.selection : null]);

    React.useEffect(() => {
        setCount(countDisp);
        setCountVis?.(countReal);
        setOffsetMax?.(offsetMax);
    }, [countReal, countDisp, offsetMax]);

    return <div className={joinClassNames("vlist", hasFocus && "focused" || "unfocused", className)} ref={refElem}>
        <div
            className="vlist-content" 
            ref={refContent} 
            style={{"--entry-height": `${contentRowHeight}px`} as any}
            onWheel={e => setOffset(offset + Math.sign(e.deltaY))}
            tabIndex={tabIndex}
            onFocus={() => setHasFocus(true)}
            onBlur={e => {
                if (isElementOrChildOf(e.relatedTarget as HTMLElement, e.currentTarget)) return;
                setHasFocus(false);
            }}
            onKeyDown={e => {
                if (!props.selectable) return;

                const arrowDown = e.code === "ArrowDown";
                const arrowUp   = e.code === "ArrowUp";
                const tab       = e.code === "Tab";
                if (!arrowDown && !arrowUp && !tab) return;

                const step = tab ? (e.shiftKey ? -1 : 1) : (arrowUp ? -1 : 1);
                if ((step < 0 && props.selection > 0) || (step > 0 && props.selection+1 < length)) {
                    e.preventDefault();
                    scrollToSelection(step);
                }
            }}
        >
            <div className="vlist-cell-scaler" ref={refContentSize}>
                {Array.from({length: lines}, () => ".").join("\n")}
            </div>
            {children?.map((v, i) => <div 
                className={joinClassNames("vlist-cell", props.selectable && offset+i === props.selection && "selected")} 
                key={i} 
                onClick={() => {
                    if (!props.selectable) return;
                    props.setSelection(offset+i);
                }}
            >{v}</div>)}
        </div>
        <ScrollBar direction="vertical" valueMax={offsetMax} value={offset} setValue={setOffset} step={1}/>
    </div>;
}