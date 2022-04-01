


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