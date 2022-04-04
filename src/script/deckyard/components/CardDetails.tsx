import "./CardDetails.scss";

import * as React from "react";

import { CardFace, CardDatabaseEntry } from "deckyard/types/database";
import { ButtonGroup, Button } from "components/button";
import { Layout } from "deckyard/types/card_layout";
import { IconManaCost } from "./IconManaSymbol";
import { useMemoAsync } from "components/hooks";

const layouts: Partial<Record<Layout, {names: string[], hasBack: boolean}>> = {
    [Layout.Normal    ]: {names: ["Front"               ],          hasBack: true  },
    [Layout.Transform ]: {names: ["Front", "Transformed"],          hasBack: false },
    [Layout.Augment   ]: {names: ["Front"],                         hasBack: true  },
    [Layout.Saga      ]: {names: ["I", "II", "III", "IV", "V"],     hasBack: true  }, // TODO one text-box?
    [Layout.Adventure ]: {names: ["Front", "Adventure"],            hasBack: true  }, // TODO one text-box?
    [Layout.Aftermath ]: {names: ["Front", "Aftermath"],            hasBack: true  }, // TODO one text-box?
    [Layout.Class     ]: {names: ["Level 1", "Level 2", "Level 3"], hasBack: true  }, // TODO one text-box?
    [Layout.Flip      ]: {names: ["Front", "Flipped"],              hasBack: true  },
    [Layout.Leveler   ]: {names: ["Rank 1",  "Rank 2",  "Rank 3"],  hasBack: true  }, // TODO one text-box?
    [Layout.Planar    ]: {names: ["Front"],                         hasBack: true  },
    [Layout.Host      ]: {names: ["Front"],                         hasBack: true  },
    [Layout.Scheme    ]: {names: ["Front"],                         hasBack: true  },
    [Layout.Meld      ]: {names: ["Front", "Top", "Bottom"],        hasBack: false },
    [Layout.ModalDFC  ]: {names: ["Side A", "Side B"],              hasBack: false },
    [Layout.Vanguard  ]: {names: ["Front"],                         hasBack: false },
    [Layout.Split     ]: {names: ["Left", "Right"],                 hasBack: true  }, // TODO one text-box?
    [Layout.Reversible]: {names: ["Side A", "Side B"],              hasBack: false },
};


export function CardDetails({card} : {
    card?: CardDatabaseEntry
}) {

    const [selected, setSelected] = React.useState(0);

    const layout = layouts[card?.layout!] ?? {names: ["None"], hasBack: false};


    

    return card ?<div className="card-details">
        <ButtonGroup direction="horizontal">
            {layout.names.map((v, i) => <Button text={v} action={() => setSelected(i)}/>)}
            {layout.hasBack ? <Button text="Back"/> : undefined}
        </ButtonGroup>
        <CardFaceDetails face={card.faces[selected]}/>

    </div> : <></>;
}

function CardFaceDetails({face}: {
    face: CardFace
}) {
    const [loading, image, error] = useScryfallImageAsync(face.name);
    return <div className="face-details">
        <div className="shadowbox">{image ? <img src={image} className="image"/> : undefined}</div>
        <div className="top">
            <div className="name">{face.name}</div>
            <div className="cost"><IconManaCost cost={face.manaCost}/></div>
        </div>
        <p className="text">{face.text ?? ""}</p>
    </div>;
}

function useScryfallImageAsync(id: string | undefined | null) {
    const [loading, blob, error] = useMemoAsync(async () => {
        if (!id) return undefined;
        // TODO proper stringify
        const image = await makeScryfallRequest(` https://api.scryfall.com/cards/named?exact=${id.replaceAll(" ", "+")}&format=image&version=normal`, v => v.blob());
        return URL.createObjectURL(image);
    }, [id]);


    React.useEffect(() => {
        if (!blob) return;
        return () => URL.revokeObjectURL(blob);
    }, [blob]);

    return [loading, blob, error] as const;
}

let lastPromise = Promise.resolve();
function makeScryfallRequest<T>(url: string, handler: (v: Response) => Promise<T>): Promise<T> {

    console.log(url);
    return new Promise<T>((resolve, reject) => {
        lastPromise = (async() => {
            await lastPromise;
            try {
                resolve(await handler(await fetch(url)))
            } catch(e) {
                reject(e);
            } finally {
                await wait(100);
            }
        })();
    });
}

function wait(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}


