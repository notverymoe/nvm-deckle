import { Identifiers, PurchaseUrls } from "./shared";

export interface CardAtomic {
    asciiName?: string,
    colorIdentity: string[],
    colorIndicator?: string[],
    colors: string[],
    edhrecRank?: number,
    faceManaValue?: number,
    faceName?: string,
    foreignData: ForiegnData[],
    hand?: string,
    hasAlternativeDeckLimit?: boolean,
    identifiers: Identifiers,
    isFunny?: boolean,
    isReserved?: boolean,
    keywords?: string[],
    layout: string,
    leadershipSkills?: LeadershipSkills,
    legalities: Legalities,
    life?: string,
    loyalty?: string,
    manaCost?: string,
    manaValue: number,
    name: string,
    power?: string,
    printings?: string[],
    purchaseUrls: PurchaseUrls,
    rulings: Ruling[],
    side?: string,
    subtypes: string[],
    supertypes: string[],
    text?: string,
    toughness?: string,
    type: string,
    types: string[],
}

export interface ForiegnData {
    faceName?: string,
    flavorText?: string,
    language: string,
    multiverseId: number,
    name: string,
    text?: string,
    type: string,
}

export interface LeadershipSkills {
    brawl?:       boolean,
    commander?:   boolean,
    oathbreaker?: boolean,
}

export interface Legalities {
    brawl?: string,
    commander?: string,
    duel?: string,
    future?: string,
    frontier?: string,
    gladiator?: string,
    historic?: string,
    historicBrawl?: string,
    legacy?: string,
    modern?: string,
    oldschool?: string,
    pauper?: string,
    paupercommander?: string,
    penny?: string,
    pioneer?: string,
    premodern?: string,
    standard?: string,
    vintage?: string,
}

export interface Ruling {
    date?: string,
    text?: string,
}