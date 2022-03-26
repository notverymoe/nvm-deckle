
import "style/main.scss";

//import cat_img from "asset/cat.gif";

import * as Preact from "preact";
import { ButtonGroup, ButtonIcon, ButtonText } from "components/button";

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
            <ButtonText content="Hey how are you" action={() => console.log("a")}/>
            <ButtonText content="Yolo lol"        action={() => console.log("b")}/>
            <ButtonText content="Hello"           action={() => console.log("c")}/>
        </ButtonGroup>
        <ScrollBar direction="vertical" value={offset} setValue={setOffset} step={0.1}/>
    </>;
}