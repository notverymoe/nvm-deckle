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
    repeat?: boolean,
    iconRotate?: number,
    refElem?: (v: HTMLButtonElement | null) => void,
    disabled?: boolean,
    disabledTitle?: string,
    selected?: boolean,
}

export function ButtonGroup({className, direction, children: childrenRaw}: {
    className?: string,
    direction: "vertical" | "horizontal",
    children?: React.ReactNode[],
}) {
    const children = childrenRaw?.filter(v => v != null);
    return <div 
        className={joinClassNames(`button-group ${direction}`, className)}
    >{children?.flatMap((v, i) => [v, <ButtonSpacer key={children.length + i}/>]).splice(0, children?.length*2-1)}</div>;
}

export function Button({icon: Icon, selected, disabledTitle, text, title, action, rate, className, disabled, repeat, refElem, iconRotate}: ButtonProps) {
    const repeatSources = useRef(0);
    useInterval(() => {
        if (disabled || !repeat || repeatSources.current === 0) return;
        action?.();
    }, rate ?? 20);

    return <button 
        className={joinClassNames("button", selected && "selected", className)}
        onMouseDown={e => {
            if (disabled || !repeat || e.button !== 0) return;
            repeatSources.current += 1;
            registerOneShotDocumentEvent("mouseup", e => {
                if (e.button !== 0) return;
                repeatSources.current -= 1;
            });
        }}
        onKeyDown={e => {
            if ((!repeat && e.repeat) || e.key !== " ") return;
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
        title={disabled ? (disabledTitle ?? title) : title}
        ref={refElem}
        disabled={disabled}
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