

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
    Unknown    = "?Unknown?",
}

export function normalizeCardLayout(cardLayout: string): Layout {
    cardLayout = cardLayout.trim().toLowerCase();
    switch(cardLayout) {
        case Layout.Normal:    
        case Layout.Scheme:    
        case Layout.Transform: 
        case Layout.Planar:    
        case Layout.Host:      
        case Layout.ModalDFC:  
        case Layout.Flip:      
        case Layout.Vanguard:  
        case Layout.Split:     
        case Layout.Adventure: 
        case Layout.Aftermath: 
        case Layout.Saga:      
        case Layout.Class:     
        case Layout.Augment:   
        case Layout.Leveler:   
        case Layout.Meld:      
        case Layout.Reversible:
            return cardLayout;
    }

    console.warn("Unknown card type: " + cardLayout);
    return Layout.Unknown;
}