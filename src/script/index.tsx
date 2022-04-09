
import "style/main.scss";
import "./index.scss";

import * as React from "react";
import { createRoot } from "react-dom/client";

import { useMemoAsync    } from "components/hooks";
import { loadAtomicCards } from "api";
import { ListCards       } from "deckyard/components/ListCards";
import { CardDetails } from "deckyard/components/CardDetails";
import { CardImage } from "deckyard/components/CardImage";
import { CardRulings } from "deckyard/components/CardRulings";
import { Card, CardDatabase } from "deckyard/types";
import { DatabaseContext } from "deckyard/state";

(async function() {
    const rootElem = document.getElementById("app-root");
    if (!rootElem) return;
    const root = createRoot(rootElem);    
    root.render(<RenderPage/>);
})();

function RenderPage() {
    const [,db] = useMemoAsync(loadAtomicCards);
    const [selectedCard, setSelectedCard] = React.useState<Card | undefined>(undefined);

    return <DatabaseContext.Provider value={db}>
        <div className="layout-normal">
            <div className="section-top">
                <PanelCards database={db} onSelectionChanged={setSelectedCard}/>
                <div className="panel-stats">Middle</div>
                <PanelCards database={db} onSelectionChanged={setSelectedCard}/>
            </div>
            <div className="section-bottom">
                <div className="panel-card-image"  ><CardImage   card={selectedCard}/></div>
                <div className="panel-card-text"   ><CardDetails card={selectedCard}/></div>
            </div>
        </div>
    </DatabaseContext.Provider>;
}

function PanelCards({database, onSelectionChanged}: {
    database?: CardDatabase,
    onSelectionChanged?: (selection: Card | undefined) => void,
}) {
    const [selected, setSelected] = React.useState(0);
    return <div className="panel-cards">
        <div className="middle">Top</div>
        <div className="panel-cards-inner">
            {database && <ListCards selected={selected} setSelected={v => {
                setSelected(v);
                onSelectionChanged?.(database.cards[v]);
            }}/> || "Loading..."}
        </div>
    </div>;
}
