
import "style/main.scss";

//import cat_img from "asset/cat.gif";

import * as Preact from "preact";
import { ButtonGroup, Button } from "components/button";

import Icon from "assets/icon.svg";
import { ScrollBar } from "components/scrollbar";
import { useState } from "preact/hooks";

(async function() {
    Preact.render(
        <RenderPage/>,
        document.body
    );

})();

function RenderPage() {

    const [offset, setOffset] = useState(0);

    return <>
        <h1>Cards</h1>
        <p>hello</p>
        <ButtonGroup direction="vertical">
            <Button text="Hey how are you" action={() => console.log("a")}/>
            <Button text="Yolo lol"        action={() => console.log("b")}/>
            <Button text="Hello"           action={() => console.log("c")}/>
        </ButtonGroup>
        <ScrollBar direction="vertical"   value={offset} setValue={setOffset} step={0.1}/>
        <ScrollBar direction="horizontal" value={offset} setValue={setOffset} step={0.1}/>
    </>;
}