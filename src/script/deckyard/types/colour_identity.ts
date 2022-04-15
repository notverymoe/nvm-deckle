

export enum ColourIdentityPart {
    White = "W",
    Blue  = "U",
    Black = "B",
    Red   = "R",
    Green = "G",
}

const validIdentities: ColourIdentityPart[] = Object.values(ColourIdentityPart).filter((v): v is ColourIdentityPart => v.length === 1);



export class ColourIdentity {

    private static readonly cache: Record<symbol, ColourIdentity> = {};

    private readonly uniqueName: string;
    private readonly parts: ColourIdentityPart[] = [];

    private constructor(private readonly value: symbol) {
        this.uniqueName = Symbol.keyFor(this.value)!;
        for(const c of this.uniqueName) {
            this.parts.push(c as ColourIdentityPart);
        }
    }

    private static getUnique(value: symbol) {
        return this.cache[value] ?? (this.cache[value] = new ColourIdentity(value));
    }

    private static fromPartsRaw(colours: ColourIdentityPart[]) {
        const uniqueName = colours.sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0)).join("");
        return this.getUnique(Symbol.for(uniqueName));
    }

    static tryParse(colours: string[]) {
        colours = colours.map(v => v.toUpperCase());
        if(colours.findIndex(v => !(validIdentities as string[]).includes(v)) >= 0) return null;
        return ColourIdentity.fromParts(colours as ColourIdentityPart[]);
    }

    static fromParts(colours: ColourIdentityPart[]) {
        return this.fromPartsRaw([...new Set(colours).values()])
    }

    static fromSymbol(symbol: symbol) {
        const uniqueName = Symbol.keyFor(symbol);

        if (!uniqueName) return null;
        for(const c of uniqueName) {
            if (!(validIdentities as string[]).includes(c)) return null;
        }

        return this.getUnique(symbol);
    }

    static mergeAll(...v: ColourIdentity[]) {
        return v.reduce((p, v) => p.merge(v));
    }

    has(part: ColourIdentityPart) {
        return this.uniqueName.includes(part);
    }

    with(part: ColourIdentityPart) {
        return ColourIdentity.fromParts([...this.parts, part])
    }

    without(part: ColourIdentityPart) {
        return ColourIdentity.fromParts(this.parts.filter(v => v !== part))
    }

    merge(other: ColourIdentity) {
        return ColourIdentity.fromParts([...this.parts, ...other.parts]);
    }

    exclude(other: ColourIdentity) {
        return ColourIdentity.fromParts(this.parts.filter(v => !other.has(v)));
    }

    combinations(other: ColourIdentity, maxDepth: number = Number.POSITIVE_INFINITY) {
        if (maxDepth == 0 || this.colourCount >= validIdentities.length) return [];
        let result = other.exclude(this).parts.flatMap((v, i): ColourIdentity[] => {
            const u = this.with(v);
            return [u, ...u.combinations(other.exclude(ColourIdentity.fromParts(other.parts.filter((__, j) => j > i))), maxDepth-1)];
        });
        return result;
    }

    getHybrids(maxDepth: number = Number.POSITIVE_INFINITY) {
        return this.combinations(this.inverted, maxDepth);
    }

    overlaps(other: ColourIdentity) {
        return this.parts.findIndex(v => other.parts.includes(v)) >= 0;
    }

    matches(other: ColourIdentity) {
        return this.value === other.value;
    }

    get colourCount() {
        return this.uniqueName.length;
    }

    get inverted() {
        return ColourIdentity.fromParts(validIdentities.filter(v => !this.parts.includes(v)));
    }

    get isHybrid() {
        return this.uniqueName.length > 1;
    }

    get isMono() {
        return this.uniqueName.length === 1;
    }

    get isColourless() {
        return this.uniqueName.length === 0;
    }

    toParts() {
        return [...this.parts];
    }

    toSymbol() {
        return this.value;
    }

}