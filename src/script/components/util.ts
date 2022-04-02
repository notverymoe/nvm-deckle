
import * as React from "react";

export type SVGComponent = React.ComponentType<React.SVGAttributes<any>>;

export function registerOneShotDocumentEvent<K extends keyof DocumentEventMap>(type: K, listener: (ev: DocumentEventMap[K]) => (void | boolean)) {
    let disposed = false;
    const cb = (ev: DocumentEventMap[K]) => {
        if(disposed) return;
        try {
            if(listener(ev)) return;
        } catch(e) {
            console.log(e);
        } finally {
            disposed = true;
            document.removeEventListener(type, cb);
        }
    };
    document.addEventListener(type, cb);
    return () => {
        if(disposed) return;
        disposed = true;
        document.removeEventListener(type, cb);
    };
}