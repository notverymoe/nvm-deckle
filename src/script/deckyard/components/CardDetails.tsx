import "./CardDetails.scss";

import * as React from "react";

import { CardFace, Card } from "deckyard/types/database";
import { ButtonGroup, Button } from "components/button";
import { Layout } from "deckyard/types/card_layout";
import { IconManaCost } from "./IconManaSymbol";
import { useMemoAsync } from "components/hooks";
import { joinClassNames } from "util/shared";
import { CardImage } from "./CardImage";

const layouts: Partial<Record<Layout, string[]>> = {
    [Layout.Normal    ]: ["Front"               ],
    [Layout.Transform ]: ["Front", "Transformed"],
    [Layout.Augment   ]: ["Front"],
    [Layout.Saga      ]: ["I", "II", "III", "IV", "V"],
    [Layout.Adventure ]: ["Front", "Adventure"],
    [Layout.Aftermath ]: ["Front", "Aftermath"],
    [Layout.Class     ]: ["Level 1", "Level 2", "Level 3"],
    [Layout.Flip      ]: ["Front", "Flipped"],
    [Layout.Leveler   ]: ["Rank 1",  "Rank 2",  "Rank 3"],
    [Layout.Planar    ]: ["Front"],
    [Layout.Host      ]: ["Front"],
    [Layout.Scheme    ]: ["Front"],
    [Layout.Meld      ]: ["Front", "Top", "Bottom"],
    [Layout.ModalDFC  ]: ["Side A", "Side B"],
    [Layout.Vanguard  ]: ["Front"],
    [Layout.Split     ]: ["Left", "Right"],
    [Layout.Reversible]: ["Side A", "Side B"],
};


export function CardDetails({card} : {
    card?: Card
}) {
    const [selected, setSelected] = React.useState(0);
    const layout = layouts[card?.layout!] ?? card?.faces.map((_, i) => `Part ${i}`) ?? ["None"];
    return card ?<div className="card-details">
        <CardFaceDetails face={card.faces[selected]}/>
        <ButtonGroup direction="horizontal" className="card-face-buttons">
            {layout.map((v, i) => <Button text={v} action={() => setSelected(i)}/>)}
        </ButtonGroup>
    </div> : <></>;
}

function CardFaceDetails({face}: {
    face: CardFace,
}) {
    const [showRulings, setShowRulings] = React.useState(false);
    return <div className="face-details">
        <div className="row-0">
            <div className="name">{face.name}</div>
            <div className="cost"><IconManaCost cost={face.manaCost}/></div>
        </div>
        <div className="row-1">
            <div className="type">{face.type}</div>
            {face.power && <div className="stats">{face.power}/{face.toughness}</div>}
        </div>
        <Button action={() => setShowRulings(!showRulings)} text={showRulings ? "Show Text" : "Show Rulings"}/>
        <div 
            className={joinClassNames("face-content", !showRulings && "text", showRulings && "rulings")}
        >{showRulings
            ? <div  className="face-details">{face.rulings.map(v => <>
                <div>{v.date}</div>
                <div>{v.text}</div>
            </>)}</div> 
            : face.text ?? ""
        }</div>
    </div>;
}
