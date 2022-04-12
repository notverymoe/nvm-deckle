import { CardAtomic } from "mtgjson/card_atomic";
import { ManaSymbol, parseManaCost } from ".";
import { CardType, normalizeCardTypes } from "./card_type";

export interface CardFace {
    manaCost: ManaSymbol[],

    name: string,
    text: string,
    type: string,
    types: CardType[],

    power?:     string,
    toughness?: string,
    side:       string,
}

export function convertAtomicCardFace(card: CardAtomic): CardFace {
    return {
        manaCost: card.manaCost ? parseManaCost(card.manaCost) : [],

        name:  card.faceName ?? card.name,
        text:  card.text ?? "",
        type:  card.type ?? "",
        types: normalizeCardTypes(card.types),
        side:  card.side?.toUpperCase() ?? "A",

        power:    card.power,
        toughness: card.toughness,
    }
}