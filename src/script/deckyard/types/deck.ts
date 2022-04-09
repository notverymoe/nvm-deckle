import { Card } from ".";


export interface DeckListEntry {
    quantity: number,
    card:     Card,
}

export interface Deck {
    contents: Map<number, Card>;
}