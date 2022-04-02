
import "./ListCards.scss";

import * as React from "react";

import { useRangeVirtual } from "components/hooks";
import { VList } from "components/vlist";
import { useEffect, useLayoutEffect, useState } from "react";
import { fromRange, isElementOrChildOf, joinClassNames } from "util/shared";
import { CardDatabaseEntry } from "deckyard/types";
import { IconCardType } from "./IconCardType";
import { IconManaCost, IconManaSymbol } from "./IconManaSymbol";

export function ListCards({cards, selected, setSelected}: {
    selected:    number,
    setSelected: (v: number) => void,
    cards:       CardDatabaseEntry[],
}) {

    const [hasFocus, setHasFocus] = useState(false);

    const [offset, setOffsetRaw] = useState(0);
    const [offsetMax, setOffsetMax] = useState(0);
    const setOffset = (v: number) => setOffsetRaw(Math.max(0, Math.min(offsetMax, Math.trunc(v))));

    const [count,    setCount   ] = useState(0);
    const [countVis, setCountVis] = useState(0);

    const cardsShown = useRangeVirtual<CardDatabaseEntry | undefined>((i, length) => fromRange(i, length, j => cards[j]), offset, count);

    useLayoutEffect(() => {
        if (selected < offset) {
            setOffset(Math.max(0, selected));
        } else if (selected >= offset+countVis) {
            setOffset(Math.max(0, selected - countVis + 1));
        }
    }, [selected]);

    return <VList 
        lines={1} 
        length={cards.length}
        offset={offset}
        setOffset={setOffset}
        setCount={setCount}
        setCountVis={setCountVis}
        setOffsetMax={setOffsetMax}
        className={joinClassNames("list-cards", hasFocus && "focused", !hasFocus && "unfocused")}
        eventsContent={{
            onFocus: () => setHasFocus(true),
            onBlur:  e => {
                if (!isElementOrChildOf(e.relatedTarget as HTMLElement, e.currentTarget)) {
                    setHasFocus(false);
                }
            },
            onKeyDown: e => {
                const arrowDown = e.code === "ArrowDown";
                const arrowUp   = e.code === "ArrowUp";
                const tab       = e.code === "Tab";

                if (!arrowDown && !arrowUp && !tab) return;
                e.preventDefault();  
                const next = selected + (tab
                    ? (e.shiftKey ? -1 :  1)
                    : ( arrowDown ?  1 : -1));
                setSelected(Math.min(cards.length-1, Math.max(0, next)));
            },
        }}
        tabIndex={0}
    >{cardsShown.map((v, i) => v
        ? <ListCardEntry 
            key={i} 
            card={v} 
            selected={offset+i === selected}
            setSelected={() => setSelected(offset+i)}
        />
        : <div/>
    )}</VList>;
}

export function ListCardEntry({card, selected, setSelected}: {
    card: CardDatabaseEntry,
    setSelected: () => void,
    selected: boolean,
}) {
    useEffect(() => {
        if (!selected) return;
        console.log(card);
    }, [card]);

    return <div 
        className={joinClassNames("card-entry", selected && "selected")} 
        onClick={setSelected} 
    >
        <div className="card-type"><IconCardType card={card}/></div>
        <div className="card-name">{card.name}</div>
        <div className="card-cost"><IconManaCost cost={card.faces[0].manaCost}/></div>
    </div>
}

