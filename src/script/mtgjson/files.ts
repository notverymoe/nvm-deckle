import { CardAtomic } from "./card_atomic";
import { SetList } from "./set_list";

export interface Metadata {
    date:    string,
    version: string,
}

export interface CardAtomicFile {
    data: Record<string, CardAtomic[]>,
    meta: Metadata,
}

export interface SetListFile {
    data: SetList[],
    meta: Metadata,
}

