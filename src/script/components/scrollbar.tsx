import "./scrollbar.scss";

import * as React from "react";
import { Button } from "./button";
import { useRef } from "react";

import IconArrow from "assets/icons/mui_play_arrow.svg";
import IconMenu  from "assets/icons/mui_menu.svg";
import { joinClassNames } from "util/shared";

export function ScrollBar({direction, value, setValue, valueMax, step, panRate, scrollRate, className}: {
    direction: "vertical" | "horizontal",
    value: number,
    setValue: (v: number) => void,
    step: number,
    valueMax?: number,
    panRate?: number,
    scrollRate?: number,
    className?: string,
}) {
    function clamp(v: number): number {
        return Math.min(Math.max(v, 0), valueMax ?? 1);
    }

    const offset   = clamp(value)/(valueMax ?? 1)*100;
    const refUp    = useRef<HTMLButtonElement | null>(null);
    const refDown  = useRef<HTMLButtonElement | null>(null);
    const refSlide = useRef<HTMLButtonElement | null>(null);

    return <div 
        className={joinClassNames(`scrollbar`, direction, className)} 
        style={{"--scrollbar-offset": `${offset}%`} as any}
        onWheel={e => setValue(clamp(value + (scrollRate ?? 1)*step*Math.sign(e.deltaY)))}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            switch(e.key) {
                case "ArrowUp": {
                    if (direction !== "vertical") return;
                    setValue(clamp(value - step));
                    refUp.current?.focus();
                } break;
                case "ArrowDown": {
                    if (direction !== "vertical") return;
                    setValue(clamp(value + step));
                    refDown.current?.focus();
                } break;
                case "ArrowLeft": {
                    if (direction !== "horizontal") return;
                    setValue(clamp(value - step));
                    refUp.current?.focus();
                } break;
                case "ArrowRight": {
                    if (direction !== "horizontal") return;
                    setValue(clamp(value + step));
                    refDown.current?.focus();
                } break;
            }
        }}
    >
        <div className="scrollbar-inner">
            <Button 
                icon={IconArrow}
                iconRotate={direction == "horizontal" ? 2 : 3}
                action={() => setValue(clamp(value - step))}
                rate={panRate ?? 100}
                refElem={v => refUp.current = v}
                repeat
            />
            <div 
                className="scrollbar-slide"
                onMouseDown={e => {
                    if ((e.buttons & 1) !== 1) return;
                    e.preventDefault();
            
                    const target = e.currentTarget;
                    const update = (ev: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent) => {
                        refSlide.current?.focus();

                        const rect   = target.getBoundingClientRect();
                        const point  = direction === "vertical" ? ev.pageY         : ev.pageX;
                        const origin = resolveOffsets(target)[direction === "vertical" ? 1 : 0];
                        const length = direction === "vertical" ? rect.height      : rect.width;
                        setValue(clamp(Math.max(point - origin, 0.0)/length * (valueMax ?? 1)));
                    }

                    const cb = (e: MouseEvent) => {
                        if ((e.buttons & 1) !== 1) return;
                        update(e);
                    };
                    update(e);
                    document.addEventListener("mousemove", cb);
                    document.addEventListener("mouseup", () => document.removeEventListener("mousemove", cb));
                }}
            >
                <div className="scrollbar-slider">
                    <Button 
                        icon={IconMenu} 
                        refElem={v => refSlide.current = v}
                        iconRotate={direction == "horizontal" ? 1 : 0}
                    />
                </div>
            </div>
            <Button
                icon={IconArrow}
                iconRotate={direction == "horizontal" ? 0 : 1}
                action={() => setValue(clamp(value + step))}
                rate={panRate ?? 100}
                refElem={v => refDown.current = v}
                repeat
            />
        </div>
    </div>;
}

function resolveOffsets(element: HTMLElement | Element | null) {
    const result: [number, number] = [0,0];
    while(element && "offsetParent" in element) {
        result[0] += element.offsetLeft;
        result[1] += element.offsetTop;
        if(element === document.body) {
            element = document.documentElement;
        } else {
            element = element.offsetParent;
        }
    }
    return result;
}