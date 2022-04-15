import * as FlexSearch from "flexsearch";

import { Card, CardType, Layout } from ".";
import { CardTypeSuper } from "./card_type_super";
import { ColourIdentity } from "./colour_identity";

export class CardDatabase {
    
    constructor(
        readonly cards: Card[],
        private readonly byCardTextFuzzy: FlexSearch.Document<Card, true>,
        private readonly byCardTextExact: FlexSearch.Document<Card, true>,
        private readonly byCardType:      Partial<Record<CardType,      Set<Card>>>,
        private readonly byCardTypeSuper: Partial<Record<CardTypeSuper, Set<Card>>>,
        private readonly byCardTypeSub:   Partial<Record<string,        Set<Card>>>,
        private readonly byCardLayout:    Partial<Record<Layout,        Set<Card>>>,
        private readonly byCardIdentity:  Partial<Record<symbol,        Set<Card>>>,
    ) {}

    searchName(query: string, exact = true): Set<Card> {
        const index = exact ? this.byCardTextExact : this.byCardTextFuzzy;
        const results = index.search(query, undefined, {index: "name", enrich: true});
        return new Set(results[0]?.result.map(v => v.doc) ?? []);
    }

    searchText(query: string, exact = true): Set<Card> {
        const index = exact ? this.byCardTextExact : this.byCardTextFuzzy;
        const results = index.search(query, undefined, {index: "faces[]:text", enrich: true});
        return new Set(results[0]?.result.map(v => v.doc) ?? []);
    }

    searchTypesCard(query: CardType): Set<Card> {
        return new Set(this.byCardType[query]?.values() ?? []);
    }

    searchTypesSuper(query: CardTypeSuper): Set<Card> {
        return new Set(this.byCardTypeSuper[query]?.values() ?? []);
    }

    searchTypesSub(query: string, exact: "full" | "exact" | "fuzzy" = "full"): Set<Card> {
        if(exact === "full") {
            return new Set(this.byCardTypeSub[query.toLowerCase()]?.values() ?? []);
        }

        const index = exact === "exact" ? this.byCardTextExact : this.byCardTextFuzzy;
        const results = index.search(query, undefined, {index: "faces[]:typesSub[]", enrich: true});
        return new Set(results[0]?.result.map(v => v.doc) ?? []);
    }

    searchIdentity(query: ColourIdentity, exact = true): Set<Card> {
        if(exact) return this.byCardIdentity[query.toSymbol()] ?? new Set();        
        const sets = [this.byCardIdentity[query.toSymbol()]];
        for(const variant of query.getHybrids()) sets.push(this.byCardIdentity[variant.toSymbol()]);
        return new Set(sets.flatMap(v => [...v?.values() ?? []]));
    }

    searchLayout(query: Layout): Set<Card> {
        return this.byCardLayout[query] ?? new Set();
    }

    get allTypesSub() {
        return Object.keys(this.byCardTypeSub);
    }

}   
