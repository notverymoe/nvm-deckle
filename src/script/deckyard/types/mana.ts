export enum ManaColour {
    Phyrexian  = "P",
    Colourless = "C",
    Variable   = "X",
    Snow       = "S",

    White      = "W",
    Blue       = "U",
    Black      = "B",
    Red        = "R",
    Green      = "G",

    Unknown    = "??",

    // Un-set BS
    HalfWhite = "HW",
    VariableY = "Y",
    VariableZ = "Z",
}

export type ManaSymbol = (number | ManaColour)[];

const symbolRegex = /{(.*?)}/g;
export function parseManaCost(manaCost: string): ManaSymbol[] {
    const result: ManaSymbol[] = [];
    for(const symbol of manaCost.matchAll(symbolRegex)) result.push(parseManaSymbol(symbol[0].slice(1, -1).trim()));
    return result;
}


export function parseManaSymbol(symbolStr: string): ManaSymbol {
    const result: ManaSymbol = [];
    for(const symbol of symbolStr.toUpperCase().split("/")) {
        switch(symbol) {
            case ManaColour.Phyrexian:
            case ManaColour.Colourless:
            case ManaColour.Variable :
            case ManaColour.Snow:
            case ManaColour.White:
            case ManaColour.Blue:
            case ManaColour.Black:
            case ManaColour.Red:
            case ManaColour.Green: 
                result.push(symbol); 
                break;

            case ManaColour.VariableY:
            case ManaColour.VariableZ:
            case ManaColour.HalfWhite:
                result.push(symbol); 
                break;

            default:
                const value = Number(symbol);
                if (!isNaN(value)) {
                    result.push(value);
                } else {
                    console.error("Unhandled mana symbol: " + symbol);
                    result.push(ManaColour.Unknown);
                }
                break;
        }
    }
    return result;
}