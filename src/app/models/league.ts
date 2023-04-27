
export class League {
  [x: string]: any;
  id?: number;
  name?: string;
  countryId?: number;
  countryName?: string;
  clubNumber?: number;
  promotionNumber?: number;
  relegationNumber?: number;
  playoffPromotionNumber?: number;
  playoffRelegationNumber?: number;
  lowerLeagues?: SimpleLeague[] = [];
  higherLeagues?: SimpleLeague[] = [];

  constructor(jsonStr?: string) {
    if (jsonStr) {
      let jsonObj = JSON.parse(jsonStr);
      for (let prop in jsonObj) {
        this[prop] = jsonObj[prop];
      }
    }
  }

  toString() {
    return this.name ? this.name : '';
  }
}

export class SimpleLeague {
  id!: number;
  name!: string;
}
