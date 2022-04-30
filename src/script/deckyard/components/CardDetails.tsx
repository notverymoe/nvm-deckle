import "./CardDetails.scss";

import * as React from "react";

import { CardFace, Card } from "deckyard/types";
import { IconManaCost } from "./IconManaSymbol";
import { Select } from "components/select";
import { CardImage } from "./CardImage";
import { CardRulings } from "./CardRulings";
import { useTrigger } from "components/hooks";

function useCardSelectionIndex(card: Card | null | undefined) {
    const [, trigger] = useTrigger();
    const data = React.useRef({ card, index: 0 });
    if(data.current.card !== card && data.current.index > 0) {
        data.current.index = 0;
    }
    data.current.card  = card;

    const setState = React.useCallback((v: number) => {
        if (data.current.index === v) return;
        data.current.index = v;
        trigger();
    }, []);

    return [data.current.index, setState] as const;
}

export function CardFaceDetails({card}: {
    card?: Card | null,
}) {
    const [faceIdx, setFaceIdx] = useCardSelectionIndex(card);
    const face = card?.faces[faceIdx];

    return <div className="card-details">
        <div className="row-0">
            <Select 
                className="name select"
                title={face?.name}
                value={faceIdx}
                setValue={setFaceIdx}
                Overlay={({value}) => {
                    if (value === -2) return <div className="name">Image</div>;
                    if (value === -1) return <div className="name">Rulings</div>;

                    const face = card?.faces[value];
                    if (!face) return <></>;

                    return <>
                        <div className="name">{face.name ?? ""}</div>
                        <div className="cost"><IconManaCost cost={face?.manaCost ?? []}/></div>
                    </>;
                }}
            >
                {card && <>
                    <option value={-2}>Images</option>
                    <option value={-1}>Rulings</option>
                    <optgroup label="Faces">
                        {card.faces.map((v, i) => <option key={i} value={i}>{v.name}</option>)}
                    </optgroup>
                </>}
            </Select>
        </div>
        {face && <CardText face={face}/>}
        {faceIdx === -2 && <CardImage   key={card?.id} card={card}/>}
        {faceIdx === -1 && <CardRulings key={card?.id} card={card}/>}
    </div>;
}

function CardText({face}: {face: CardFace}) {

    // TODO format symbols
    const text = React.useMemo(
        () => (face?.text ?? "").split('\n').map((v,i) => <p key={i}>{v}</p>), 
        [face?.text ?? ""]
    );

    return <>
        <div className="row-1">
            <div className="type">{face?.type ?? ""}</div>
            {face?.power && <div className="stats">{face.power}/{face.toughness}</div>}
        </div>
        <div className="text">{text}</div>
    </>;
}