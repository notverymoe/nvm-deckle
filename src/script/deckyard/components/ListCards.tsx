
import "./ListCards.scss";

import * as React from "react";

import { useRangeVirtual } from "components/hooks";
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

    return <ListCard
        cards={cards}
        selected={selected} 
        setSelected={setSelected}
    />;
}

function ListCard({selected, setSelected, cards}: {
    selected:    number,
    setSelected: (v: number, c: Card | null) => void,
    cards: CardListRaw | CardListMetadata,
}) {
    const [count,    setCount   ] = React.useState(0);
    const [offset,    setOffsetRaw] = React.useState(0);
    const [offsetMax, setOffsetMax] = React.useState(0);
    const setOffset = (v: number) => setOffsetRaw(Math.max(0, Math.min(offsetMax, Math.trunc(v))));

    const [hasFocus, setHasFocus] = React.useState(false);

    const [trigger, setTrigger] = React.useState(false);
    const collpased = React.useMemo((): boolean[] => [], [cards]);
    const maxLength = (cards.groups as CardGroup<any>[]).reduce<number>((p, v, i) => {
        return p + (collpased[i] ? 1 : v.contents.length + 1);
    }, 0);

    const cardsShown = useRangeVirtual(
        (i, length) => {
            // TODO this is horrid
            let offset = 0;
            const startGroup = cards.groups.findIndex((v, j) => {
                let length = collpased[j] ? 1 : (v.contents.length + 1);
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
                        collapsed={!!collpased[j]}
                        toggle={() => {
                            collpased[j] = !collpased[j];
                            setTrigger(!trigger);
                        }}
                    />);
                } else {
                    skip -= 1;
                }

                if (!collpased[j]) {;
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
        [trigger, cards]
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