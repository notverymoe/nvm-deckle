
import * as React from "react";

import { CardDatabase } from "./types";

export const DatabaseContext = React.createContext<CardDatabase | undefined>(undefined);