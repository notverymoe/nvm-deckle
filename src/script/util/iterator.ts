
export function* iterUnion<T>(...v: Iterable<T>[]) {
    for(const iter of v) {
        for(const val of iter) {
            yield val;
        }
    }
}

export function* iterIntersection<T>(a: Set<T>, ...b: Iterable<T>[]) {
    if (b.length <= 0) {
        for(const val of a) {
            yield val;
        }
    } else {
        for(const val of iterUnion(...b)) {
            if (a.has(val)) yield val;
        }
    }

}

export function* iterDifference<T>(a: Set<T>, ...b: Iterable<T>[]) {
    for(const val of iterUnion(...b)) {
        if (!a.has(val)) yield val;
    }
}

export async function cooperativeIteratorToSet<T>(a: Iterable<T>, rate: number) {
    const result = new Set<T>();
    let count = 0;
    for(const entry of a) {
        result.add(entry);
        if (count >= rate) {
            await new Promise(r => setTimeout(r));
            count = 0;
        } else {
            count++;
        }
    }
    return result;
}