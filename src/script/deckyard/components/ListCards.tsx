
import "./ListCards.scss";

import * as React from "react";

import { useRangeVirtual, useTrigger } from "components/hooks";
import { VList           } from "components/vlist";
import { Card            } from "../types";
import { IconCardType    } from "./IconCardType";
import { IconManaCostSet } from "./IconManaSymbol";
import { joinClassNames  } from "util/shared";

import MUIArrow  from "assets/icons/mui_play_arrow.svg";
import MUIAdd    from "assets/icons/mui_add.svg";
import MUIRemove from "assets/icons/mui_remove.svg";
import { Button, ButtonGroup } from "components/button";

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

export type CardList = CardListRaw | CardListMetadata;

export function useCollapseTracker(cards: CardList, defaultState: boolean = false) {

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

export function ListCard({selected, setSelected, cards, getCollapsed, setCollapsed, collapseTrigger, move, add}: {
    cards: CardList,

    selected:    number,
    setSelected: (v: number, c: Card | null) => void,

    getCollapsed: (v: number) => boolean,
    setCollapsed: (v: number, state: boolean) => void,
    collapseTrigger: number,

    move?: (v: number) => void,
    add?:  (v: number) => void,
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

export function ListCardEntry({qty, card, move, add}: {
    qty?: number,
    card: Card, 
    move?: (v: number) => void,
    add?:  (v: number) => void,
}) {
    const [toggleControls, setToggleControls] = React.useState(false);
    const [controlRef, setControlRef] = React.useState<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (!(move || add) || !toggleControls || !controlRef) return;
        const cb = (e: MouseEvent) => {
            if (controlRef?.contains(e.target as Node) ?? true) return;
            setToggleControls(false);
        };
        document.addEventListener("mousedown", cb);
        return () => document.removeEventListener("mousedown", cb)
    }, [move, add, toggleControls, controlRef]);
    
    return <div className="card-entry" title={card.name}>
        {qty && <div className="card-qty" title={`x${qty}`}>{qty}</div>}
        <div className="card-type"><IconCardType card={card}/></div>
        <div className="card-name">{card.name}</div>
        {(move || add) && <div className={joinClassNames("card-overlay", toggleControls && "hover")} ref={setControlRef}>
            {add && <ButtonGroup direction="horizontal">
                <Button icon={MUIAdd}    action={() => add( 1)}/>
                <Button icon={MUIRemove} action={() => add(-1)}/>
            </ButtonGroup>}
            {move && <ButtonGroup direction="horizontal">
                <Button icon={MUIArrow} iconRotate={3} action={() => move(-1)}/>
                <Button icon={MUIArrow} iconRotate={1} action={() => move( 1)}/>
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