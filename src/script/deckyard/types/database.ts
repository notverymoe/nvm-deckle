import { CardAtomic } from "mtgjson/card_atomic";
import { CardAtomicFile } from "mtgjson/files";
import { CardType, normalizeCardTypes } from "./card_type";
import { ManaSymbol, parseManaCost } from "./mana";

export interface CardDatabaseEntry {
    id: number,
    name: string,
    faces: Card[],
}

export interface CardDatabase {
    cards: CardDatabaseEntry[],
}

export type Card = Omit<CardAtomic, "manaCost" | "types"> & {
    manaCost: ManaSymbol[],
    types:    CardType[],
};

export function convertFromMTGJSONAtomicCards(db: CardAtomicFile): CardDatabase {
    return {
        cards: Object.entries(db.data).map(([name, faces], id) => ({id, name, faces: faces.map(convertAtomicCard)})),
    };
}


function convertAtomicCard(card: CardAtomic): Card {
    return {
        ...card,
        manaCost: card.manaCost ? parseManaCost(card.manaCost) : [],
        types:    normalizeCardTypes(card.types),
    }
}