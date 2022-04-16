import "./CardImage.scss";

import * as React from "react";

import { Card, Layout } from "deckyard/types";
import { useElementHeight, useMemoAsync } from "components/hooks";

import ImageFrontLoading from "assets/cards/front-loading.webp";
import ImageBack from "assets/cards/back.webp";
import { joinClassNames } from "util/shared";
import { Button, ButtonGroup } from "components/button";

const imageRatio = 488/680;

export function CardImage({card}: {card?: Card | null | undefined}) {
    const [rotationRaw, setRotationRaw] = React.useState(0);
    const rotation = React.useRef(rotationRaw); // TODO default rotation for split cards
    const applyRotation = (v: number) => {
        setRotationRaw(rotation.current += v);
    };

    const [flipped, setFlipped] = React.useState(false);
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const [loadingFront, imageFront,] = useScryfallImageAsync(card?.name);

    // TODO more robust card detection
    const [loadingBack,  imageBack, ] = useScryfallImageAsync(card?.name, true, card?.layout == Layout.Normal);
    const height = useElementHeight(rootRef);
    return <div
        className="card-image-container"
        ref={rootRef}
    >
        <div className="card-image-backdrop"> 
            <div 
                className={joinClassNames("card-image", flipped && "flipped")}
                onClick={() => setFlipped(!flipped)}
                style={{
                    transform: `rotate(${rotation.current}deg)`,
                    width: height ? `${height*imageRatio}px` : undefined,
                    height: height ?? undefined,
                    ["--card-height"]: `${height ?? 0}`,
                    ["--card-width" ]: `${height ? height*imageRatio : 0}`,
                } as any}
            >
                <div className="card-image-inner">
                    <div 
                        className="image"
                        style={{
                            backgroundImage: !card || !loadingFront ? `url(${ImageFrontLoading})` : `url(${imageFront})`,
                        }}
                    />
                    <div 
                        className="image-back" 
                        style={{
                            backgroundImage: !card || !loadingBack ? `url(${ImageFrontLoading})` : `url(${imageBack ?? ImageBack})`,
                        }}
                    />
                </div>
            </div>
        </div>
        <ButtonGroup direction="horizontal" className="rotate-button">
            <Button text="CCW" action={() => applyRotation(-90)}/>
            <Button text="CW"  action={() => applyRotation(+90)}/>
        </ButtonGroup>
    </div>;
}

function useScryfallImageAsync(id: string | undefined | null, back?: boolean, noBack?: boolean) {
    //return [false, null, null];
    const [loading, blob, error] = useMemoAsync(async () => {
        if (!id || noBack) return undefined;
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
