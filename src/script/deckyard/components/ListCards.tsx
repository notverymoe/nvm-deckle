
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

export function ListCards({className, selected, setSelected}: {
    className?:  string,
    selected:    number,
    setSelected: (v: number, c: Card) => void,
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
        .map((v, j) => v ? <ListCardEntry key={i+j} idx={i+j} card={v}/> : <div key={i+j}/>
    ), offset, count, undefined, [cards]);

    // TODO move scroll & focus logic to a lower level...
    const scrollToSelection = useDeferredAction(
        (step) => {
            const newSelection = Math.min(cards.length-1, Math.max(0, selected + step));
            setSelected(newSelection, cards[newSelection]);
        }, 
        8
    );

    return <selectionContext.Provider value={{selected, setSelected}}>
        <VList 
            lines={1} 
            length={cards.length}
            offset={offset}
            setOffset={setOffset}
            setCount={setCount}
            setCountVis={setCountVis}
            setOffsetMax={setOffsetMax}
            className={joinClassNames("list-cards", hasFocus && "focused", !hasFocus && "unfocused", className)}
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

                    const step = tab ? (e.shiftKey ? -1 : 1) : (arrowUp ? -1 : 1);
                    if ((step < 0 && selected > 0) || (step > 0 && selected+1 < cards.length)) {
                        e.preventDefault();
                        scrollToSelection(step);
                    }
                },
            }}
            tabIndex={0}
        >{cardsShown}</VList>
    </selectionContext.Provider>;
}

export function ListCardEntry({qty, idx, card}: {qty?: number, card: Card, idx: number}) {
    const selection = React.useContext(selectionContext);

    // TODO prevent default on mouse down.... but not block focus?
    return <div 
        className={joinClassNames("card-entry", (selection?.selected === idx) && "selected")} 
        onClick={() => selection?.setSelected(idx, card)} 
        title={card.name}
    >
        {qty && <div className="card-qty" title={`x${qty}`}>{qty}</div>}
        <div className="card-type"><IconCardType card={card}/></div>
        <div className="card-name">{card.name}</div>
        <div className="card-cost"><IconManaCostSet costs={card.faces.map(v => v.manaCost)}/></div>
    </div>
}

