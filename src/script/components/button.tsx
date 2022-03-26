import "./button.scss";

import * as Preact from "preact";
import { joinClassNames } from "util/shared";
import { useInterval, useMemoAsync } from "./hooks";
import { useRef } from "preact/hooks";

export interface ButtonProps {
    ["class"]?: string,
    action?: () => void,
    repeat?: () => void,
    content: string,
    title?: string,
    rate?: number,
}

export function ButtonText(props: ButtonProps) {
    return <ButtonInternal kind="text" {...props}/>;
}

export function ButtonIcon(props: ButtonProps) {
    return <ButtonInternal kind="icon" {...props}/>;
}


function ButtonInternal({kind, content, title, action, repeat, rate, ["class"]: className}: ButtonProps & {kind: "text" | "icon"}) {
    const repeatRef = useRef(repeat);
    repeatRef.current = repeat;
    const [,img,] = useMemoAsync(() => {
        if (kind !== "icon") return Promise.resolve("");
        return fetch(content).then(v => v.text());
    }, [kind, content]);

    const repeatSources = useRef(0);

    useInterval(() => {
        if (repeatSources.current === 0) return;
        repeat?.();
    }, rate ?? 20);

    return <button 
        class={joinClassNames("button text", className)}
        onMouseDown={e => {
            e.preventDefault();
            const cb = () => {
                document.removeEventListener("mouseup", cb);
                repeatSources.current -= 1;
            };
            document.addEventListener("mouseup", cb);
            repeatSources.current += 1;
        }}
        onKeyDown={e => {
            if (e.code !== "Space") return;
            e.preventDefault();
            const cb = () => {
                if (e.code !== "Space") return;
                document.removeEventListener("keyup", cb);
                repeatSources.current -= 1;
            };
            document.addEventListener("keyup", cb);
            repeatSources.current += 1;
        }}
        onClick={action && (e => { if (e.button == 0) { action();} })}
        onSubmit={action}
        title={title}
        dangerouslySetInnerHTML={kind === "icon" ? {__html: img ?? ""} : undefined}
    >{kind === "text" ? content : undefined}</button>;
}

export function ButtonGroup({["class"]: className, direction, children}: {
    ["class"]?: string,
    direction: "vertical" | "horizontal",
    children?: Preact.ComponentChild[],
}) {
    return <div 
        class={joinClassNames(`button-group ${direction}`, className)}
    >{children?.flatMap(v => [v, <ButtonSpacer/>]).splice(0, children?.length*2-1)}</div>;
}

function ButtonSpacer() {
    return <div class="button-spacer"><div class="button-spacer-inner"/></div>;
}