import "./CardDetails.scss";

import * as React from "react";

import { CardFace, Card } from "deckyard/types";
import { ButtonGroup, Button } from "components/button";
import { IconManaCost } from "./IconManaSymbol";
import { CardRulings } from "./CardRulings";

export function CardDetails({card} : {
    card?: Card
}) {
    // TODO disable rulings button
    const [selected, setSelected] = React.useState(0);
    React.useLayoutEffect(() => setSelected(0), [card]);
    return card ? <div className="card-details">
        <div className="card-page">
            {selected >= 0 && <CardFaceDetails face={card.faces[selected]}/>}
            {selected <  0 && <CardRulings card={card}/>}
        </div>
        <div className="card-buttons">
            <ButtonGroup direction="vertical" className="card-face-buttons">
                {card?.faces.map((v, i) => <Button 
                    key={i} 
                    text={`Part ${v.side}`} 
                    action={() => setSelected(i)}
                    selected={i === selected}
                />)}
            </ButtonGroup>
            <Button
                className="card-button-rulings"
                text={"Rulings"}
                action={() => setSelected(-1)} 
                disabled={!card.rulings.length}
                disabledTitle="No rulings for card"
                selected={selected === -1}
            />
        </div>
    </div> : <></>;
}

function CardFaceDetails({face}: {
    face?: CardFace,
}) {
    const text = React.useMemo(
        () => (face?.text ?? "").split('\n').map((v,i) => <p key={i}>{v}</p>), 
        [face?.text ?? ""]
    );
    return <div className="face-details">
        <div className="row-0">
            <div className="name">{face?.name ?? "Invalid face"}</div>
            <div className="cost"><IconManaCost cost={face?.manaCost ?? []}/></div>
        </div>
        <div className="row-1">
            <div className="type">{face?.type ?? "Invalid face"}</div>
            {face?.power && <div className="stats">{face.power}/{face.toughness}</div>}
        </div>
        <div className="text">{text}</div>
    </div>;
}
