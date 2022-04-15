
export function* iterUnion<T>(...v: Iterable<T>[]) {
    for(const iter of v) {
        for(const val of iter) {
            yield val;
        }
    }
}

export function* iterIntersection<T>(a: Set<T>, ...b: Iterable<T>[]) {
    for(const val of iterUnion(...b)) {
        if (a.has(val)) yield val;
    }
}

export function* iterDifference<T>(a: Set<T>, ...b: Iterable<T>[]) {
    for(const val of iterUnion(...b)) {
        if (!a.has(val)) yield val;
    }
}



