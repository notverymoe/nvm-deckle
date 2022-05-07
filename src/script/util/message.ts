import { useTrigger } from "components/hooks";
import { useEffect, useRef } from "react";
import { Disposable, DisposeGuard } from "./disposable";

export type MessageCallback<T extends any[]> = (...args: T) => void;

export class MessageSource<T extends any[]> {

    private listeners: MessageCallback<T>[] = [];
    private reentry = 0;

    connect(listener: MessageCallback<T>): Disposable {
        this.listeners.push(listener);
        return new DisposeGuard(() => this.disconnect(listener));
    }

    disconnect(listener: MessageCallback<T>): boolean {
        const idx = this.listeners.indexOf(listener);
        if (idx < 0) return false;
        this.listeners.splice(idx, 1);
        return true;
    }

    clear() {
        this.listeners.length = 0;
    }

    _notify(...args: T) {
        if (this.reentry) console.warn("Attempt to re-enter MessageSource::notify");
        this.reentry++;

        for(const listener of [...this.listeners]) {
            try {
                listener(...args);
            } catch(e) {
                console.error(e);
            }
        }

        this.reentry--;
    }
}

export function useMessageTrigger<T extends any[]>(
    source: MessageSource<T> | undefined | null, 
    filter?: (...v: T) => boolean
) {
    const [count, trigger] = useTrigger();
    const filterRef = useRef(filter);
    filterRef.current = filter;
    useEffect(() => {
        if (!source) return;
        const guard = source.connect((...v) => {
            if (filterRef.current?.(...v) ?? true) trigger();
        });
        return () => guard.dispose();
    }, [source]);
    return count;
}