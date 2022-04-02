
import "style/main.scss";

//import cat_img from "asset/cat.gif";

import * as React from "react";
import * as ReactDOM from "react-dom";

import { useMemoAsync    } from "components/hooks";
import { loadAtomicCards } from "api";
import { ListCards       } from "deckyard/components/ListCards";

(async function() {
    ReactDOM.render(
        <RenderPage/>,
        document.body
    );
})();


function RenderPage() {
    const [loaded, db] = useMemoAsync(loadAtomicCards);

    const [selected, setSelected] = React.useState(0);

    return <>
        <h1>Cards</h1>
        {!loaded && <>Loading...</>}
        {db && <ListCards selected={selected} setSelected={setSelected} cards={db.cards}/>}
    </>;
}
