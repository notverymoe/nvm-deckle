import { ManaSymbol } from ".";
import { CardType } from "./card_type";

export interface CardFace {
    manaCost: ManaSymbol[],

    name: string,
    text: string,
    type: string,
    types: CardType[],

    power?:     string,
    toughness?: string,
}