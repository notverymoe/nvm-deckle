
import "./ListCards.scss";

import * as React from "react";

import { CardSet, useCardQuantity } from "deckyard/card_set";

import { useRangeVirtual, useTrigger } from "components/hooks";
import { VList                       } from "components/vlist";
import { Button, ButtonGroup         } from "components/button";

import { joinClassNames } from "util/shared";

import { Card            } from "../types";
import { IconCardType    } from "./IconCardType";
import { IconManaCostSet } from "./IconManaSymbol";

import MUIArrow  from "assets/icons/mui_play_arrow.svg";
import MUIAdd    from "assets/icons/mui_add.svg";
import MUIRemove from "assets/icons/mui_remove.svg";
import { useMessageTrigger } from "util/message";

const selectionContext = React.createContext<{selected: number, setSelected: (idx: number, card: Card) => void} | null>(null);;

export interface CardGroup {
    name: string,
    contents: Card[],
}

export function ListCard({selected, setSelected, set}: {
    set:         CardSet,
    selected:    number,
    setSelected: (v: number, c: Card | null) => void
}) {
    const [count,     setCount    ] = React.useState(0);
    const [offset,    setOffsetRaw] = React.useState(0);
    const [offsetMax, setOffsetMax] = React.useState(0);
    const setOffset = (v: number) => setOffsetRaw(Math.max(0, Math.min(offsetMax, Math.trunc(v))));

    const [hasFocus, setHasFocus] = React.useState(false);

    const cardSetTrigger = useMessageTrigger(set.onModifySet);

    const maxLength = !set.hasQuantities 
        ? set.cards.length
        : set.cards.reduce<number>((p, v) => p + set.getQuantity(v)!, 0);

    const cardsShown = useRangeVirtual(
        (i, length) => set.cards.slice(i, Math.min(set.cards.length, i + length)).map((v, j) => <ListCardEntry
            key={i + j}
            set={set}
            card={v}
        />), 
        offset, 
        count, 
        undefined, 
        [set, cardSetTrigger]
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

export function ListCardEntry({set, card}: {
    set: CardSet,
    card: Card,
}) {
    const [toggleControls, setToggleControls] = React.useState(false);
    const [controlRef, setControlRef] = React.useState<HTMLDivElement | null>(null);

    const hasQuantities = set.hasQuantities();
    const qty = useCardQuantity(set, card);

    React.useEffect(() => {
        if (!hasQuantities || !toggleControls || !controlRef) return;
        const cb = (e: MouseEvent) => {
            if (controlRef?.contains(e.target as Node) ?? true) return;
            setToggleControls(false);
        };
        document.addEventListener("mousedown", cb);
        return () => document.removeEventListener("mousedown", cb)
    }, [hasQuantities, toggleControls, controlRef]);
    
    return <div className="card-entry" title={card.name}>
        {hasQuantities && <div className="card-qty" title={`x${qty}`}>{qty}</div>}
        <div className="card-type"><IconCardType card={card}/></div>
        <div className="card-name">{card.name}</div>
        {hasQuantities && <div className={joinClassNames("card-overlay", toggleControls && "hover")} ref={setControlRef}>
            {hasQuantities && <ButtonGroup direction="horizontal">
                <Button icon={MUIAdd}    action={() => set.addQuantity(card,  1)}/>
                <Button icon={MUIRemove} action={() => set.addQuantity(card, -1)}/>
            </ButtonGroup>}
        </div>}
        <div className="card-cost" onClick={() => setToggleControls(!toggleControls)}>
            <IconManaCostSet costs={card.faces.map(v => v.manaCost)}/>
        </div>
    </div>
}

export function ListCardGroup({name, collapsed, toggle, count}: {name: string, collapsed: boolean, toggle: () => void, count: number}) {
    return <div className={joinClassNames("card-group", collapsed && "collapsed")} onClick={toggle}>
        <div className="name">{name}</div>
        <div className="count">{count}</div>
        <div className="arrow">{"▼"}</div>
    </div>;
}



            /*
            if (cards.groups.length <= 0) {
                return [];
            }

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
                    let count;
                    if (cards.hasMetadata) {
                        count = cards.groups[j].contents.reduce((p, c) => p + c.qty, 0);
                    } else {
                        count = cards.groups[j].contents.length;
                    }

                    result.push(<ListCardGroup
                        key={i + result.length}
                        name={cards.groups[j].name}
                        collapsed={getCollapsed(j)}
                        toggle={() => setCollapsed(j, !getCollapsed(j))}
                        count={count}
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
                                move={move ? v => move(contents[k].card, v) : undefined}
                                add ={add ?  v =>  add(contents[k].card, v) : undefined}
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
            return result;*/