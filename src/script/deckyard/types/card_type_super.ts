
export enum CardTypeSuper {
    Basic     = "basic",
    Legendary = "legendary",
    Ongoing   = "ongoing",
    Snow      = "snow",
    World     = "world",
    Elite     = "elite",
    Host      = "host",
}

export const CARD_TYPES_SUPER = Object.values(CardTypeSuper).filter((v): v is CardTypeSuper => v[0] === v[0].toLowerCase());

export function isCardTypeSuperKnown(v: string | CardTypeSuper): v is CardTypeSuper {
    return (CARD_TYPES_SUPER as string[]).includes(v);
}

export function verifyCardTypeSuper(cardType: string): boolean {
    if (!isCardTypeSuperKnown(cardType)) {
        console.warn("Unknown card type super: " + cardType);
        return true; // Intentional
    } else {
        return true;
    }
}