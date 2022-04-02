
export enum CardType {
    Artifact     = "Artifact",
    Creature     = "Creature",
    Enchantment  = "Enchantment",
    Instant      = "Instant",
    Land         = "Land",
    Lesson       = "Lesson",
    Planeswalker = "Planeswalker",
    Sorcery      = "Sorcery",
    Tribal       = "Tribal",
    Scheme       = "Scheme",
    Plane        = "Plane",
    Phenomenon   = "Phenomenon",
    Conspiracy   = "Conspiracy",
    Vanguard     = "Vanguard",
    Dungeon      = "Dungeon",
    Hero         = "Hero",
    Unknown      = "?Unknown?",
}

const ignoreList = [
    "Jaguar",   
    "Dragon", 
    "Goblin", 
    "Knights",
    "Wolf",    
    "Elemental",
    "Specter",    
    "Scariest",  
    "You\u2019ll",
    "You`ll",
    "You'll",
    "Ever",
    "See",
];

const convertList: Record<string, string> = {
    "Summon":     "Creature",
    "Eaturecray": "Creature",
};

export function normalizeCardTypes(cardTypes: string[]): CardType[] {
    return [...new Set(cardTypes.map(normalizeCardType).filter((v): v is CardType => !!v)).values()];
}

export function normalizeCardType(cardType: string): CardType | null {
    cardType = cardType.trim();
    cardType = cardType.charAt(0).toUpperCase() + cardType.slice(1);
    cardType = convertList[cardType] ?? cardType;

    if(ignoreList.includes(cardType)) {
        return null;
    }

    switch(cardType) {
        case CardType.Artifact:     
        case CardType.Creature:     
        case CardType.Enchantment:  
        case CardType.Instant:      
        case CardType.Land:         
        case CardType.Lesson:       
        case CardType.Planeswalker: 
        case CardType.Sorcery:      
        case CardType.Tribal:       
        case CardType.Scheme:       
        case CardType.Plane:        
        case CardType.Phenomenon:   
        case CardType.Conspiracy:   
        case CardType.Vanguard:     
        case CardType.Dungeon:      
        case CardType.Hero:
            return cardType;
    }

    console.warn("Unknown card type: " + cardType);
    return CardType.Unknown;
}