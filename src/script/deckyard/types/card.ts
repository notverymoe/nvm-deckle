import { CardAtomic } from "mtgjson/card_atomic";
import { CardFace, convertAtomicCardFace } from "./card_face";
import { Layout, normalizeCardLayout } from "./card_layout";
export interface Card {
    id:      number,
    name:    string,
    faces:   CardFace[],
    layout:  Layout,
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