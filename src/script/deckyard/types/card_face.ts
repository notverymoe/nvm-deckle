import { CardAtomic } from "mtgjson/card_atomic";
import { ManaSymbol, parseManaCost } from ".";
import { CardType, normalizeCardTypes } from "./card_type";
import { CardTypeSuper, normalizeCardSuperTypes } from "./card_type_super";

export interface CardFace {
    id: number,
    side: string,

    manaCost: ManaSymbol[],
    cmc:      number | null,

    name: string,
    text: string,

    type: string,
    typesCard:  CardType[],
    typesSuper: CardTypeSuper[],
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
        typesCard:  normalizeCardTypes(card.types),
        typesSuper: normalizeCardSuperTypes(card.supertypes),
        typesSub:   [...card.subtypes],

        power:     card.power     ?? null,
        toughness: card.toughness ?? null,
    }
}