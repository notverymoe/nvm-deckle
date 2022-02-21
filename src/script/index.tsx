
import "style/main.scss";

//import cat_img from "asset/cat.gif";

import * as Preact from "preact";


Preact.render(
    <RenderPage/>,
    document.body
);

function RenderPage() {
    return <>
        <h1>Hello</h1>
        {/*<img src={cat_img}/>*/}
    </>;
}

