import useResizeObserver from "@react-hook/resize-observer";
import * as Preact from "preact/hooks";
import { Disposable } from "util/disposable";
import { WatchValue } from "util/watch_value";

export function useMemoWithDispose<T extends Disposable>(callback: () => T, deps?: any[]) {
    const value = Preact.useMemo(callback, deps);
    Preact.useEffect(() => { return () => value.dispose(); }, deps);;
    return value;
}

export function useCallbackWrapped<T extends Function>(callback: T) {
    const ref = Preact.useRef(callback);
    ref.current = callback;
    const wrapped = Preact.useRef((...v: any[]) => ref.current(...v));
    return wrapped.current as unknown as T;
}

export function useWatchValue<T>(container: WatchValue<T>) {
    const [,setCount] = Preact.useState(0);
    const countRef = Preact.useRef(0);
    useMemoWithDispose(() => container.watch(() => setCount(countRef.current++)), [container]);
    const setWrapped = useCallbackWrapped((v: T) => { container.value = v; });
    return [container.value, setWrapped]
}

export function useLast<T>(value: T, initial: T) {
    const result = Preact.useRef(initial);
    const last = result.current;
    result.current = value;
    return last;
}

export function useElementHeight(ref: Preact.Ref<HTMLElement | null>): number | null {
    const [height, set_height] = Preact.useState<number | null>(0);
    Preact.useLayoutEffect(() => set_height(ref.current?.getBoundingClientRect().height ?? null))
    useResizeObserver(ref, (entry) => set_height(entry.contentRect.height));
    return height;
}