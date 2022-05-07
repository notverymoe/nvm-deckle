
import "style/main.scss";
import "./index.scss";

import * as React from "react";
import { createRoot } from "react-dom/client";

import { loadAtomicCards } from "api";
import { ListCard } from "deckyard/components/ListCards";
import { CardFaceDetails as CardDetails            } from "deckyard/components/CardDetails";
import { Card            } from "deckyard/types";
import { joinClassNames  } from "util/shared";
import { Button, ButtonGroup } from "components/button";

import MUIData      from "assets/icons/mui_dns.svg";
import MUIBookmark  from "assets/icons/mui_bookmark.svg";
import MUIMenu      from "assets/icons/mui_menu.svg";
import MUITableMenu from "assets/icons/mui_table_row.svg";
import MUIFilter    from "assets/icons/mui_filter.svg";

import MUISend           from "assets/icons/mui_send.svg";
import { DATABASE, LIST_CONSIDER, LIST_DATABASE, LIST_MAIN, LIST_SIDE } from "deckyard/state";
import { Observable, useObservable, useObservableReadonly } from "util/observable";
import { CardSet } from "deckyard/card_set";

declare global {
    interface Window { 
        __TAURI__?: any; 
    }
}


(async function() {
    DATABASE.value = await loadAtomicCards(false);
})();

DATABASE.connect(v => {
    if (!v) return;
    LIST_DATABASE.value = new CardSet(v.cards);
});
loadAtomicCards(false).then(v => DATABASE.value = v);

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

    const currentSet = useObservableReadonly(
        current === "all"  ? LIST_DATABASE :
        current === "misc" ? LIST_CONSIDER :
        current === "side" ? LIST_SIDE     :
        LIST_MAIN
    );

    const send = (dest: CardSet) => {
        if (selection === null) return;
        dest.addQuantity(selection, 1);
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
                            <Button title="Send" icon={MUISend} text="M" className="button-send" action={() => send(LIST_MAIN.value    )}/>
                            <Button title="Send" icon={MUISend} text="S" className="button-send" action={() => send(LIST_SIDE.value    )}/>
                            <Button title="Send" icon={MUISend} text="C" className="button-send" action={() => send(LIST_CONSIDER.value)}/>
                        </ButtonGroup>
                    </div>
                </div>
                <DeckList 
                    set={currentSet}
                    selected={selected}
                    setSelected={setSelected}
                    setSelection={setSelection}
                />
            </div>
            <div className="details">
                <CardDetails card={selection}/>
            </div>
        </div>
    </div>;
}

function DeckList({set, selected, setSelected, setSelection}: {
    set: CardSet,
    selected: number,
    setSelected: (v: number) => void,
    setSelection: (v: Card | null) => void,
    move?: (card: Card, dist: number) => void,
    add?:  (card: Card, count: number) => void,
}) {

    return <div className="vlist-container">
        <ListCard
            set={set}
            selected={selected} 
            setSelected={(id, card) => {
                setSelected(id);
                setSelection(card);
            }}
        />
    </div>;
}