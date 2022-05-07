import { MessageSource, useMessageTrigger } from "util/message";
import { Card } from "./types";

export interface CardMetadata {
    quantity: number,
    tags:     string[]
}

export type CardMetadataName = keyof CardMetadata;

export class CardSet {

    readonly onModifySet  = new MessageSource<[]>();
    readonly onModifyCard = new MessageSource<[Card, CardMetadataName]>();

    private _cards:       Card[];
    private _quantities?: Map<Card, number>;
    private _tags?:       Map<Card, string[]>;

    get cards()      { return this._cards;      }
    get quantities() { return this._quantities; }
    get tags()       { return this._tags;       }

    constructor(
        cards:       Card[],
        quantities?: Map<Card, number>,
        tags?:       Map<Card, string[]>
    ) {
        this._cards      = cards;
        this._quantities = quantities;
        this._tags       = tags;
    }

    has(card: Card) {
        return this.cards.includes(card);
    }

    hasQuantities() {
        return !!this.quantities;
    }

    setTags(card: Card, tags: string[]) {
        if (!this.tags || !this.has(card)) return;
        if (tags.length) {
            this.tags.set(card, tags);
        } else {
            this.tags.delete(card);
        }
        this.onModifyCard._notify(card, "tags");
    }

    setTag(card: Card, tag: string, state: boolean) {
        if (!this.tags || !this.has(card)) return;

        const tags = this.tags.get(card) ?? [];
        const idx = tags.indexOf(tag);

        if (state) {
            if (idx >= 0) return;
            tags.push(tag);
        } else {
            if (idx < 0) return;
            tags.splice(idx, 1);
        }

        this.setTags(card, tags);
    }

    addQuantity(card: Card, amount: number) {
        this.setQuantity(card, (this.has(card) ? this.quantities?.get(card) ?? 1 : 0) + amount);
    }

    setQuantity(card: Card, amount: number) {
        const idx = this.cards.indexOf(card);
        if (idx < 0) {
            if (amount > 0) {
                this.cards.push(card);
                if (this.quantities && (amount > 1)) {
                    this.quantities?.set(card, amount);
                }
                this.onModifySet._notify();
            }
            return;
        } else if (amount <= 0) {
            if (idx >= 0) {
                this.cards.splice(idx, 1);
                this.quantities?.delete(card);
                this.tags?.delete(card);
                this.onModifySet._notify();
            }
        } else if (this.quantities) {
            if ((this.quantities.get(card) ?? 1) !== amount) {
                if (amount <= 1) {
                    this.quantities.delete(card);
                } else {
                    this.quantities.set(card, amount);
                }
                this.onModifyCard._notify(card, "quantity");
            }
        }
    }

    getQuantity(card: Card): number | undefined {
        return this.quantities ? (this.quantities.get(card) ?? 1) : undefined;
    }

    getTags(card: Card): string[] | undefined {
        return this.tags ? (this.tags.get(card) ?? []) : undefined;
    }
}

export function useCardMetadata(set: CardSet, card: Card): Partial<CardMetadata> {
    useMessageTrigger(set.onModifyCard, v => v === card);
    return {
        quantity: set.getQuantity(card),
        tags:     set.getTags(card),
    };
}

export function useCardQuantity(set: CardSet, card: Card) {
    useMessageTrigger(set.onModifyCard, (v, n) => v === card && n === "quantity");
    return set.getQuantity(card);
}

export function useCardTags(set: CardSet, card: Card) {
    useMessageTrigger(set.onModifyCard, (v, n) => v === card && n === "tags");
    return set.getTags(card);
}