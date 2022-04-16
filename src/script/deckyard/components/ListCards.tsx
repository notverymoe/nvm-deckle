
import "./ListCards.scss";

import * as React from "react";

import { useRangeVirtual, useTrigger } from "components/hooks";
import { VList           } from "components/vlist";
import { DatabaseContext } from "../state";
import { Card            } from "../types";
import { IconCardType    } from "./IconCardType";
import { IconManaCostSet } from "./IconManaSymbol";

const selectionContext = React.createContext<{selected: number, setSelected: (idx: number, card: Card) => void} | null>(null);;

export interface CardGroup<T> {
    name: string,
    contents: T[],
}

export interface CardListRaw {
    hasMetadata?: false,
    groups: CardGroup<Card>[],
}

export interface CardWithMetadata {
    qty: number,
    card: Card,
}

export interface CardListMetadata {
    hasMetadata: true,
    groups: CardGroup<CardWithMetadata>[];
}

export function useCollapseTracker(cards: CardListRaw | CardListMetadata, defaultState: boolean = false) {

    const [collapseTrigger, fireCollapseTrigger] = useTrigger();
    const [   resetTrigger, fireResetTrigger   ] = useTrigger();

    const defaultChanged = React.useRef(0);
    const defaultStateRef = React.useRef(defaultState);
    defaultStateRef.current = defaultState;

    const collapsed = React.useMemo<boolean[]>(() => {
        defaultChanged.current += 1;   
        return [];
    }, [cards, resetTrigger, defaultState]);
    const setCollapsed = React.useCallback((v: number, state: boolean) => { 
        if ((collapsed[v] ?? defaultStateRef.current) != state) {
            collapsed[v] = state; 
            fireCollapseTrigger();
        }
    }, [collapsed]);
    const getCollapsed = React.useCallback(
        (v: number) => collapsed[v] ?? defaultStateRef.current, 
        [collapsed]
    );

    return  [
        collapseTrigger+resetTrigger+defaultChanged.current, 
        getCollapsed, 
        setCollapsed, 
        fireResetTrigger
    ] as const;
}

export function ListCardDatabase({selected, setSelected}: {
    selected:    number,
    setSelected: (v: number, c: Card | null) => void,
}) {

    const db = React.useContext(DatabaseContext);

    const cards = React.useMemo<CardListRaw>(() => ({
        groups: db 
        ? [{name: "Database",   contents: db.cards}] 
        : [{name: "Loading...", contents: []      }]
    }), [db?.cards]);


    const [collapseTrigger, getCollapsed, setCollapsed] = useCollapseTracker(cards, false);

    return <ListCard
        cards={cards}
        selected={selected} 
        setSelected={setSelected}
        collapseTrigger={collapseTrigger}
        setCollapsed={setCollapsed}
        getCollapsed={getCollapsed}
    />;
}

function ListCard({selected, setSelected, cards, getCollapsed, setCollapsed, collapseTrigger}: {
    selected:    number,
    setSelected: (v: number, c: Card | null) => void,
    cards: CardListRaw | CardListMetadata,

    getCollapsed: (v: number) => boolean,
    setCollapsed: (v: number, state: boolean) => void,
    collapseTrigger: number,
}) {
    const [count,     setCount    ] = React.useState(0);
    const [offset,    setOffsetRaw] = React.useState(0);
    const [offsetMax, setOffsetMax] = React.useState(0);
    const setOffset = (v: number) => setOffsetRaw(Math.max(0, Math.min(offsetMax, Math.trunc(v))));

    const [hasFocus, setHasFocus] = React.useState(false);

    const maxLength = (cards.groups as CardGroup<any>[]).reduce<number>((p, v, i) => {
        return p + (getCollapsed(i) ? 1 : v.contents.length + 1);
    }, 0);

    const cardsShown = useRangeVirtual(
        (i, length) => {
            // TODO this is horrid
            let offset = 0;
            const startGroup = cards.groups.findIndex((v, j) => {
                let length = getCollapsed(j) ? 1 : (v.contents.length + 1);
                if (offset + length >= i) return true;
                offset += length;
            });

            let skip = i - offset;
            let result: JSX.Element[] = [];
            for(let j = startGroup; j < cards.groups.length && result.length < length; j++) {
                if (skip === 0) {
                    result.push(<ListCardGroup
                        key={i + result.length}
                        name={cards.groups[j].name}
                        collapsed={getCollapsed(j)}
                        toggle={() => setCollapsed(j, !getCollapsed(j))}
                    />);
                } else {
                    skip -= 1;
                }

                if (!getCollapsed(j)) {;
                    if (cards.hasMetadata) {
                        const contents = cards.groups[j].contents;
                        for(let k = skip; k < contents.length && result.length < length; k++) {
                            result.push(<ListCardEntry
                                key={i + result.length}
                                qty ={contents[k].qty }
                                card={contents[k].card}
                            />);
                        }
                    } else {
                        const contents = cards.groups[j].contents;
                        for(let k = skip; k < contents.length && result.length < length; k++) {
                            result.push(<ListCardEntry
                                key={i + result.length}
                                card={contents[k]}
                            />);
                        }
                    }
                }
                skip = 0;
            }
            return result;
        }, 
        offset, 
        count, 
        undefined, 
        [collapseTrigger, cards]
    );

    return <selectionContext.Provider value={{selected, setSelected}}>
        <VList 
            lines={1} 
            length={maxLength}
            offset={offset}
            setOffset={setOffset}
            setCount={setCount}
            setOffsetMax={setOffsetMax}
            className="list-cards"
            setHasFocus={setHasFocus}
            hasFocus={hasFocus}
            tabIndex={0}
            selectable
            selection={selected}
            setSelection={v => setSelected(v, (cardsShown[v - offset]?.props as any)?.card)} // TODO HACK
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