import { Country } from './../../models/country';
import { CountryService } from './country.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnInit, ViewChild } from '@angular/core';
import { League, SimpleLeague } from 'src/app/models/league';
import { LeagueService } from './league.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Observable, finalize, map, pipe, startWith } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';
import { FormControl } from '@angular/forms';

export class LeagueFilter {
  countryId?: number;
  name?: string;
  clubNumber?: number;
  higherLeagueId?: number;
  lowerLeagueId?: number;
  promotionNumber?: number;
  playoffPromotionNumber?: number;
  relegationNumber?: number;
  playoffRelegationNumber?: number;
}

@Component({
  selector: 'app-league',
  templateUrl: './league.component.html',
  styleUrls: ['./league.component.css'],
})
export class LeagueComponent implements OnInit {
  filter: LeagueFilter = new LeagueFilter();
  filteredLowerLeagues?: Observable<League[]>;
  filteredHigherLeagues?: Observable<League[]>;
  lowerLeagueControl = new FormControl();
  higherLeagueControl = new FormControl();

  isBusy = false;
  leagues: League[] = [];
  originLeagues: League[] = [];
  simpleLeagues: SimpleLeague[] = [];
  countries: Country[] = [];
  displayedColumns: string[] = [
    'countryName',
    'name',
    'clubNumber',
    'higherLeagues',
    'lowerLeagues',
    'promotionNumber',
    'playoffPromotionNumber',
    'relegationNumber',
    'playoffRelegationNumber',
    'actions',
  ];
  dataSource = new MatTableDataSource<League>(this.leagues);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private leagueService: LeagueService,
    private countryService: CountryService,
    private _liveAnnouncer: LiveAnnouncer,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.leagueService.list().subscribe((leagues) => {
      leagues.forEach((item) => {
        this.leagues.push(new League(JSON.stringify(item)));
        this.originLeagues.push(new League(JSON.stringify(item)));
      });

      this.dataSource.data = leagues;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      for (let item of this.originLeagues) {
        let simpleLeague = new SimpleLeague();
        simpleLeague.id = item.id!;
        simpleLeague.name = item.name!;
        this.simpleLeagues.push(simpleLeague);
      }
      leagues.forEach((item) => {
        item['editMode'] = false;
        item.higherLeagues = this.simpleLeagues.filter((x) => item.higherLeagues?.some((x2) => x.id === x2.id));
        item.lowerLeagues = this.simpleLeagues.filter((x) => item.lowerLeagues?.some((x2) => x.id === x2.id));
      });
    });
    this.countryService.list().subscribe((countries) => {
      this.countries = countries as Country[];
    });
    this.filteredLowerLeagues = this.lowerLeagueControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
    this.filteredHigherLeagues = this.higherLeagueControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  private _filter(value: any): League[] {
    if (typeof value == 'object') {
      return [];
    }
    const filterValue = value.toLowerCase();

    return this.originLeagues.filter((option) => option.name!.toLowerCase().includes(filterValue));
  }

  search(): void {
    this.filter.lowerLeagueId = this.lowerLeagueControl.value?.id;
    this.filter.higherLeagueId = this.higherLeagueControl.value?.id;
    if (typeof this.lowerLeagueControl.value === 'string') {
      this.lowerLeagueControl.setValue(null);
    }
    if (typeof this.higherLeagueControl.value === 'string') {
      this.higherLeagueControl.setValue(null);
    }
    Object.keys(this.filter).forEach((key) => {
      if (
        this.filter[key as keyof LeagueFilter] === undefined ||
        this.filter[key as keyof LeagueFilter] === '' ||
        this.filter[key as keyof LeagueFilter] === null
      ) {
        delete this.filter[key as keyof LeagueFilter];
      }
    });

    this.leagueService.list(this.filter).subscribe((leagues) => {
      this.leagues = [];
      //this.originLeagues = [];
      leagues.forEach((item) => {
        this.leagues.push(new League(JSON.stringify(item)));
        //this.originLeagues.push(new League(JSON.stringify(item)));
      });
      this.dataSource.data = leagues;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      leagues.forEach((item) => {
        item['editMode'] = false;
      });
    });
  }

  clear(): void {
    this.lowerLeagueControl.setValue(null);
    this.higherLeagueControl.setValue(null);
    this.filter = new LeagueFilter();
  }

  sortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  openEditMode(league: League): void {
    league['editMode'] = true;
  }

  closeEditMode(league: League): void {
    let originValue = this.originLeagues.filter((x) => x.id === league.id)[0];
    for (let key in league) league[key] = originValue.hasOwnProperty(key) ? originValue[key] : league[key];
    league['editMode'] = false;
  }

  save(league: League): void {
    this.leagueService
      .update(league)
      .pipe(finalize(() => (league['editMode'] = false)))
      .subscribe({
        next: () => {
          let originValue = this.originLeagues.filter((x) => x.id === league.id)[0];
          for (let key in league) originValue[key] = league.hasOwnProperty(key) ? league[key] : originValue[key];
          this.snackBar.open($localize`notification.leagueSaved`, undefined, { duration: 5000 });
        },
        error: () => {
          let originValue = this.originLeagues.filter((x) => x.id === league.id)[0];
          for (let key in league) league[key] = originValue.hasOwnProperty(key) ? originValue[key] : league[key];
        },
      });
  }

  onChangeCountry(league: League, $event: MatSelectChange) {
    league.countryName = this.countries.filter((x) => x.id === league.countryId)[0].name;
  }

  getLeaguesDataSelector(isHigherLeague: boolean, league: League): SimpleLeague[] {
    let result: SimpleLeague[] = [];
    let leagueOrigin = this.originLeagues.find((x) => x.id === league.id);
    for (let item of this.originLeagues.filter((x) => x.countryId === league.countryId)) {
      let simpleLeague = new SimpleLeague();
      simpleLeague.id = item.id!;
      simpleLeague.name = item.name!;
      result.push(simpleLeague);
    }

    return this.simpleLeagues.filter((s) =>
      this.originLeagues
        .filter(
          (o1) =>
            o1.countryId === league.countryId &&
            o1.id !== league.id &&
            (isHigherLeague
              ? !this.getAllHigherThanLeagues(league)
                  .filter((x) => !leagueOrigin?.higherLeagues?.some((x2) => x.id == x2.id))
                  .find((o2) => o2.id === o1.id) && !this.getAllLowerThanLeagues(league).find((o2) => o2.id === o1.id)
              : !this.getAllLowerThanLeagues(league)
                  .filter((x) => !leagueOrigin?.lowerLeagues?.some((x2) => x.id == x2.id))
                  .find((o2) => o2.id === o1.id) && !this.getAllHigherThanLeagues(league).find((o2) => o2.id === o1.id))
        )
        .some((o2) => s.id === o2.id)
    );
  }

  getHigherLeagues(leagueId: number): League[] {
    let higherLeagueIds = this.originLeagues.filter((x) => x.id === leagueId)[0].higherLeagues!.flatMap((x2) => x2.id);
    return this.originLeagues.filter((x) => higherLeagueIds.includes(x.id!));
  }

  getHigherSimpleLeagues(leagueId: number): SimpleLeague[] {
    let higherLeagueIds = this.originLeagues.filter((x) => x.id === leagueId)[0].higherLeagues!.flatMap((x2) => x2.id);
    return this.simpleLeagues.filter((x) => higherLeagueIds.includes(x.id));
  }

  getAllHigherThanLeagues(league: League): SimpleLeague[] {
    let simpleLeague = this.simpleLeagues.filter((x) => x.id === league.id)[0];
    let leagues = this.getHigherLeagues(league.id!);
    if (leagues.length === 0) {
      return [];
    }
    const queue: SimpleLeague[] = [];
    queue.push(simpleLeague);

    const results: SimpleLeague[] = [];

    while (queue.length > 0) {
      const first = queue.shift()!;
      const more = this.getHigherSimpleLeagues(first.id).filter(
        (it) => results.find((that) => that.id === it.id) == null
      );

      if (more.length > 0) {
        queue.push(...more);
      }
      results.push(first);
    }

    return results;
  }

  getAnyEdited(): boolean {
    let anyEdited: boolean = false;
    this.leagues.forEach((item) => {
      if (item['editMode'] == true) {
        anyEdited = true;
        return;
      }
    });

    return anyEdited;
  }

  getLowerLeagues(leagueId: number): League[] {
    let lowerLeagueIds = this.originLeagues.filter((x) => x.id === leagueId)[0].lowerLeagues!.flatMap((x2) => x2.id);
    return this.originLeagues.filter((x) => lowerLeagueIds.includes(x.id!));
  }

  getLowerSimpleLeagues(leagueId: number): SimpleLeague[] {
    let lowerLeagueIds = this.originLeagues.filter((x) => x.id === leagueId)[0].lowerLeagues!.flatMap((x2) => x2.id);
    return this.simpleLeagues.filter((x) => lowerLeagueIds.includes(x.id));
  }

  getAllLowerThanLeagues(league: League): SimpleLeague[] {
    let simpleLeague = this.simpleLeagues.filter((x) => x.id === league.id)[0];
    let leagues = this.getLowerLeagues(league.id!);
    if (leagues.length === 0) {
      return [];
    }
    const queue: SimpleLeague[] = [];
    queue.push(simpleLeague);

    const results: SimpleLeague[] = [];

    while (queue.length > 0) {
      const first = queue.shift()!;
      const more = this.getLowerSimpleLeagues(first.id).filter(
        (it) => results.find((that) => that.id === it.id) == null
      );

      if (more.length > 0) {
        queue.push(...more);
      }
      results.push(first);
    }

    return results;
  }
}
