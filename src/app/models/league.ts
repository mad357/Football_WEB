
export class League {
  [x: string]: any;
  id?: number;
  name?: string;
  countryId?: number;
  countryName?: string;
  clubNumber?: number;
  promotionNumber: number = 0;
  relegationNumber: number = 0;
  playoffPromotionNumber: number = 0;
  playoffRelegationNumber: number = 0;
  lowerLeagues: LeagueSimple[] = [];
  higherLeagues: LeagueSimple[] = [];

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

  toSimpleLeague(): LeagueSimple {
    let s = new LeagueSimple();
    s.id = this.id;
    s.name = this.name;
    return s;
  }
}

export class LeagueSimple {
  id?: number;
  name?: string;
}
