import { CardAtomic } from "mtgjson/card_atomic";
import { CardFace, convertAtomicCardFace } from "./card_face";
import { normalizeCardLayout } from "./card_layout";
import { ColourIdentity } from "./colour_identity";

export interface Card {
    id:       number,
    name:     string,
    faces:    CardFace[],
    layout:   string,
    rulings:  Ruling[],
    identity: ColourIdentity,
}

export interface Ruling {
    date: string,
    text: string,
}

export function convertAtomicCard(name: string, faces: CardAtomic[], id: number): Card | null {
    if (faces.findIndex(v => isFunny(v)) >= 0) {
        return null;
    }

    const identity = ColourIdentity.tryParse(faces.flatMap(v => v.colorIdentity));
    if (!identity) {
        console.error("Failed to create identity: " + name);
        return null;
    }

    const rulings: Ruling[] = [];
    for(const {date, text} of (faces[0].rulings ?? [])) {
        if (!text || !date) continue;
        rulings.push({date, text});
    }

    return {
        id, 
        name, 
        layout: normalizeCardLayout(faces[0]?.layout ?? "normal"),
        faces: faces.map(f => convertAtomicCardFace(id, f)),
        identity,
        rulings,
    };
}

const funnySets = [
    "UNH", // un-sets
    "UST", // un-sets
    "UGL", // un-sets
    "UNF", // un-sets TODO UNF may have some "legal" cards... hmm...

    "CMB1", // play test
    "CMB2", // play test

    "PAST", // fake cards
    "PMIC", // fake cards
];

function isFunny(face: CardAtomic) {
    return face.isFunny || (face.printings && !face.printings.find(v => !funnySets.includes(v)));
}
