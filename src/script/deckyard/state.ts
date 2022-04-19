
import * as React from "react";

import { Card, CardDatabase } from "./types";

export const DatabaseContext = React.createContext<CardDatabase | undefined>(undefined);