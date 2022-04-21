import AtomicCardsJson from "assets/AtomicCards.json.gz";
import SetListJson from "assets/SetList.json.gz";
import { CardDatabase, convertFromMTGJSONAtomicCards } from "deckyard/types";

import { SetListFile } from "./mtgjson/files";
import { gunzip } from 'fflate';

export async function loadAtomicCards(): Promise<CardDatabase> {
    return await convertFromMTGJSONAtomicCards(await uncompressJSON(await requestCardDatabase(AtomicCardsJson)));
}

export async function loadSetLists(): Promise<SetListFile> {
    return await uncompressJSON( await (await fetch(SetListJson, {method: "GET"})).arrayBuffer());
}

async function uncompressJSON(response: ArrayBuffer) {
    const data = await new Promise<Uint8Array>((resolve, reject) => { gunzip(
        new Uint8Array(response), 
        {consume: true}, 
        (e, v) => {
            if (e) {
                reject(e);
                return;
            }
            resolve(v);
        }); 
    });
    return JSON.parse(new TextDecoder().decode(data));
}

declare global {
    interface Window { 
        __TAURI__?: any; 
    }
}

async function requestCardDatabase(path: string) {
    if (window.__TAURI__) {
        const { invoke } = await import('@tauri-apps/api');
        return await invoke<ArrayBuffer>("load_cards", {
            name: path,
            forceUpdate: false
        });
    }
    return await (await fetch(path, { method: "GET" })).arrayBuffer();
}
