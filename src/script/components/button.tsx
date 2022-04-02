import "./button.scss";

import * as React from "react";
import { joinClassNames } from "util/shared";
import { useInterval, useMemoAsync } from "./hooks";
import { useCallback, useRef } from "react";
import { registerOneShotDocumentEvent, SVGComponent } from "./util";

export interface ButtonProps {
    className?: string,
    action?: () => void,
    icon?: SVGComponent,
    text?: string,
    title?: string,
    rate?: number,
    noCache?: boolean,
    noRepeat?: boolean,
    iconRotate?: number,
    refElem?: (v: HTMLButtonElement | null) => void,
}

export function ButtonGroup({className, direction, children}: {
    className?: string,
    direction: "vertical" | "horizontal",
    children?: React.ReactNode[],
}) {
    return <div 
        className={joinClassNames(`button-group ${direction}`, className)}
    >{children?.flatMap(v => [v, <ButtonSpacer/>]).splice(0, children?.length*2-1)}</div>;
}

export function Button({icon: Icon, text, title, action, rate, className, noCache, noRepeat, refElem, iconRotate}: ButtonProps) {
    const repeatSources = useRef(0);
    useInterval(() => {
        if (noRepeat || repeatSources.current === 0) return;
        action?.();
    }, rate ?? 20);

    return <button 
        className={joinClassNames("button", className)}
        onMouseDown={e => {
            if (noRepeat || e.button !== 0) return;
            repeatSources.current += 1;
            registerOneShotDocumentEvent("mouseup", e => {
                if (e.button !== 0) return;
                repeatSources.current -= 1;
            });
        }}
        onKeyDown={e => {
            if ((noRepeat && e.repeat) || e.key !== " ") return;
            action?.();
        }}
        onClick={e => {
            if (e.button !== 0) return;
            action?.();
        }}
        onSelect={e => {
            e.preventDefault();
        }}
        onSubmit={action}
        title={title}
        ref={refElem}
    >
        {Icon && <Icon 
            className="button-icon"
            style={iconRotate ? {transform: `rotate(${iconRotate*90}deg)`} : undefined}
        />}
        {text && <div
            className="button-text"
        >{text}</div>}
    </button>;
}

function ButtonSpacer() {
    return <div className="button-spacer"><div className="button-spacer-inner"/></div>;
}