import "./CardRulings.scss";

import * as React from "react";

import { Card } from "deckyard/types";

export function CardRulings({card}: {card?: Card}) {
    return <div  className="card-rulings">{card?.faces[0] 
        ? card?.faces[0].rulings.map(v => <>
            <div className="date">{v.date}</div>
            <div className="text">{v.text}</div>
        </>) 
        : <div>No rulings availiable</div>
    }</div>
}