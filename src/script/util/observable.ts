import { useTrigger } from "components/hooks";
import { useCallback, useEffect, useRef } from "react";
import { Disposable, DisposeGuard } from "./disposable";


export type ObservableChanged<T> = (current: T, old: T) => void;

export class Observable<T> {

    private listeners: ObservableChanged<T>[] = [];
    private reentry = 0;

    constructor(
        private _value: T,
        private equals: (a: T, b: T) => boolean = (a, b) => a === b,
    ) {}

    connect(listener: ObservableChanged<T>, skipInitial?: boolean): Disposable {
        if (!skipInitial) listener(this._value, this._value);
        this.listeners.push(listener);
        return new DisposeGuard(() => this.disconnect(listener));
    }

    disconnect(listener: ObservableChanged<T>): boolean {
        const idx = this.listeners.indexOf(listener);
        if (idx < 0) return false;
        this.listeners.splice(idx, 1);
        return true;
    }

    clear() {
        this.listeners.length = 0;
    }

    refresh() {
        this.notify(this._value, this._value);
    }

    set value(next: T) {
        let value = this._value;
        this._value = next;
        if (this.equals(next, value)) this.notify(next, value)
    }

    get value() {
        return this._value;
    }

    private notify(next: T, prev: T) {
        if (this.reentry) console.warn("Attempt to re-enter obserable::notify");
        this.reentry++;

        for(const listener of [...this.listeners]) {
            try {
                listener(next, prev);
            } catch(e) {
                console.error(e);
            }
        }

        this.reentry--;
    }

}

export function useObservableTrigger<T>(obserable: Observable<T> | undefined | null) {
    const [count, trigger] = useTrigger();
    useEffect(() => {
        if (!obserable) return;
        const guard = obserable.connect(trigger);
        return () => guard.dispose();
    }, [obserable]);
    return count;
}

export function useObservableReadonly<T>(obserable: Observable<T>) {
    useObservable(obserable);
    return obserable.value;
}

export function useObservable<T>(obserable: Observable<T>) {
    useObservable(obserable);

    const observableRef = useRef(obserable);
    observableRef.current = obserable;

    const update = useCallback((v: T) => observableRef.current.value = v, []);
    return [obserable.value, update] as const;
}

