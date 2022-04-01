import { CardAtomic } from "mtgjson/card_atomic";
import { CardAtomicFile } from "mtgjson/files";

export interface CardDatabaseEntry {
    id: number,
    name: string,
    faces: CardAtomic[],
}

export interface CardDatabase {
    cards: CardDatabaseEntry[],
}

export function convertFromMTGJSONAtomicCards(db: CardAtomicFile): CardDatabase {
    return {
        cards: Object.entries(db.data).map(([name, faces], id) => ({id, name, faces})),
    };
}