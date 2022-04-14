
import "style/main.scss";
import "./index.scss";

import * as React from "react";
import { createRoot } from "react-dom/client";

import { useLast, useMemoAsync    } from "components/hooks";
import { loadAtomicCards } from "api";
import { ListCardDatabase       } from "deckyard/components/ListCards";
import { CardFaceButtons, CardFaceDetails, DetailMode } from "deckyard/components/CardDetails";
import { CardImage       } from "deckyard/components/CardImage";
import { Card            } from "deckyard/types";
import { DatabaseContext } from "deckyard/state";
import { joinClassNames } from "util/shared";
import { CardRulings } from "deckyard/components/CardRulings";

(async function() {
    const rootElem = document.getElementById("app-root");
    if (!rootElem) return;
    const root = createRoot(rootElem);    
    root.render(<RenderViewerPage/>);
})();

function RenderViewerPage() {
    const [,db] = useMemoAsync(loadAtomicCards);
    return <DatabaseContext.Provider value={db}>
        <PanelCardViewer/>
        <PanelCardViewer/>
    </DatabaseContext.Provider>;
}

function PanelCardViewer({className}: {
    className?: string,
}) {
    const [selected,  setSelected ] = React.useState(-1);
    const [selection, setSelection] = React.useState<Card | undefined>(undefined);

    return <div className={joinClassNames("panel-card-viewer-container", className)}>
        <div className="panel-card-viewer">
            <div className="tools">Top</div>
            <ListCardDatabase
                selected={selected} 
                setSelected={(id, card) => {
                    setSelected(id);
                    setSelection(card);
                }}
            />
            <div className="preview">
                <PanelCardDetails card={selection}/>
            </div>
        </div>
    </div>;

}


function PanelCardDetails({card}: {card?: Card}) {
    const lastCard = useLast(card, card);
    const [mode,    setMode] = React.useState(DetailMode.Text);
    const [faceRaw, setFace] = React.useState(0);

    const face = card !== lastCard ? 0 : faceRaw;
    React.useEffect(() => setFace(0), [card]);

    let displayed;
    switch(mode) {
        case DetailMode.Image:   { displayed = <CardImage       key={card?.id} card={card}             />; } break;
        case DetailMode.Rulings: { displayed = <CardRulings     key={card?.id} card={card}             />; } break;
        case DetailMode.Text:    { displayed = <CardFaceDetails key={card?.id} face={card?.faces[face]}/>; } break;
    }

    return <>
        <div className="details">{displayed}</div>
        <div className="buttons">
            <CardFaceButtons 
                card    = {card} 
                face    = {face}
                setFace = {setFace}
                mode    = {mode}
                setMode = {setMode}
            />
        </div>
    </>;
}