import useResizeObserver from "@react-hook/resize-observer";
import * as React from "react";
import { Disposable } from "util/disposable";
import { ReadonlyWatchValue, WatchValue } from "util/watch_value";

export function useMemoAsync<T>(callback: () => Promise<T>, deps?: any[]): [boolean, T | undefined, Error | undefined] {
    const reqCount = React.useRef(0);
    const [result, setResult] = React.useState<[boolean, T | undefined, Error | undefined]>([false, undefined, undefined]);

    React.useEffect(() => {
        setResult([false, undefined, undefined]);
        const req = ++reqCount.current;
        callback().then(v => {
            if (req != reqCount.current) return;
            setResult([true, v, undefined]);
        }).catch(e => {
            if (req != reqCount.current) return;
            setResult([true, undefined, e]);
        });
    }, deps ?? []);

    
    return result;
}

export function useMemoWithDispose<T extends Disposable>(callback: () => T, deps?: any[]) {
    const value = React.useMemo(callback, deps);
    React.useEffect(() => { return () => value.dispose(); }, [value]);
    return value;
}

export function useCallbackWrapped<T extends Function>(callback: T): T {
    const ref = React.useRef(callback);
    ref.current = callback;
    const wrapped = React.useCallback((...v: any[]) => ref.current(...v), []);
    return wrapped as unknown as T;
}

export function useWatchValue<T>(container: WatchValue<T>): [T, (v: T) => void] {
    const [,setCount] = React.useState(0);
    const countRef = React.useRef(0);
    useMemoWithDispose(() => container.watch(() => setCount(++countRef.current), true), [container]);
    const setWrapped = useCallbackWrapped((v: T) => { container.value = v; });
    return [container.value, setWrapped]
}

export function useWatchValueReadonly<T>(container: ReadonlyWatchValue<T>) {
    const [,setCount] = React.useState(0);
    const countRef = React.useRef(0);
    useMemoWithDispose(() => container.watch(() => setCount(++countRef.current), true), [container]);
    return container.value;
}

export function useLast<T>(value: T, initial: T) {
    const result = React.useRef(initial);
    const last = result.current;
    result.current = value;
    return last;
}

export function useElementSize<T>(ref: React.RefObject<HTMLElement>, cb: (v: HTMLElement) => (T | null)) {
    const [state, setState] = React.useState<T | null>(null);
    React.useLayoutEffect(() => setState(ref?.current ? cb(ref.current!) : null), [ref.current]);
    useResizeObserver(ref, (entry) => setState(cb(entry.target as HTMLElement)));
    return state;
}

export function useElementHeight(ref: React.RefObject<HTMLElement>): number | null {
    const [height, set_height] = React.useState<number | null>(0);
    React.useLayoutEffect(() => set_height(ref.current?.getBoundingClientRect().height ?? null))
    useResizeObserver(ref, (entry) => set_height(entry.contentRect.height));
    return height;
}

export function useElementWidth(ref: React.RefObject<HTMLElement>): number | null {
    const [width, set_width] = React.useState<number | null>(0);
    React.useLayoutEffect(() => set_width(ref.current?.getBoundingClientRect().width ?? null))
    useResizeObserver(ref, (entry) => set_width(entry.contentRect.width));
    return width;
}

export function useRangeVirtual<T>(
    callback: (idx: number, count: number) => T[],
    index: number,
    count: number,
    limit?: number | undefined | null,
    deps?: any[] | undefined | null,
): T[] {
    const result = React.useRef<T[]>([]);

    const currentDeps = [[index, count, limit], (deps ?? [])];
    const lastDeps    = React.useRef<any[]>([[0, 0, undefined], []]);

    if (areDepsDifferent(currentDeps[1], lastDeps.current[1])) {
        let end = limit == null ? index + count : Math.min(limit, index + count);
        lastDeps.current = currentDeps;
        result.current = callback(index, end - index);
    } else if(areDepsDifferent(currentDeps[0], lastDeps.current[0])) {
        const oldStart: number = lastDeps.current[0][0];
        const oldEnd:   number = oldStart + result.current.length;

        let start = index; 
        let end   = limit == null ? index + count : Math.min(limit, index + count);

        lastDeps.current = currentDeps;

        if (start !== oldStart || end !== oldEnd) {
            if ((end < oldStart) || (start >= oldEnd)) {
                // No overlap
                result.current = callback(index, end - index);
            } else {
    
                if (start < oldStart) {
                    // Start shifted backwards, lengthen
                    result.current.unshift(...callback(start, oldStart - start));
                } else if (start > oldStart) {
                    // Start shifted forwards, shorten
                    result.current.splice(0, start - oldStart);
                }
    
                if (end < oldEnd) {
                    // End shifted backwards, shorten
                    result.current.length -= oldEnd - end;
                } else if (end > oldEnd) {
                    // End shifted forwards, lengthen
                    result.current.push(...callback(oldEnd, end-oldEnd));
                }

                result.current = [...result.current];
            }
        }


        // TODO PERF Reuse non-invalidated entries
    }

    return result.current;
}

function areDepsDifferent(a: any[], b: any[]): boolean {
    return a.length != b.length || a.findIndex((v,i) => v !== b[i]) >= 0;
}

export function useInterval(callback: () => void | Promise<void>, rate: number) {

    const wrapped = React.useRef({callback, rate});
    wrapped.current.callback = callback;
    wrapped.current.rate     = rate;

    React.useEffect(() => {
        const cb = async () => {
            try{
                await wrapped.current.callback();
            } catch(e) {
                console.error(e);
            } finally {
                currentTimeout = setTimeout(cb, wrapped.current.rate);
            }
        };
        let currentTimeout = setTimeout(cb, wrapped.current.rate);
        return () => clearTimeout(currentTimeout);
    }, []);
}

export function useAnimationFrame(callback: () => void | Promise<void>) {

    const wrapped = React.useRef(callback);
    wrapped.current = callback;

    React.useEffect(() => {
        const cb = async () => {
            try{
                await wrapped.current();
            } catch(e) {
                console.error(e);
            } finally {
                currentTimeout = requestAnimationFrame(cb);
            }
        };
        let currentTimeout = requestAnimationFrame(cb);
        return () => cancelAnimationFrame(currentTimeout);
    }, []);
}

export function useDeferredAction<T extends (...args: any) => any>(
    callback: T, 
    delay?: number
): (...v: Parameters<T>) => void {

    // TODO promise
    // TODO animation frame
    // TODO mutable argument callback, ie ( transformArguments(v => v[0] + 1 ) )
    //      might not be a clean syntax for this...

    const state = React.useMemo(() => ({
        timeout: -1,
        args:    null as (Parameters<T> | null),
        callback,
        delay,
    }), []);
    state.callback = callback;
    state.delay    = delay;

    React.useEffect(() => {
        return () => { if (state.timeout >= 0) clearTimeout(state.timeout); };
    }, []);

    return React.useCallback((...v: Parameters<T>) => {
        state.args = v;
        if (state.timeout < 0) {
            state.timeout = setTimeout(() => {
                state.timeout = -1;
                const args = state.args;
                state.args = null;
                state.callback.apply(state.callback, args!);
            }, state.delay);
        }
    }, []);
}