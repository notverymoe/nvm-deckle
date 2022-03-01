
import "style/main.scss";

//import cat_img from "asset/cat.gif";

import * as Preact from "preact";
import { loadAtomicCards, loadSetLists } from "api";
import { CardAtomicFile, SetListFile } from "mtgjson/files";
import { VirtualList } from "components/virtual_list";


(async function() {
    const [cards, sets] = await Promise.all([loadAtomicCards(), loadSetLists()]);

    console.log(Object.keys(cards.data).length);
    console.log(sets.data.length);

    Preact.render(
        <RenderPage cards={cards} sets={sets}/>,
        document.body
    );

})();




function RenderPage({cards, sets}: {cards: CardAtomicFile, sets: SetListFile}) {
    return <>
        <h1>Cards</h1>
        <VirtualList
            class="card-list"
            length={Object.keys(cards.data).length}
            lines_per_entry={1}
            render={(idx) => <>{Object.keys(cards.data)[idx]}</>}
        />
        <h1>Sets</h1>
        <ol>{sets.data.map(({name}) => <li key={name}>{name}</li>)}</ol>
        {/*<img src={cat_img}/>*/}
    </>;
}