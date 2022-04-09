import "./CardRulings.scss";

import * as React from "react";

import { Card } from "deckyard/types";

export function CardRulings({card}: {card?: Card}) {
    return <div className="card-rulings">{card?.rulings.length
        ? card.rulings.flatMap((v, i) => [
            <div key={i*2  } className="date">{v.date}</div>,
            <div key={i*2+1} className="text">{v.text}</div>
        ]) 
        : <div>No rulings availiable</div>
    }</div>
}