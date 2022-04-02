import "./IconManaSymbol.scss";

import * as React from "react";

import { ManaColour, ManaSymbol } from "deckyard/types";

import SymbolPhyrexian from "assets/cards/symbol-phyrexian.svg";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { joinClassNames } from "util/shared";
import { SVGComponent } from "components/util";


export function IconManaCost({cost}: {cost: ManaSymbol[]}) {
    return <>{cost.map((v, i) => <IconManaSymbol key={i} colour={v}/>)}</>;
}



export function IconManaSymbol({colour}: {
    colour: ManaSymbol,
}) {
    const [colours, symbol, text] = useMemo((): [string[], SVGComponent | undefined, string] => {
        let fillColours: string[] = [];
        let phy  = undefined;
        let text = "";

        function process(colour: ManaColour): [string | undefined, SVGComponent | undefined, string | undefined] {
            switch(colour) {
                case ManaColour.White:      return ["mana-white", undefined,       undefined];
                case ManaColour.Blue:       return ["mana-blue",  undefined,       undefined];
                case ManaColour.Red:        return ["mana-red",   undefined,       undefined];
                case ManaColour.Green:      return ["mana-green", undefined,       undefined];
                case ManaColour.Black:      return ["mana-black", undefined,       undefined];
                case ManaColour.Phyrexian:  return [undefined,    SymbolPhyrexian, undefined];
                case ManaColour.Colourless: return ["",           undefined,       undefined];
                case ManaColour.Variable:   return ["",           undefined,       "X"];
                case ManaColour.VariableY:  return ["",           undefined,       "Y"];
                case ManaColour.VariableZ:  return ["",           undefined,       "Z"];
                case ManaColour.Snow:       return ["mana-snow",  undefined,       "S"];
                case ManaColour.Unknown:    return ["mana-unk",   undefined,       "?"];
                case ManaColour.HalfWhite:  return ["mana-white", undefined,       "H"];
            }
        }
    
        for(const part of colour) {
            if(typeof part === "string") {
                const result = process(part);
                if (result[0]) fillColours.push(result[0]);
                phy  ||= result[1];
                text   = result[2] ?? text;
            } else {
                fillColours.push("grey");
                text = part.toString();
            }
        }

        return [fillColours, phy, text];
    }, colour);

    return <CardSymbol
        symbol={symbol}
        colours={colours}
        text={text}
    />;
}





function CardSymbol({
    symbol,
    text,
    colours,
}: {
    symbol?: SVGComponent,
    text?: string,
    colours: string[],
}) {
    let Icon = symbol ?? (() => <></>);

    return <div className="card-symbol-root">
        <div className={joinClassNames("card-symbol-background", colours[0])}>
            <div className={joinClassNames("card-symbol-left",  colours[0])}/>
            <div className={joinClassNames("card-symbol-right", colours[1] ?? colours[0])}/>
        </div>
        <div className="card-symbol-text">{text}</div>
        <Icon className="card-symbol-icon" onSelect={e => e.preventDefault()}/>
    </div>

}