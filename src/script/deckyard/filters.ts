import { useMemoAsync } from "components/hooks";
import { cooperativeIteratorToSet, iterDifference, iterIntersection } from "util/iterator";
import { CardType, Layout, CardDatabase, Card } from "./types";
import { CardTypeSuper } from "./types/card_type_super";
import { ColourIdentity } from "./types/colour_identity";

export interface DatabaseFilterTextQuery {
    field: "name" | "text",
    query:  string,
    fuzzy?: "exact" | "partial" | "fuzzy",
    invert?: boolean,
}

export interface DatabaseFilterTypeCardQuery {
    field: "typeCard",
    query: CardType,
    invert?: boolean,
}

export interface DatabaseFilterTypeSuperQuery {
    field: "typeSuper",
    query: CardTypeSuper,
    invert?: boolean,
}

export interface DatabaseFilterTypeSubQuery {
    field: "typeSuper",
    query: CardTypeSuper,
    fuzzy?: "exact" | "partial" | "fuzzy",
    invert?: boolean,
}

export interface DatabaseFilterIdentityQuery {
    field: "identity",
    query: ColourIdentity,
    fuzzy?: "exact" | "partial" | "fuzzy",
    invert?: boolean,
    includeColourless?: boolean,
}

export interface DatabaseFilterLayout {
    field: "layout",
    query: Layout,
    invert?: boolean,
}

export type DatabaseFilter = DatabaseFilterTextQuery | DatabaseFilterTypeCardQuery | DatabaseFilterTypeSuperQuery | DatabaseFilterTypeSubQuery | DatabaseFilterIdentityQuery | DatabaseFilterLayout;

export function useDatabaseFilter(database: CardDatabase | undefined | null, filters: DatabaseFilter[], rate = 1000) {

    return useMemoAsync<Set<Card>>(async () => {
        if (!database) return new Set();
        if (!filters.length) return await cooperativeIteratorToSet(database.cards, rate);

        const results = await Promise.all(filters.map(async (v) => {
            let result: Set<Card>;
            switch(v.field) {
                case "name": {
                    result = await database.searchName(v.query, v.fuzzy ?? "exact");
                } break;
                case "text": {
                    result = await database.searchText(v.query, v.fuzzy ?? "exact");
                } break;
                case "layout": {
                    result = await database.searchLayout(v.query);
                } break;
                case "identity": {
                    result = await database.searchIdentity(v.query, v.fuzzy ?? "exact", v.includeColourless);
                } break;
                case "typeCard": {
                    result = await database.searchTypeCard(v.query);
                } break;
                case "typeSuper": {
                    result = await database.searchTypeSuper(v.query);
                } break;
            }

            // TODO OPT we might be able union all inverted sets, then perform the invert once
            //      this would reduce the amount of iterations greatly. We could also add invert
            //      as a param on the search methods, which is likely more efficient in some cases?
            return !v.invert ? result : cooperativeIteratorToSet(iterDifference(result, database.cards), rate);
        }));
        return cooperativeIteratorToSet(iterIntersection<Card>(results.shift()!, ...results), rate);

    }, [database, filters]);

}