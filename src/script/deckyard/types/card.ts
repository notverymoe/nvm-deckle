import { CardAtomic } from "mtgjson/card_atomic";
import { CardFace } from "./card_face";
import { Layout, normalizeCardLayout } from "./card_layout";
import { normalizeCardTypes } from "./card_type";
import { parseManaCost } from "./mana";

export interface Card {
    id:    number,
    name:  string,
    faces: CardFace[],
    layout: Layout,
    rulings: Ruling[],
}

export interface Ruling {
    date: string,
    text: string,
}

export function convertAtomicCard(name: string, faces: CardAtomic[], id: number): Card {
    const rulings: Ruling[] = [];
    for(const {date, text} of (faces[0].rulings ?? [])) {
        if (!text || !date) continue;
        rulings.push({date, text});
    }
    return {
        id, 
        name, 
        layout: normalizeCardLayout(faces[0]?.layout ?? "normal"),
        faces: faces.map(convertAtomicCardFace),
        rulings,
    };
}

function convertAtomicCardFace(card: CardAtomic): CardFace {
    return {
        manaCost: card.manaCost ? parseManaCost(card.manaCost) : [],

        name:  card.faceName ?? card.name,
        text:  card.text ?? "",
        type:  card.type ?? "",
        types: normalizeCardTypes(card.types),

        power:    card.power,
        toughness: card.toughness,
    }
}