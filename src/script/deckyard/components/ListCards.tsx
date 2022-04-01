
import "./ListCards.scss";

import * as Preact from "preact";

import { useRangeVirtual } from "components/hooks";
import { VList } from "components/vlist";
import { useEffect, useState } from "preact/hooks";
import { fromRange, isElementOrChildOf, joinClassNames } from "util/shared";
import { CardDatabaseEntry } from "deckyard/types";

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

    useEffect(() => {
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
        class={joinClassNames("list-cards", hasFocus && "focused", !hasFocus && "unfocused")}
        events={{
            onKeyDown: (e) => {
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                    e.preventDefault();  
                    const next = selected + (e.key === "ArrowDown" ? 1 : -1);
                    setSelected(Math.min(cards.length-1, Math.max(0, next)));
                }
            },
            onFocus: () => setHasFocus(true),
            onBlur:  (e) => {
                if (!isElementOrChildOf(e.relatedTarget as HTMLElement, e.currentTarget)) {
                    setHasFocus(false);
                }
            },
        }}
        tabIndex={0}
    >{cardsShown.map((v, i) => v
        ? <ListCardEntry 
            key={i} 
            card={v} 
            selected={v.id === selected}
            setSelected={() => setSelected(v.id)}
        />
        : <div/>
    )}</VList>;
}

export function ListCardEntry({card, selected, setSelected}: {
    card: CardDatabaseEntry,
    setSelected: () => void,
    selected: boolean,
}) {
    return <div 
        className={joinClassNames("card-entry", selected && "selected")} 
        onClick={setSelected} 
    >{card.name}</div>
}

