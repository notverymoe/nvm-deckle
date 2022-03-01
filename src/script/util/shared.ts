


export function joinClassNames(...names: any[]) {
    return names.filter(v => v && typeof v === "string").join(" ");
}

