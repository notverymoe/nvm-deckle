

export enum Layout {
    Normal     = "normal",
    Scheme     = "scheme",
    Transform  = "transform",
    Planar     = "planar",
    Host       = "host",
    ModalDFC   = "modal_dfc",
    Flip       = "flip",
    Vanguard   = "vanguard",
    Split      = "split",
    Adventure  = "adventure",
    Aftermath  = "aftermath",
    Saga       = "saga",
    Class      = "class",
    Augment    = "augment",
    Leveler    = "leveler",
    Meld       = "meld",
    Reversible = "reversible_card",
}

export const LAYOUTS_KNOWN = Object.values(Layout).filter((v): v is Layout => v[0] === v[0].toLowerCase());

export function isLayoutKnown(v: string | Layout): v is Layout {
    return (LAYOUTS_KNOWN as string[]).includes(v);
}

export function normalizeCardLayout(cardLayout: string): string {
    cardLayout = cardLayout.trim().toLowerCase();
    if (!isLayoutKnown(cardLayout)) console.warn("Unknown card layout: " + cardLayout);
    return cardLayout;
}