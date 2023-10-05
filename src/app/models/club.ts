import { Country } from "./country";
import { LeagueSimple } from "./league";

export class Club {
  [x: string]: any;
  id?: number;
  alias?: string;
  fullname?: number;
  name?: string;
  yearFound?: number;
  country?: Country;
  leagueShort?: LeagueSimple;

  constructor(jsonStr?: string) {
    if (jsonStr) {
      let jsonObj = JSON.parse(jsonStr);
      for (let prop in jsonObj) {
        this[prop] = jsonObj[prop];
      }
    }
  }
}
