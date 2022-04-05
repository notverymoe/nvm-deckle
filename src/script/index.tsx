
import "style/main.scss";
import "./index.scss";

//import cat_img from "asset/cat.gif";

import * as React from "react";
import { createRoot } from "react-dom/client";

import { useMemoAsync    } from "components/hooks";
import { loadAtomicCards } from "api";
import { ListCards       } from "deckyard/components/ListCards";
import { CardDetails } from "deckyard/components/CardDetails";
import { CardImage } from "deckyard/components/CardImage";

(async function() {
    const rootElem = document.getElementById("app-root");
    if (!rootElem) return;
    const root = createRoot(rootElem);    
    root.render(<RenderPage/>);
})();


function RenderPage() {
    const [loaded, db] = useMemoAsync(loadAtomicCards);

    const [selected, setSelected] = React.useState(0);

    return <div className="layout-normal">
        <div className="panel-database">
            {!loaded && <>Loading...</>}
            {db && <ListCards selected={selected} setSelected={setSelected} cards={db.cards}/>}
        </div>
        <div className="panel-deck-main">
            {!loaded && <>Loading...</>}
            {db && <ListCards selected={selected} setSelected={setSelected} cards={db.cards}/>}
        </div>
        <div className="panel-deck-side">
            {!loaded && <>Loading...</>}
            {db && <ListCards selected={selected} setSelected={setSelected} cards={db.cards}/>}
        </div>
        <div className="panel-card-image"><CardImage card={db?.cards[selected]}/></div>
        <div className="panel-card-text"><CardDetails card={db?.cards[selected]}/></div>
    </div>;
}
