import { CardAtomic } from "mtgjson/card_atomic";
import { ManaSymbol, parseManaCost } from ".";
import { convertCardTypes, verifyCardType } from "./card_type";
import { verifyCardTypeSuper } from "./card_type_super";

export interface CardFace {
    id: number,
    side: string,

    manaCost: ManaSymbol[],
    cmc:      number | null,

    name: string,
    text: string,

    type: string,
    typesCard:  string[],
    typesSuper: string[],
    typesSub:   string[],

    power:     string | null,
    toughness: string | null,
}

export function convertAtomicCardFace(id: number, card: CardAtomic): CardFace {
    return {
        id,
        side:  card.side?.toUpperCase() ?? "A",

        manaCost: card.manaCost ? parseManaCost(card.manaCost) : [],
        cmc:      card.faceManaValue ?? null,

        name: card.faceName ?? card.name,
        text: card.text ?? "",
        
        type: card.type,
        typesCard:  [...new Set(card.types.map(normalizeTypeIdentifier).map(convertCardTypes).filter(verifyCardType))],
        typesSuper: [...new Set(card.supertypes.map(normalizeTypeIdentifier).filter(verifyCardTypeSuper))],
        typesSub:   [...new Set(card.subtypes.map(normalizeTypeIdentifier))],

        power:     card.power     ?? null,
        toughness: card.toughness ?? null,
    }
}

export function normalizeTypeIdentifier(type: string) {
    return type.toLowerCase().replaceAll(/_/g, " ").trim();;
}