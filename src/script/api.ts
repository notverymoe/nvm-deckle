import { CardDatabase, convertFromMTGJSONAtomicCards } from "deckyard/types";

import { gunzip } from 'fflate';
import { CardAtomicFile } from "mtgjson/files";

export async function loadAtomicCards(forceUpdate: boolean): Promise<CardDatabase> {
    return await convertFromMTGJSONAtomicCards(await loadAtomicCardsData(DatabaseName.AtomicCards, forceUpdate, true));
}

enum DatabaseName {
    AtomicCards = 0,
}

async function loadAtomicCardsData(database: DatabaseName, forceUpdate: boolean, forceDev: boolean): Promise<CardAtomicFile> {
    if (window.__TAURI__) {
        const { invoke } = await import('@tauri-apps/api');
        const result = await invoke<string>("load_cards", { database, forceUpdate });
        return JSON.parse(result);
    } else {
        const storageKey = `db_${DatabaseName[database]}`;

        if (forceUpdate) localStorage.removeItem(storageKey);
        let cached = localStorage.getItem(storageKey);
        if (!cached) {
            if (!forceDev) {
                const url = `https://mtgjson.com/api/v5/${DatabaseName[database]}.json.gz`;
                const data = await (await fetch(url, { method: "GET", cache: forceUpdate ? "reload" : "force-cache" })).arrayBuffer();
                cached = await uncompressText(data);
            } else {
                const url = `http://localhost:8000/database/${DatabaseName[database]}?force_update=${forceUpdate}`;
                cached = await (await fetch(url)).text();
            }
            try {
                localStorage.setItem(storageKey, cached);
            } catch(e) {
                console.error("Failed to cache in local storeage." + e);
            }
        }
        return JSON.parse(cached);
    }
}

async function uncompressText(response: ArrayBuffer) {
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
    return new TextDecoder().decode(data);
}