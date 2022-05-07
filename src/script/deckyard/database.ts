import * as FlexSearch from "flexsearch";
import { cooperativeIteratorToSet, iterUnion } from "util/iterator";

import { Card, CardType, Layout } from "./types";
import { CardTypeSuper } from "./types/card_type_super";
import { ColourIdentity } from "./types/colour_identity";

export class CardDatabase {
    
    constructor(
        readonly cards: Card[],
        private readonly byCardTextFuzzy:   FlexSearch.Document<Card, true>,
        private readonly byCardTextExact:   FlexSearch.Document<Card, true>,
        private readonly byCardType:      Partial<Record<string, Set<Card>>>,
        private readonly byCardTypeSuper: Partial<Record<string, Set<Card>>>,
        private readonly byCardTypeSub:   Partial<Record<string, Set<Card>>>,
        private readonly byCardLayout:    Partial<Record<string, Set<Card>>>,
        private readonly byCardIdentity:  Partial<Record<symbol, Set<Card>>>,
    ) {}

    get allTypesSub() {
        return Object.keys(this.byCardTypeSub);
    }

    async searchName(query: string, exact: "exact" | "partial" | "fuzzy" = "exact"): Promise<Set<Card>> {
        // TODO true exact
        const index = exact === "exact" 
            ? this.byCardTextExact 
            : (exact === "partial" ? this.byCardTextExact : this.byCardTextFuzzy);
        const results = await index.searchAsync(query, {index: "name", enrich: true});
        return new Set(results[0]?.result.map(v => v.doc) ?? []);
    }

    async searchText(query: string, exact: "exact" | "partial" | "fuzzy" = "exact"): Promise<Set<Card>> {
        // TODO true exact
        const index = exact === "exact" 
            ? this.byCardTextExact 
            : (exact === "partial" ? this.byCardTextExact : this.byCardTextFuzzy);
        const results = await index.searchAsync(query, {index: "faces[]:text", enrich: true});
        return new Set(results[0]?.result.map(v => v.doc) ?? []);
    }

    async searchTypeCard(query: CardType): Promise<Set<Card>> {
        return new Set(this.byCardType[query]?.values() ?? []);
    }

    async searchTypeSuper(query: CardTypeSuper): Promise<Set<Card>> {
        return new Set(this.byCardTypeSuper[query]?.values() ?? []);
    }

    async searchTypeSub(query: string, exact: "exact" | "partial" | "fuzzy" = "exact"): Promise<Set<Card>> {
        if(exact === "exact") return new Set(this.byCardTypeSub[query.toLowerCase()]?.values() ?? []);
        const index = exact === "partial" ? this.byCardTextExact : this.byCardTextFuzzy;
        const results = await index.searchAsync(query, {index: "faces[]:typesSub[]", enrich: true});
        return new Set(results[0]?.result.map(v => v.doc) ?? []);
    }

    async searchIdentity(query: ColourIdentity, exact: "exact" | "partial" | "fuzzy", includeColourless = false): Promise<Set<Card>> {
        if(exact === "exact") {
            return this.byCardIdentity[query.toSymbol()] ?? new Set();     
        } else {
            const sets = [this.byCardIdentity[query.toSymbol()]!];
            if(exact === "partial") {
                for(const variant of query.getHybrids()) {
                    sets.push(this.byCardIdentity[variant.toSymbol()]!);
                }
            } else {
                if (includeColourless) sets.push(this.byCardIdentity[ColourIdentity.colourless.toSymbol()]!);
                for(const variant of ColourIdentity.colourless.combinations(query)) {
                    sets.push(this.byCardIdentity[variant.toSymbol()]!);
                }
            }
            return cooperativeIteratorToSet(iterUnion(...sets), 1000);
        }
        
    }

    async searchLayout(query: Layout): Promise<Set<Card>> {
        return this.byCardLayout[query] ?? new Set();
    }

}   
