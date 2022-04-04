import { CardAtomic } from "mtgjson/card_atomic";
import { CardAtomicFile } from "mtgjson/files";
import { Layout, normalizeCardLayout } from "./card_layout";
import { CardType, normalizeCardTypes } from "./card_type";
import { ManaSymbol, parseManaCost } from "./mana";

export interface CardDatabaseEntry {
    id: number,
    name: string,
    faces: CardFace[],
    layout: Layout,
}

export interface Card {
    cards: CardDatabaseEntry[],
}

export type CardFace = Omit<CardAtomic, "manaCost" | "types" | "layout" | "side"> & {
    manaCost: ManaSymbol[],
    types:    CardType[],
};

export function convertFromMTGJSONAtomicCards(db: CardAtomicFile): Card {

    console.log([...(new Set(Object.entries(db.data).flatMap(v => v[1].map(v => v.side)))).values()])

    return {
        cards: Object.entries(db.data).map(([name, faces], id) => {
            faces = sortFaces(faces);
            return {
                id, 
                name, 
                layout: normalizeCardLayout(faces[0]?.layout ?? "normal"),
                faces: faces.map(convertAtomicCard)
            };
        }),
    };
}

function sortFaces(faces: CardAtomic[]): CardAtomic[] {
    function sideIndex(v: string | undefined | null) {
        switch(v) {
            case "a": return 0;
            case "b": return 1;
            case "c": return 2;
            case "d": return 3;
        }
        return 0;
    }
    const result: CardAtomic[] = [];
    for(const side of faces) result[sideIndex(side.side)] = side;
    return result;
}


function convertAtomicCard(card: CardAtomic): CardFace {
    return {
        ...card,
        manaCost: card.manaCost ? parseManaCost(card.manaCost) : [],
        types:    normalizeCardTypes(card.types),
    }
}