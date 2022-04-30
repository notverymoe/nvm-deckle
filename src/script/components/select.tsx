import "./select.scss";

import * as React from "react";
import { joinClassNames } from "util/shared";

export function Select<T>({className, title, value, setValue, children}: {
    className?: string,
    title?: string,
    value: number,
    setValue: (v: number) => void,
    children?: React.ReactNode | React.ReactNode[]
}) {
    return <div className={joinClassNames("select", className)} title={title}>
        <select value={value} onChange={e => setValue(parseInt(e.target.value))}>
            {children}
        </select>
        <div className="arrow">▼</div>
    </div>
}


