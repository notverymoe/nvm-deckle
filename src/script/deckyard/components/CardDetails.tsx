import "./CardDetails.scss";

import * as React from "react";

import { CardFace, Card } from "deckyard/types";
import { ButtonGroup, Button } from "components/button";
import { IconManaCost } from "./IconManaSymbol";
import { CardRulings } from "./CardRulings";


export function CardFaceButtons({card, selectedFace, setSelectedFace}: {
    card?: Card,
    selectedFace: number,
    setSelectedFace: (v: number) => void,
}) {
    return <div className="card-face-details-buttons">
        <ButtonGroup direction="vertical" className="card-face-buttons">
            {card?.faces.map((v, i) => <Button 
                key={i} 
                text={`Part ${v.side}`} 
                action={() => setSelectedFace(i)}
                selected={i === selectedFace}
            />)}
        </ButtonGroup>
        <Button
            className="card-button-rulings"
            text={"Rulings"}
            action={() => setSelectedFace(-1)} 
            disabled={!card?.rulings.length}
            disabledTitle="No rulings for card"
            selected={selectedFace === -1}
        />
        <Button
            className="card-button-image"
            text={"Image"}
            action={() => setSelectedFace(-2)} 
            selected={selectedFace === -2}
        />
    </div>;
}

export function CardFaceDetails({face}: {
    face?: CardFace,
}) {
    const text = React.useMemo(
        () => (face?.text ?? "").split('\n').map((v,i) => <p key={i}>{v}</p>), 
        [face?.text ?? ""]
    );

    return <div className="card-face-details">
        <div className="row-0">
            <div className="name">{face?.name ?? ""}</div>
            <div className="cost"><IconManaCost cost={face?.manaCost ?? []}/></div>
        </div>
        <div className="row-1">
            <div className="type">{face?.type ?? ""}</div>
            {face?.power && <div className="stats">{face.power}/{face.toughness}</div>}
        </div>
        <div className="text">{text}</div>
    </div>;
}
