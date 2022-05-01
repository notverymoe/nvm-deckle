
import "style/main.scss";
import "./index.scss";

import * as React from "react";
import { createRoot } from "react-dom/client";

import { loadAtomicCards } from "api";
import { CardList, CardListMetadata, CardWithMetadata, ListCard, useCollapseTracker } from "deckyard/components/ListCards";
import { CardFaceDetails as CardDetails            } from "deckyard/components/CardDetails";
import { Card, CardDatabase            } from "deckyard/types";
import { joinClassNames  } from "util/shared";
import { Button, ButtonGroup } from "components/button";

import MUIData      from "assets/icons/mui_dns.svg";
import MUIBookmark  from "assets/icons/mui_bookmark.svg";
import MUIMenu      from "assets/icons/mui_menu.svg";
import MUITableMenu from "assets/icons/mui_table_row.svg";
import MUIFilter    from "assets/icons/mui_filter.svg";

import MUISend           from "assets/icons/mui_send.svg";
import { LIST_CONSIDER, LIST_DATABASE, LIST_MAIN, LIST_SIDE } from "deckyard/state";
import { Observable, useObservable, useObservableReadonly } from "util/observable";

declare global {
    interface Window { 
        __TAURI__?: any; 
    }
}


(async function() {
    LIST_DATABASE.value = await loadAtomicCards(false);
})();

createRoot(document.getElementById("app-root")!).render(
    <React.StrictMode>
        <DeckyardContent/>
    </React.StrictMode>
);

function DeckyardContent() {
    const [count, setCount] = React.useState(3);
    return <>
        {Array.from({length: count}, (_, i) => <PanelCardViewer key={i}/>)}
    </>;
}

function PanelCardViewer({className}: {
    className?: string,
}) {
    const [selected,  setSelected ] = React.useState(-1);
    const [selection, setSelection] = React.useState<Card | null>(null);

    const [current, setCurrent] = React.useState("all");
    const database = useObservableReadonly(LIST_DATABASE);

    const currentObservable = 
        current === "misc" ? LIST_CONSIDER :
        current === "side" ? LIST_SIDE     :
        LIST_MAIN;
    const currentList = useObservableReadonly(currentObservable);

    const send = (dest: Observable<CardWithMetadata[]>) => {
        if (selection === null) return;
        let database = dest.value.map(v => ({...v}));
        let idx = database.findIndex(v => v.card.id === selection.id);
        if (idx >= 0) {
            database[idx].qty++;
        } else {
            database.push({qty: 1, card: selection});
        }
        dest.value = database;
    };

    const move = (dest: Observable<CardWithMetadata[]>, card: Card, dist: number) => {
        let idx = dest.value.findIndex(v => v.card.id === card.id);
        if (idx < 0) return;
        const newPos = Math.min(Math.max(idx+dist, 0), dest.value.length);
        if (idx === newPos) return;

        let database = dest.value.map(v => ({...v}));
        const value = database[idx];
        database.splice(idx, 1);
        database.splice(newPos, 0, value);
        dest.value = database;

        setSelected(newPos);
    };

    const add = (dest: Observable<CardWithMetadata[]>, card: Card, amount: number) => {
        let idx = dest.value.findIndex(v => v.card.id === card.id);
        if (idx < 0) return;

        let database = dest.value.map(v => ({...v}));
        database[idx].qty += amount;
        if (database[idx].qty <= 0) database.splice(idx, 1);
        dest.value = database;
    };


    return <div className={joinClassNames("panel-card-viewer-container", className)}>
        <div className="panel-card-viewer">
            <div className="list">
                <div className="tools">
                    <div className="group-top">
                        <Button icon={MUIFilter} title="Filter View"/>
                        <ButtonGroup direction="vertical">
                            <Button title="Card Database" icon={MUIData     } action={() => setCurrent("all")}/>
                            <Button title="Mainboard"     text="M" icon={MUITableMenu} className="button-send" action={() => setCurrent("main")}/>
                            <Button title="Sideboard"     text="S" icon={MUIMenu     } className="button-send" action={() => setCurrent("side")}/>
                            <Button title="Considerboard" text="C" icon={MUIBookmark } className="button-send" action={() => setCurrent("misc")}/>
                        </ButtonGroup>
                    </div>
                    <div className="group-middle">
                        <ButtonGroup direction="vertical">
                            <Button title="Send" icon={MUISend} text="M" className="button-send" action={() => send(LIST_MAIN)}/>
                            <Button title="Send" icon={MUISend} text="S" className="button-send" action={() => send(LIST_SIDE)}/>
                            <Button title="Send" icon={MUISend} text="C" className="button-send" action={() => send(LIST_CONSIDER)}/>
                        </ButtonGroup>
                    </div>
                </div>
                <DeckList 
                    cards={current === "all" 
                        ? (database?.cards ?? null) 
                        : currentList
                    }
                    selected={selected}
                    setSelected={setSelected}
                    setSelection={setSelection}
                    move={current === "all" ? undefined : (card: Card, dist: number) => move(currentObservable, card, dist)}
                    add ={current === "all" ? undefined : (card: Card, amt:  number) => add(currentObservable, card, amt)}
                />
            </div>
            <div className="details">
                <CardDetails card={selection}/>
            </div>
        </div>
    </div>;
}

function DeckList({cards, selected, setSelected, setSelection, move, add}: {
    cards: CardWithMetadata[] | Card[] | null,
    selected: number,
    setSelected: (v: number) => void,
    setSelection: (v: Card | null) => void,
    move?: (card: Card, dist: number) => void,
    add?:  (card: Card, count: number) => void,
}) {
    const cardList = React.useMemo<CardList>((): CardList => {
        if (!cards) return {groups: [{name: "Loading...", contents: []}]};
        return (!!cards.length && !("qty" in cards[0])) ? {
            groups: [{name: "Contents", contents: cards as Card[]}], 
            hasMetadata: false
        } : {
            groups: [{name: "Contents", contents: cards as CardWithMetadata[]}], 
            hasMetadata: true
        };
    }, [cards]);

    const [collapseTrigger, getCollapsed, setCollapsed] = useCollapseTracker(cardList, false);
    return <div className="vlist-container">
        <ListCard
            cards={cardList}
            selected={selected} 
            setSelected={(id, card) => {
                setSelected(id);
                setSelection(card);
            }}
            collapseTrigger={collapseTrigger}
            getCollapsed={getCollapsed}
            setCollapsed={setCollapsed}
            move={move}
            add={add}
        />
    </div>;
}