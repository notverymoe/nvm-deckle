import "./IconManaSymbol.scss";

import * as React from "react";
import { useMemo } from "react";
import deep_equals from "deep-equal";

import { ManaColour, ManaSymbol } from "deckyard/types";

import { joinClassNames } from "util/shared";
import { SVGComponent } from "components/util";

import SymbolPhyrexian      from "assets/cards/symbol-phyrexian.svg";
import SymbolManaWhite      from "assets/cards/symbol-mana-white.svg";
import SymbolManaBlue       from "assets/cards/symbol-mana-blue.svg";
import SymbolManaRed        from "assets/cards/symbol-mana-red.svg";
import SymbolManaGreen      from "assets/cards/symbol-mana-green.svg";
import SymbolManaBlack      from "assets/cards/symbol-mana-black.svg";
import SymbolManaColourless from "assets/cards/symbol-mana-black.svg";


export function IconManaCostSet({costs, seperator}: {costs: ManaSymbol[][], seperator?: React.ComponentType}) {
    const Seperator = seperator ?? (() => <>//</>);
    const filtered  = costs.filter((v, i) => v.length && !v.every((k, j) => i < j && deep_equals(v, k)));
    return <>{filtered.flatMap((v, i) => [
        <IconManaCost key={i*2} cost={v}/>, 
        ...(i+1 < filtered.length ? [<Seperator key={i*2+1}/>] : []),
    ])}</>;
}

export function IconManaCost({cost}: {cost: ManaSymbol[]}) {
    return <>{cost.map((v, i) => <IconManaSymbol key={i} colour={v}/>)}</>;
}

export function IconManaSymbol({colour}: {
    colour: ManaSymbol,
}) {
    const [colours, symbol, text] = useMemo((): [string[], SVGComponent | undefined, string] => {
        let fillColours: string[] = [];
        let iconOver  = undefined;
        let iconUnder = undefined;
        let text = "";

        function process(colour: ManaColour): [string | undefined, SVGComponent | undefined, SVGComponent | undefined,string | undefined] {
            switch(colour) {
                case ManaColour.White:      return ["mana-white",      undefined,       SymbolManaWhite,      undefined];
                case ManaColour.Blue:       return ["mana-blue",       undefined,       SymbolManaBlue,       undefined];
                case ManaColour.Red:        return ["mana-red",        undefined,       SymbolManaRed,        undefined];
                case ManaColour.Green:      return ["mana-green",      undefined,       SymbolManaGreen,      undefined];
                case ManaColour.Black:      return ["mana-black",      undefined,       SymbolManaBlack,      undefined];
                case ManaColour.Phyrexian:  return [undefined,         SymbolPhyrexian, undefined,            undefined];
                case ManaColour.Colourless: return ["mana-colourless", undefined,       SymbolManaColourless, undefined];
                case ManaColour.Variable:   return ["mana-colourless", undefined,       undefined,            "X"];
                case ManaColour.VariableY:  return ["mana-colourless", undefined,       undefined,            "Y"];
                case ManaColour.VariableZ:  return ["mana-colourless", undefined,       undefined,            "Z"];
                case ManaColour.Snow:       return ["mana-snow",       undefined,       undefined,            "S"];
                case ManaColour.Unknown:    return ["mana-unk",        undefined,       undefined,            "?"];
                case ManaColour.HalfWhite:  return ["mana-white",      undefined,       undefined,            "H"];
            }
        }
    
        for(const part of colour) {
            if(typeof part === "string") {
                const result = process(part);
                if (result[0]) fillColours.push(result[0]);
                iconOver  ||= result[1];
                iconUnder ||= result[2];
                text   = result[3] ?? text;
            } else {
                fillColours.push("mana-colourless");
                text = part.toString();
            }
        }

        return [
            fillColours, 
            fillColours.length <= 1 ? (iconUnder ?? iconOver) : iconOver, 
            text
        ];
    }, [colour]);

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
    const markless = !symbol && !text;
    let Icon = symbol ?? (() => <></>);

    // TODO prevent default on mouse down.... but not block focus?
    return <div
        className="card-symbol-root"
    >
        <div className={joinClassNames("card-symbol-background", colours[0], colours.length > 1 ? "dual" : "mono", markless && "markless", !markless && "marked")}>
            <div className={joinClassNames("card-symbol-left",  colours[0])}/>
            <div className={joinClassNames("card-symbol-right", colours[1] ?? colours[0])}/>
        </div>
        <div  className="card-symbol-text" >{text}</div>
        <Icon className="card-symbol-icon"/>
    </div>

}