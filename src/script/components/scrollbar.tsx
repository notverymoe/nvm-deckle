import "./scrollbar.scss";

import * as Preact from "preact";
import { ButtonText } from "./button";
import { useInterval } from "./hooks";
import { useCallback, useRef } from "preact/hooks";

export function ScrollBar({direction, value, setValue, step, panRate}: {
    direction: "vertical" | "horizontal",
    value: number,
    setValue: (v: number) => void,
    step: number,
    panRate?: number
}) {
    const top = clamp(value)*100;

    return <div class="scrollbar" style={{
        "--scrollbar-top": `${top}%`
    }}>
        <div class="scrollbar-inner">
            <ButtonText 
                content="^" 
                repeat={() => setValue(clamp(value - step))}
                rate={panRate ?? 100}
            />
            <div 
                class="scrollbar-slide"
                onMouseDown={e => {
                    if ((e.buttons & 1) !== 1) return;
                    e.preventDefault();
            
                    const target = e.currentTarget;
                    const update = (pageY: number) => {
                        const rect = target.getBoundingClientRect();
                        setValue(clamp(Math.max(pageY - rect.y, 0.0)/rect.height));
                    }

                    const cb = (e: MouseEvent) => {
                        if ((e.buttons & 1) !== 1) return;
                        e.preventDefault();
                        update(e.pageY);
                    };
                    update(e.pageY);
                    document.addEventListener("mousemove", cb);
                    document.addEventListener("mouseup", () => document.removeEventListener("mousemove", cb));
                }}
            >
                <div class="scrollbar-slider"><ButtonText content="="/></div>
            </div>
            <ButtonText
                content="v"
                repeat={() => setValue(clamp(value + step))}
                rate={panRate ?? 100}
            />
        </div>
    </div>;
}

function clamp(v: number): number {
    return Math.min(Math.max(v, 0), 1);
}