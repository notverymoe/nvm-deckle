
import * as React from "react";

import { Card, CardDatabase } from "./types";

export const DatabaseContext = React.createContext<CardDatabase | undefined>(undefined);


export type Filter = (db: CardDatabase, selection: Card[]) => Card[];