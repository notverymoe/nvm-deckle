import "./CardImage.scss";

import * as React from "react";

import { Card } from "deckyard/types";
import { Button, ButtonGroup } from "components/button";
import { useElementWidth, useMemoAsync } from "components/hooks";

const imageRatio = 680/488;


export function CardImage({card}: {card?: Card}) {
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const [loading, image, error] = useScryfallImageAsync(card?.name);
    const width = useElementWidth(rootRef);
    return <div className="card-image">
        <ButtonGroup className="card-face-buttons" direction="horizontal">
            <Button text="Front"/>
            <Button text="Back"/>
        </ButtonGroup>
        <div 
            className="card-shadowbox"
            ref={rootRef}
            style={{
                height: width ? width*imageRatio : undefined
            }}
        >
            {!loading && <div>Loading...</div>}
            {image   && <div className="image" style={{backgroundImage: `url(${image})`}}/>}
        </div>
    </div>;
}

function useScryfallImageAsync(id: string | undefined | null) {
    const [loading, blob, error] = useMemoAsync(async () => {
        if (!id) return undefined;
        // TODO proper stringify
        const image = await makeScryfallRequest(`https://api.scryfall.com/cards/named?exact=${id.replaceAll(" ", "+")}&format=image&version=normal`, v => v.blob());
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
