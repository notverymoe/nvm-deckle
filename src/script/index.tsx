
import "style/main.scss";
import "./index.scss";

import * as React from "react";
import { createRoot } from "react-dom/client";

import { loadAtomicCards } from "api";
import { CardList, CardListMetadata, ListCard, useCollapseTracker } from "deckyard/components/ListCards";
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
    let database = useObservableReadonly(LIST_DATABASE);

    const cards = React.useMemo<CardList>(() => {
        if (!database) return {groups: [{name: "Loading...", contents: []}]};
        return {groups: [{name: "Database", contents: database.cards}]};
    }, [database]);

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
                            <Button title="Send" icon={MUISend} text="M" className="button-send"/>
                            <Button title="Send" icon={MUISend} text="S" className="button-send"/>
                            <Button title="Send" icon={MUISend} text="C" className="button-send"/>
                        </ButtonGroup>
                    </div>
                </div>
                <DeckList cards={cards} selected={selected} setSelected={setSelected} setSelection={setSelection}/>
            </div>
            <div className="details">
                <CardDetails card={selection}/>
            </div>
        </div>
    </div>;
}

function DeckList({cards, selected, setSelected, setSelection}: {
    cards: CardList,
    selected: number,
    setSelected: (v: number) => void,
    setSelection: (v: Card | null) => void,
}) {
    const [collapseTrigger, getCollapsed, setCollapsed] = useCollapseTracker(cards, false);
    return <div className="vlist-container">
        <ListCard
            cards={cards}
            selected={selected} 
            setSelected={(id, card) => {
                setSelected(id);
                setSelection(card);
            }}
            collapseTrigger={collapseTrigger}
            getCollapsed={getCollapsed}
            setCollapsed={setCollapsed}
        />
    </div>;
}