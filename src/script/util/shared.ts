


export function joinClassNames(...names: any[]) {
    return names.filter(v => v && typeof v === "string").join(" ");
}

export function fromRange<T>(offset: number, length: number, cb: (v: number) => T): T[] {
    return Array.from({length}, (_, i) => cb(offset + i));
}

export function isElementOrChildOf(root: Element, target: Element | null): boolean {
    while(target && target !== root) target = target.parentElement;
    return target === root;
}

export function resizeArray<T>(length: number, v: T[], def: T) {
    const start = v.length;
    v.length = length;
    if (start < length) v.fill(def, start, length);
}

export function resizeArrayNested(length: number, v: any[][]) {
    let oldLen = v.length;
    v.length = length;
    for(let i = oldLen; i < length; i++) v[i] = [];
}