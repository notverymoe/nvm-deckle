import "./CardDetails.scss";

import * as React from "react";

import { CardFace, Card } from "deckyard/types";
import { ButtonGroup, Button } from "components/button";
import { IconManaCost } from "./IconManaSymbol";

export enum DetailMode {
    Text,
    Rulings,
    Image,
}

export function CardFaceButtons({card, mode, setMode, face, setFace}: {
    card?: Card,
    mode: DetailMode,
    setMode: (v: DetailMode) => void,
    face: number,
    setFace: (v: number) => void,
}) {
    return <div className="card-face-details-buttons">
        <ButtonGroup direction="vertical" className="card-face-buttons">
            {card?.faces.map((v, i) => <Button 
                key={i} 
                text={`Part ${v.side}`} 
                action={() => {
                    setFace(i);
                    setMode(DetailMode.Text);
                }}
                selected={mode === DetailMode.Text && i === face}
            />)}
        </ButtonGroup>
        <Button
            className="card-button-rulings"
            text={"Rulings"}
            action={() => setMode(DetailMode.Rulings)} 
            selected={mode === DetailMode.Rulings}
        />
        <Button
            className="card-button-image"
            text={"Image"}
            action={() => setMode(DetailMode.Image)} 
            selected={mode === DetailMode.Image}
        />
    </div>;
}

export function CardFaceDetails({face}: {
    face?: CardFace,
}) {
    // TODO format symbols
    const text = React.useMemo(
        () => (face?.text ?? "").split('\n').map((v,i) => <p key={i}>{v}</p>), 
        [face?.text ?? ""]
    );

    return <div className="card-face-details">
        {face && <div className="row-0">
            <div className="name">{face?.name ?? ""}</div>
            <div className="cost"><IconManaCost cost={face?.manaCost ?? []}/></div>
        </div>}
        {face && <div className="row-1">
            <div className="type">{face?.type ?? ""}</div>
            {face?.power && <div className="stats">{face.power}/{face.toughness}</div>}
        </div>}
        {face && <div className="text">{text}</div>}
    </div>;
}
