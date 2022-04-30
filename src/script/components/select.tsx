import "./select.scss";

import * as React from "react";
import { joinClassNames } from "util/shared";

export function Select<T>({className, title, value, setValue, children, Overlay}: {
    className?: string,
    title?: string,
    value: number,
    setValue: (v: number) => void,
    children?: React.ReactNode | React.ReactNode[],
    Overlay: React.FunctionComponent<{value: number}>
}) {
    return <div className={joinClassNames("select", className)} title={title}>
        <select value={value} onChange={e => setValue(parseInt(e.target.value))}>
            {children}
        </select>
        <div className="overlay"><Overlay value={value}/></div>
        <div className="arrow">▼</div>
    </div>
}


