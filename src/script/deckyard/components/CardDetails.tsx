import "./CardDetails.scss";

import * as React from "react";

import { CardFace, Card } from "deckyard/types";
import { ButtonGroup, Button } from "components/button";
import { Layout } from "deckyard/types/card_layout";
import { IconManaCost } from "./IconManaSymbol";
import { CardRulings } from "./CardRulings";

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
    // TODO disable rulings button
    const [selected, setSelected] = React.useState(0);
    const layout = layouts[card?.layout!] ?? card?.faces.map((_, i) => `Part ${i}`) ?? ["None"];
    React.useLayoutEffect(() => {
        setSelected(0);
    }, [card]);
    return card ?<div className="card-details">
        <div className="card-page">
            {selected >= 0 && <CardFaceDetails face={card.faces[selected]}/>}
            {selected <  0 && <CardRulings card={card}/>}
        </div>
        <div className="card-buttons">
            <ButtonGroup direction="vertical" className="card-face-buttons">
                {layout.map((v, i) => <Button key={i} text={v} action={() => setSelected(i)}/>)}
            </ButtonGroup>
            {card.rulings.length > 0 && <Button className="card-button-rulings" text={"Rulings"} action={() => setSelected(-1)}/>}
        </div>
    </div> : <></>;
}

function CardFaceDetails({face}: {
    face: CardFace,
}) {

    const text = React.useMemo(() => (face.text ?? "").split('\n').map((v,i) => <p key={i}>{v}</p>), [face.text ?? ""]);

    return <div className="face-details">
        <div className="row-0">
            <div className="name">{face.name}</div>
            <div className="cost"><IconManaCost cost={face.manaCost}/></div>
        </div>
        <div className="row-1">
            <div className="type">{face.type}</div>
            {face.power && <div className="stats">{face.power}/{face.toughness}</div>}
        </div>
        <div className="text">{text}</div>
    </div>;
}
