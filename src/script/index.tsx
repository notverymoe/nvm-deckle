
import "style/main.scss";
import "./index.scss";

import * as React from "react";
import { createRoot } from "react-dom/client";

import { useMemoAsync    } from "components/hooks";
import { loadAtomicCards } from "api";
import { CardListRaw, ListCard, useCollapseTracker } from "deckyard/components/ListCards";
import { CardFaceDetails as CardDetails            } from "deckyard/components/CardDetails";
import { Card            } from "deckyard/types";
import { DatabaseContext } from "deckyard/state";
import { joinClassNames  } from "util/shared";

declare global {
    interface Window { 
        __TAURI__?: any; 
    }
}


(async function() {
    const rootElem = document.getElementById("app-root");
    if (!rootElem) return;
    const root = createRoot(rootElem);    
    root.render(<RenderViewerPage/>);
})();

function RenderViewerPage() {
    const [,db] = useMemoAsync(() => loadAtomicCards(false));
    return <React.StrictMode>
        <DatabaseContext.Provider value={db}>
            <PanelCardViewer/>
            <PanelCardViewer/>
        </DatabaseContext.Provider>
    </React.StrictMode>;
}

function PanelCardViewer({className}: {
    className?: string,
}) {
    const [selected,  setSelected ] = React.useState(-1);
    const [selection, setSelection] = React.useState<Card | null>(null);

    const db = React.useContext(DatabaseContext);
    /*const filters = React.useMemo<DatabaseFilter[]>(() => [
        {field: "text", query: "elf creatures", fuzzy: "exact"}
    ], []);*/
    //const [,filtered,] = useDatabaseFilter(db, filters)

    const cards = React.useMemo<CardListRaw>(() => ({
        groups: db 
        ? [{name: "Database",   contents: [...(db.cards ?? [])]}] 
        : [{name: "Loading...", contents: []      }]
    }), [db]);


    const [collapseTrigger, getCollapsed, setCollapsed] = useCollapseTracker(cards, false);

    return <div className={joinClassNames("panel-card-viewer-container", className)}>
        <div className="panel-card-viewer">
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
            <div className="details">
                <CardDetails card={selection}/>
            </div>
        </div>
    </div>;
}