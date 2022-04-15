
export enum CardTypeSuper {
    Basic     = "Basic",
    Legendary = "Legendary",
    Ongoing   = "Ongoing",
    Snow      = "Snow",
    World     = "World",
    Elite     = "Elite",
    Host      = "Host",
    Unknown   = "?Unknown?",
}

export function normalizeCardSuperTypes(cardTypes: string[]): CardTypeSuper[] {
    return [...new Set(cardTypes.map(normalizeCardSuperType).filter((v): v is CardTypeSuper => !!v)).values()];
}

export function normalizeCardSuperType(cardType: string): CardTypeSuper | null {
    cardType = cardType.trim();
    cardType = cardType.charAt(0).toUpperCase() + cardType.slice(1);

    switch(cardType) {
        case CardTypeSuper.Basic:     
        case CardTypeSuper.Legendary:     
        case CardTypeSuper.Ongoing:  
        case CardTypeSuper.Snow:      
        case CardTypeSuper.World:         
        case CardTypeSuper.Elite:       
        case CardTypeSuper.Host:
            return cardType;
    }

    console.warn("Unknown card super type: " + cardType);
    return CardTypeSuper.Unknown;
}