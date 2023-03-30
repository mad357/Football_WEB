import { Country } from "./country";

export interface League {
  [x: string]: any;
    id?: number;
    name?: string;
    country?: Country;
    countryName?: string;
    clubNumber?: number;
    promotionNumber?: number;
    relegationNumber?: number;
    playoffPromotionNumber?: number;
    playoffRelegationNumber?: number;
    lowerLeagueIds?: Set<number>;
    higherLeagueIds?: Set<number>;
}

