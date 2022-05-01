import { Observable } from "util/observable";
import { CardWithMetadata } from "./components/ListCards";
import { CardDatabase } from "./types";

export const LIST_DATABASE = new Observable<CardDatabase | null>(null);
export const LIST_MAIN     = new Observable<CardWithMetadata[]>([]);
export const LIST_SIDE     = new Observable<CardWithMetadata[]>([]);
export const LIST_CONSIDER = new Observable<CardWithMetadata[]>([]);
