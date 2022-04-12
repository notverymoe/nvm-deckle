import "./CardImage.scss";

import * as React from "react";

import { Card } from "deckyard/types";
import { useElementHeight, useMemoAsync } from "components/hooks";

import ImageFrontLoading from "assets/cards/front-loading.webp";
import ImageBack from "assets/cards/back.webp";
import { joinClassNames } from "util/shared";
import { Button, ButtonGroup } from "components/button";

const imageRatio = 488/680;

export function CardImage({card}: {card?: Card}) {
    const [rotation, setRotation] = React.useState(0);
    const [flipped, setFlipped] = React.useState(false);
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const [loadingFront, imageFront,] = useScryfallImageAsync(card?.name);
    const [loadingBack,  imageBack, ] = useScryfallImageAsync(card?.name, true);
    const height = useElementHeight(rootRef);
    const cardID = React.useRef(2*((card?.id ?? -1) + 1));
    React.useLayoutEffect(() => {
        setFlipped(false);
        cardID.current = 2*((card?.id ?? -1) + 1); // This is used to ensure we don't animate the flip-back
    }, [card]);
    return <div
        className="card-image-container"
        ref={rootRef}
    >
        <div className="card-image-backdrop"> 
            <div 
                className={joinClassNames("card-image", flipped && "flipped")}
                onClick={() => setFlipped(!flipped)}
                style={{
                    width: height ? height*imageRatio : undefined,
                    transform: `rotate(${rotation}deg)`,
                    ["--card-height"]: `${height ?? 0}`,
                    ["--card-width" ]: `${height ? height*imageRatio : 0}`,
                } as any}
            >
                <div className="card-image-inner">
                    <div 
                        className="image"
                        key={cardID.current}
                        style={!card || !loadingFront ? {backgroundImage: `url(${ImageFrontLoading})`} : {backgroundImage: `url(${imageFront})`}}
                    />
                    <div 
                        className="image-back" 
                        key={cardID.current + 1}
                        style={!card || !loadingBack ? {backgroundImage: `url(${ImageFrontLoading})`} : {backgroundImage: `url(${imageBack ?? ImageBack})`}}
                    />
                </div>
            </div>
        </div>
        <ButtonGroup direction="horizontal" className="rotate-button">
            <Button text="CCW" action={() => setRotation(rotation - 90)}/>
            <Button text="CW"  action={() => setRotation(rotation + 90)}/>
        </ButtonGroup>
    </div>;
}

function useScryfallImageAsync(id: string | undefined | null, back?: boolean) {
    //return [false, null, null];
    const [loading, blob, error] = useMemoAsync(async () => {
        if (!id) return undefined;
        // TODO proper stringify
        // HACK "_____" only works in fuzzy search?
        const image = await makeScryfallRequest(
            id !== "_____"
                ? `https://api.scryfall.com/cards/named?exact=${id.replaceAll(" ", "+")}&format=image&version=normal&face=${back ? "back" : "front"}`
                : `https://api.scryfall.com/cards/named?fuzzy=${id.replaceAll(" ", "+")}&format=image&version=normal&face=${back ? "back" : "front"}`,
            v => {
                if (v.status === 422) return Promise.resolve(null);
                return v.blob()
            }
        );
        return image ? URL.createObjectURL(image) : null;
    }, [id]);


    React.useEffect(() => {
        if (!blob) return;
        return () => URL.revokeObjectURL(blob);
    }, [blob]);

    return [loading, blob, error] as const;
}

let lastPromise = Promise.resolve();
function makeScryfallRequest<T>(url: string, handler: (v: Response) => Promise<T>): Promise<T> {
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
