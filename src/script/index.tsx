
import "style/main.scss";
import "./index.scss";

import * as React from "react";
import { createRoot } from "react-dom/client";

import { useMemoAsync    } from "components/hooks";
import { loadAtomicCards } from "api";
import { ListCards       } from "deckyard/components/ListCards";
import { CardFaceButtons, CardFaceDetails } from "deckyard/components/CardDetails";
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
    const [[selected, selectedCard, faceIndex], setSelected] = React.useState<[number, Card | undefined, number]>([-1, undefined, 0]);

    return <div className={joinClassNames("panel-card-viewer-container", className)}>
        <div className="panel-card-viewer">
            <div className="tools">Top</div>
            <ListCards selected={selected} setSelected={(id, card) => setSelected([id, card, faceIndex <= -2 ? -2 : 0])}/>
            <div className="preview">
                <div className="details">{
                    faceIndex <= -2
                        ? <CardImage card={selectedCard}/>
                        : faceIndex <= -1 
                            ? <CardRulings card={selectedCard}/>
                            : <CardFaceDetails face={selectedCard?.faces[faceIndex]}/>
                }
                </div>
                <div className="buttons">
                    <CardFaceButtons card={selectedCard} selectedFace={faceIndex} setSelectedFace={v => setSelected([selected, selectedCard, v])}/>
                </div>
            </div>
        </div>
    </div>;

}
