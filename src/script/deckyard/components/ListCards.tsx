
import "./ListCards.scss";

import * as React from "react";

import { useDeferredAction, useRangeVirtual } from "components/hooks";
import { VList                              } from "components/vlist";
import { isElementOrChildOf, joinClassNames } from "util/shared";
import { DatabaseContext } from "../state";
import { Card            } from "../types";
import { IconCardType    } from "./IconCardType";
import { IconManaCostSet } from "./IconManaSymbol";

const selectionContext = React.createContext<{selected: number, setSelected: (idx: number, card: Card) => void} | null>(null);;


export interface CardGroup {
    name: string,
    data: (CardGroupEntry | Card)[],
}

export interface CardGroupEntry {
    card: Card,
    qty:  number,
}

export function ListCardDatabase({selected, setSelected}: {
    selected:    number,
    setSelected: (v: number, c: Card) => void
}) {
    const [offset,    setOffsetRaw] = React.useState(0);
    const [offsetMax, setOffsetMax] = React.useState(0);
    const setOffset = (v: number) => setOffsetRaw(Math.max(0, Math.min(offsetMax, Math.trunc(v))));

    const [count,    setCount   ] = React.useState(0);
    const [countVis, setCountVis] = React.useState(0);
    React.useLayoutEffect(() => {
        // TODO we can limit this to animation frames, maybe?
        if (selected < offset) {
            setOffset(Math.max(0, selected));
        } else if (selected >= offset+countVis) {
            setOffset(Math.max(0, selected - countVis + 1));
        }
    }, [selected]);

    return <ListCardInner 
        selected={selected} 
        setSelected={setSelected} 
        count={count}
        offset={offset}
        setOffset={setOffset}
        setCount={setCount}
        setCountVis={setCountVis}
        setOffsetMax={setOffsetMax}
    />;
}

// TODO resize not triggering update of range virtual?
// TODO seperate deck and database...
// TODO deck efficiency (do we need a vlist?)

function ListCardInner({className, selected, setSelected, count, offset, setOffset, setCount, setCountVis, setOffsetMax}: {
    className?:  string,
    selected:    number,
    setSelected: (v: number, c: Card) => void,
    count: number,
    offset: number,
    setOffset:     (v: number) => void,
    setCount:      (v: number) => void,
    setCountVis?:  (v: number) => void,
    setOffsetMax?: (v: number) => void,
}) {
    const [hasFocus, setHasFocus] = React.useState(false);
    const cards = React.useContext(DatabaseContext)?.cards ?? [];

    const cardsShown = useRangeVirtual((i, length) => cards
        .slice(i, i+length)
        .map((v, j) => v ? <ListCardEntry key={i+j} card={v}/> : <div key={i+j}/>
    ), offset, count, undefined, [cards]);

    return <selectionContext.Provider value={{selected, setSelected}}>
        <VList 
            lines={1} 
            length={cards.length}
            offset={offset}
            setOffset={setOffset}
            setCount={setCount}
            setCountVis={setCountVis}
            setOffsetMax={setOffsetMax}
            className="list-cards"
            setHasFocus={setHasFocus}
            hasFocus={hasFocus}
            tabIndex={0}
            selectable
            selection={selected}
            setSelection={v => setSelected(v, cards[v])}
        >{cardsShown}</VList>
    </selectionContext.Provider>;
}

export function ListCardEntry({qty, card}: {qty?: number, card: Card}) {
    return <div className="card-entry" title={card.name}>
        {qty && <div className="card-qty" title={`x${qty}`}>{qty}</div>}
        <div className="card-type"><IconCardType card={card}/></div>
        <div className="card-name">{card.name}</div>
        <div className="card-cost"><IconManaCostSet costs={card.faces.map(v => v.manaCost)}/></div>
    </div>
}

export function ListCardGroup({name, toggle}: {name: string, collapsed: boolean, toggle: () => void}) {
    return <div className="card-group" onClick={toggle}>
        <div className="name">{name}</div>
    </div>;
}