export * from "./card";
export * from "./card_face";
export * from "./card_type";
export * from "./card_layout";
export * from "./database";
export * from "./mana";

import { CardAtomicFile } from "mtgjson/files";
import { Card, convertAtomicCard } from "./card";
import { CardDatabase } from "./database";

export async function convertFromMTGJSONAtomicCards(db: CardAtomicFile): Promise<CardDatabase> {
    const cards: Card[] = [];

    for(const [name, faces] of Object.entries(db.data)) {
        cards.push(convertAtomicCard(name, faces, cards.length));
        // Cooperative-yielding
        if (cards.length % 100 === 0) await new Promise(r => setTimeout(r))
    }

    return new CardDatabase(cards);
}