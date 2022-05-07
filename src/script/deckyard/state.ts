import { Observable } from "util/observable";
import { CardSet } from "./card_set";
import { CardDatabase } from "./types";

export const DATABASE = new Observable<CardDatabase | null>(null);

export const LIST_DATABASE = new Observable(new CardSet([]));
export const LIST_MAIN     = new Observable(new CardSet([], new Map(), new Map()));
export const LIST_SIDE     = new Observable(new CardSet([], new Map(), new Map()));
export const LIST_CONSIDER = new Observable(new CardSet([], new Map(), new Map()));
