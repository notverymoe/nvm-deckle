import { useCallback, useRef } from "react";
import { Disposable } from "./disposable";
import { MessageCallback, MessageSource, useMessageTrigger } from "./message";

export class Observable<T> extends MessageSource<[T, T]> {

    constructor(
        private _value: T,
        private equals: (a: T, b: T) => boolean = (a, b) => a === b,
    ) {
        super();
    }

    connect(listener: MessageCallback<[T, T]>, skipInitial?: boolean): Disposable {
        const result = super.connect(listener);
        if (!skipInitial) listener(this._value, this._value);
        return result;
    }

    refresh() {
        this._notify(this._value, this._value);
    }

    set value(next: T) {
        let value = this._value;
        this._value = next;
        if (!this.equals(next, value)) this._notify(next, value);
    }

    get value() {
        return this._value;
    }

}

export function useObservableReadonly<T>(obserable: Observable<T>) {
    useMessageTrigger(obserable);
    return obserable.value;
}

export function useObservable<T>(obserable: Observable<T>) {
    useMessageTrigger(obserable);

    const observableRef = useRef(obserable);
    observableRef.current = obserable;

    const update = useCallback((v: T) => observableRef.current.value = v, []);
    return [obserable.value, update] as const;
}