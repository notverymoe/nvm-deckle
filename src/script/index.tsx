
import "style/main.scss";

//import cat_img from "asset/cat.gif";

import * as Preact from "preact";

import { useMemoAsync    } from "components/hooks";
import { loadAtomicCards } from "api";
import { ListCards       } from "deckyard/components/ListCards";
import { useState        } from "preact/hooks";

(async function() {
    Preact.render(
        <RenderPage/>,
        document.body
    );
})();


function RenderPage() {
    const [loaded, db] = useMemoAsync(loadAtomicCards);

    const [selected, setSelected] = useState(0);

    return <>
        <h1>Cards</h1>
        {!loaded && <>Loading...</>}
        {db && <ListCards selected={selected} setSelected={setSelected} cards={db.cards}/>}
    </>;
}
