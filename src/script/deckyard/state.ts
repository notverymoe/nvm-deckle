import { Observable } from "util/observable";
import { Card, CardDatabase } from "./types";

export const LIST_DATABASE = new Observable<CardDatabase | null>(null);
export const LIST_MAIN     = new Observable<{card: Card, qty: number}[]>([]);
export const LIST_SIDE     = new Observable<{card: Card, qty: number}[]>([]);
export const LIST_CONSIDER = new Observable<{card: Card, qty: number}[]>([]);
