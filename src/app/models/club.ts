import { Country } from "./country";
import { SimpleLeague } from "./league";

export class Club {
  [x: string]: any;
  id?: number;
  alias?: string;
  fullname?: number;
  name?: string;
  yearFounded?: number;
  country?: Country;
  leagueShort?: SimpleLeague;

  constructor(jsonStr?: string) {
    if (jsonStr) {
      let jsonObj = JSON.parse(jsonStr);
      for (let prop in jsonObj) {
        this[prop] = jsonObj[prop];
      }
    }
  }
}
