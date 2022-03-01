import { Identifiers, PurchaseUrls } from "./shared";

export interface SetList {
    baseSetSize: number,
    block?: string,
    code: string,
    codeV3?: string,
    isForeignOnly?: boolean,
    isFoilOnly: boolean,
    isNonFoilOnly?: boolean,
    isOnlineOnly: boolean,
    isPaperOnly?: boolean,
    isPartialPreview?: boolean,
    keyruneCode: string,
    mcmId?: number,
    mcmIdExtras?: number,
    mcmName?: string,
    mtgoCode?: string,
    name: string,
    parentCode?: string,
    releaseDate: string,
    sealedProduct?: SealedProduct,
    tcgplayerGroupId?: number,
    totalSetSize: number,
    translations: Translations,
    type: string,
}


export interface SealedProduct {
    identifiers: Identifiers,
    name: string,
    purchaseUrls: PurchaseUrls,
    releaseDate: null | string,
    uuid: string
}

export interface Translations {
    "Ancient Greek"?: string,
    "Arabic"?: string,
    "Chinese Simplified"?: string,
    "Chinese Traditional"?: string,
    "French"?: string,
    "German"?: string,
    "Hebrew"?: string,
    "Italan"?: string,
    "Japanese"?: string,
    "Korean"?: string,
    "Latin"?: string,
    "Phyrexian"?: string,
    "Portuguese (Brazil)"?: string,
    "Russian"?: string,
    "Sanskrit"?: string,
    "Spanish"?: string,
}