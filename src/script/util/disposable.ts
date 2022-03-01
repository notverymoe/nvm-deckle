
export interface Disposable {
    dispose(): void;
}

export class DisposeGuard implements Disposable {
    constructor(private f: (() => void) | undefined) {}

    dispose() {
        this.release()?.();
    }

    release(): (() => void) | undefined {
        const result = this.f;
        this.f = undefined;
        return result;
    }
}