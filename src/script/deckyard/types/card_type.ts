
export enum CardType {
    Artifact     = "artifact",
    Creature     = "creature",
    Enchantment  = "enchantment",
    Instant      = "instant",
    Land         = "land",
    Lesson       = "lesson",
    Planeswalker = "planeswalker",
    Sorcery      = "sorcery",
    Tribal       = "tribal",
    Scheme       = "scheme",
    Plane        = "plane",
    Phenomenon   = "phenomenon",
    Conspiracy   = "conspiracy",
    Vanguard     = "vanguard",
    Dungeon      = "dungeon",
    Hero         = "hero",
}

const convertList: Record<string, string> = {
    "summon":  "creature",
    "crature": "creature",
};

export const CARD_TYPES_KNOWN = Object.values(CardType).filter((v): v is CardType => v[0] === v[0].toLowerCase());

export function isCardTypeKnown(v: string | CardType): v is CardType {
    return (CARD_TYPES_KNOWN as string[]).includes(v);
}

export function convertCardTypes(v: string): string {
    return convertList[v] ?? v;
}

export function verifyCardType(cardType: string): boolean {
    if (!isCardTypeKnown(cardType)) {
        console.warn("Unknown card type: " + cardType);
        return true; // Intentional
    } else {
        return true;
    }
}