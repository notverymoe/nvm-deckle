export * from "./card";
export * from "./card_face";
export * from "./card_type";
export * from "./card_layout";
export * from "./database";
export * from "./mana";

import * as FlexSearch from "flexsearch";

import { CardAtomicFile } from "mtgjson/files";
import { Card, convertAtomicCard } from "./card";
import { Layout } from "./card_layout";
import { CardType } from "./card_type";
import { CardTypeSuper } from "./card_type_super";
import { CardDatabase } from "./database";

const DOCUMENT_OPTIONS = {
    charset: "latin:simple",
    language: "en",
    document: {
        store: true,
        id: "id",
        index: [
            "name",
            "faces[]:text",
            "faces[]:typesSub"
        ],
    }
};

export async function convertFromMTGJSONAtomicCards(db: CardAtomicFile, yieldFreq = 1000): Promise<CardDatabase> {    
    const byCardType:      Partial<Record<CardType,      Set<Card>>> = {};
    const byCardTypeSuper: Partial<Record<CardTypeSuper, Set<Card>>> = {};
    const byCardTypeSub:   Partial<Record<string,        Set<Card>>> = {};

    const byCardLayout:    Partial<Record<Layout, Set<Card>>> = {};
    const byCardIdentity:  Partial<Record<symbol, Set<Card>>> = {};

    const byCardTextExact: FlexSearch.Document<Card, true> = new FlexSearch.Document(
        DOCUMENT_OPTIONS
    );
    const byCardTextFuzzy: FlexSearch.Document<Card, true> = new FlexSearch.Document({
        ...DOCUMENT_OPTIONS,
        tokenize: "full",
    });

    const cards: Card[] = [];
    for(const [name, faces] of Object.entries(db.data)) {
        const card = convertAtomicCard(name, faces, cards.length);

        cards.push(card);

        for(const face of card.faces){
            for(const type of face.typesCard) {
                addToSet(byCardType, type, card);
            }
            for(const type of face.typesSuper) {
                addToSet(byCardTypeSuper, type, card);
            }
            for(const type of face.typesSub) {
                addToSet(byCardTypeSub, type.toLowerCase(), card);
            }
        }

        byCardTextFuzzy.add(card);
        byCardTextExact.add(card);
        addToSet(byCardIdentity, card.identity.toSymbol(), card);
        addToSet(byCardLayout,   card.layout,              card);

        if (cards.length % yieldFreq === 0) await new Promise(r => setTimeout(r)); // Cooperative-yielding
    }

    return new CardDatabase(
        cards,
        byCardTextExact,
        byCardTextFuzzy,
        byCardType,
        byCardTypeSuper,
        byCardTypeSub,
        byCardLayout,
        byCardIdentity
    );
}

function addToSet<K extends string | number | symbol, V>(m: Partial<Record<K, Set<V>>>, k: K, v: V) {
    (m[k] ?? (m[k] = new Set())).add(v);
}
