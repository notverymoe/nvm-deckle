
import "style/main.scss";

//import cat_img from "asset/cat.gif";

import * as Preact from "preact";

import { useState } from "preact/hooks";
import { VList } from "components/vlist";
import { useMemoAsync, useRangeVirtual } from "components/hooks";
import { loadAtomicCards } from "api";

(async function() {
    Preact.render(
        <RenderPage/>,
        document.body
    );
})();

function RenderPage() {
    const [loaded, cards] = useMemoAsync(loadAtomicCards);

    return <>
        <h1>Cards</h1>
        {!loaded && <>Loading...</>}
        {cards && <CardList cardNames={Object.keys(cards.data)}/>}
    </>;
}

function CardList({cardNames}: {cardNames: string[]}) {

    const [[idx, len], setRange] = useState<[number, number]>([0,0]);

    const content = useRangeVirtual((i, len) => {
        const length = Math.max(Math.min(cardNames.length-i, len), 0);
        return Array.from({length}, (_, j) => <div key={i+j}>{i+j} - {cardNames[i+j]}</div>);
    }, idx, len, cardNames.length ?? 0);

    return <VList 
        lines={1}
        setRange={setRange} 
        length={cardNames.length}
    >{content}</VList>
}