import * as Preact from "preact";

import IconCardTypeArtifact     from "assets/cards/card-type-artifact.svg";
import IconCardTypeCreature     from "assets/cards/card-type-creature.svg";
import IconCardTypeEnchantment  from "assets/cards/card-type-enchantment.svg";
import IconCardTypeInstant      from "assets/cards/card-type-instant.svg";
import IconCardTypeLand         from "assets/cards/card-type-land.svg";
import IconCardTypeLesson       from "assets/cards/card-type-lesson.svg";
import IconCardTypeMixed        from "assets/cards/card-type-mixed.svg";
import IconCardTypePlaneswalker from "assets/cards/card-type-planeswalker.svg";
import IconCardTypeSorcery      from "assets/cards/card-type-sorcery.svg";
import IconCardTypeUnknown      from "assets/cards/card-type-unknown.svg";
import { CardDatabaseEntry } from "deckyard/types";
import { CardType } from "deckyard/types/card_type";


const typeMap: Record<CardType, Preact.ComponentType<Preact.JSX.SVGAttributes> | null> = {
    [CardType.Artifact]:     IconCardTypeArtifact,
    [CardType.Creature]:     IconCardTypeCreature,
    [CardType.Enchantment]:  IconCardTypeEnchantment,
    [CardType.Instant]:      IconCardTypeInstant,
    [CardType.Land]:         IconCardTypeLand,
    [CardType.Lesson]:       IconCardTypeLesson,
    [CardType.Planeswalker]: IconCardTypePlaneswalker,
    [CardType.Sorcery]:      IconCardTypeSorcery,
    [CardType.Tribal]:       IconCardTypeMixed, // Technically tribal always has 3 types, so we don't care... but eh.
    [CardType.Scheme]:       null, // TODO icon?
    [CardType.Plane]:        null, // TODO icon?
    [CardType.Phenomenon]:   null, // TODO icon?
    [CardType.Conspiracy]:   null, // TODO icon?
    [CardType.Vanguard]:     null, // TODO icon?
    [CardType.Dungeon]:      null, // TODO icon?
    [CardType.Hero]:         null, // TODO icon?
    [CardType.Unknown]:      IconCardTypeUnknown, // TODO icon?
};

export function IconCardType({card}: {
    card: CardDatabaseEntry
}) {
    const types = new Set<CardType>(card.faces.flatMap(v => v.types)); // TODO memo
    
    let SVGIcon: Preact.ComponentType<Preact.JSX.SVGAttributes>;
    if (types.size === 1) {
        let cardType: CardType = types.keys().next()!.value;
        SVGIcon = typeMap[cardType] ?? (() => <></>);
        if (SVGIcon === undefined) console.warn("Unknown type: " + cardType);
    } else {
        SVGIcon = types.size > 1 ? IconCardTypeMixed : IconCardTypeUnknown; 
    }    
    return <SVGIcon
        onSelect={e => { e.preventDefault(); }}
    />; 
}