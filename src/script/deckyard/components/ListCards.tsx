
import "./ListCards.scss";

import * as React from "react";

import { useDeferredAction, useRangeVirtual } from "components/hooks";
import { VList } from "components/vlist";
import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import { fromRange, isElementOrChildOf, joinClassNames } from "util/shared";
import { CardDatabaseEntry } from "deckyard/types";
import { IconCardType } from "./IconCardType";
import { IconManaCostSet } from "./IconManaSymbol";

const selectionContext = createContext<{selected: number, setSelected: (idx: number) => void} | null>(null);;

export function ListCards({cards, selected, setSelected}: {
    selected:    number,
    setSelected: (v: number) => void,
    cards:       CardDatabaseEntry[],
}) {
    const [offset,    setOffsetRaw] = useState(0);
    const [offsetMax, setOffsetMax] = useState(0);
    const setOffset = (v: number) => setOffsetRaw(Math.max(0, Math.min(offsetMax, Math.trunc(v))));

    const [count,    setCount   ] = useState(0);
    const [countVis, setCountVis] = useState(0);

    useLayoutEffect(() => {
        // TODO we can limit this to animation frames, maybe?
        if (selected < offset) {
            setOffset(Math.max(0, selected));
        } else if (selected >= offset+countVis) {
            setOffset(Math.max(0, selected - countVis + 1));
        }
    }, [selected]);

    return <ListCardInner 
        cards={cards} 
        selected={selected} 
        setSelected={setSelected} 
        count={count}
        offset={offset}
        setOffset={setOffset}
        setCount={setCount}
        setCountVis={setCountVis}
        setOffsetMax={setOffsetMax}
    />;;
}

function ListCardInner({cards, selected, setSelected, count, offset, setOffset, setCount, setCountVis, setOffsetMax}: {
    selected:    number,
    setSelected: (v: number) => void,
    cards:       CardDatabaseEntry[],
    count: number,
    offset: number,
    setOffset:     (v: number) => void,
    setCount:      (v: number) => void,
    setCountVis?:  (v: number) => void,
    setOffsetMax?: (v: number) => void,
}) {
    const [hasFocus, setHasFocus] = useState(false);

    const cardsShown = useRangeVirtual((i, length) => cards.slice(i, i+length).map((v, j) => v
        ? <ListCardEntry key={i+j} card={v}/>
        : <div key={i+j}/>
    ), offset, count, undefined, [cards]);


    const scrollToSelection = useDeferredAction((direction: number) => {
        setSelected(Math.min(cards.length-1, Math.max(0, selected + direction)));
    }, 8);

    return <selectionContext.Provider value={{selected, setSelected}}>
        <VList 
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
                    scrollToSelection(tab ? (e.shiftKey ? -1 : 1) : (arrowUp ? -1 : 1));
                },
            }}
            tabIndex={0}
        >{cardsShown}</VList>
    </selectionContext.Provider>;
}

export function ListCardEntry({card}: {card: CardDatabaseEntry}) {
    const selection = useContext(selectionContext);

    return <div 
        className={joinClassNames("card-entry", (selection?.selected === card.id) && "selected")} 
        onClick={() => selection?.setSelected(card.id)} 
        title={card.name}
    >
        <div className="card-type"><IconCardType card={card}/></div>
        <div className="card-name">{card.name}</div>
        <div className="card-cost"><IconManaCostSet costs={card.faces.map(v => v.manaCost)}/></div>
    </div>
}

