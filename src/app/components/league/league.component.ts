import { Country } from './../../models/country';
import { CountryService } from './country.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnInit, ViewChild } from '@angular/core';
import { League, LeagueSimple } from 'src/app/models/league';
import { LeagueService } from './league.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Observable, finalize, map, pipe, startWith } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppComponent } from 'src/app/app.component';

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
  simpleLeagues: LeagueSimple[] = [];
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
    private snackBar: MatSnackBar,
    private httpClient: HttpClient,
    public app: AppComponent
  ) {}
  //Template Driven Form
  ngOnInit(): void {
    this.leagueService.list().subscribe((leagues) => {
      this.refreshLeagues(leagues);
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

  private updateLeagueReferences(league: League): void {
    this.originLeagues.forEach((item) => {
      item.higherLeagues?.forEach((higher) => {
        if (higher.id === league.id) {
          const index = item.higherLeagues!.findIndex((x) => x.id === league.id);
          item.higherLeagues?.splice(index, 1);
        }
      });
      item.lowerLeagues?.forEach((lower) => {
        if (lower.id === league.id) {
          const index = item.lowerLeagues!.findIndex((x) => x.id === league.id);
          item.lowerLeagues?.splice(index, 1);
        }
      });

      league.higherLeagues?.forEach((higher) => {
        if (higher.id === item.id) {
          let simpleLeague = new LeagueSimple();
          simpleLeague.id = league.id!;
          simpleLeague.name = league.name!;
          item.lowerLeagues?.push(simpleLeague);
        }
      });
      league.lowerLeagues?.forEach((lower) => {
        if (lower.id === item.id) {
          let simpleLeague = new LeagueSimple();
          simpleLeague.id = league.id!;
          simpleLeague.name = league.name!;
          item.higherLeagues?.push(simpleLeague);
        }
      });
    });
  }

  private refreshLeagues(leagues: League[]): void {
    this.leagues = [];
    this.originLeagues = [];
    this.simpleLeagues = [];
    leagues.forEach((item) => {
      this.leagues.push(new League(JSON.stringify(item)));
      this.originLeagues.push(new League(JSON.stringify(item)));
    });

    this.dataSource.data = leagues;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    for (let item of this.originLeagues) {
      let simpleLeague = new LeagueSimple();
      simpleLeague.id = item.id!;
      simpleLeague.name = item.name!;
      this.simpleLeagues.push(simpleLeague);
    }
    leagues.forEach((item) => {
      item['editMode'] = false;
      item.higherLeagues = this.simpleLeagues.filter((x) => item.higherLeagues?.some((x2) => x.id === x2.id));
      item.lowerLeagues = this.simpleLeagues.filter((x) => item.lowerLeagues?.some((x2) => x.id === x2.id));
    });
  }

  isAlreadyGotHigherLeague(editedLeague: League, higherLeagueItem: LeagueSimple): boolean {
    if ((editedLeague.higherLeagues = [])) {
      return false;
    }
    return true;
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
      leagues.forEach((item) => {
        this.leagues.push(new League(JSON.stringify(item)));
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
    this.search();
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
    if (league.id === undefined) {
      const data = this.dataSource.data;
      data.splice(0, 1);
      this.dataSource.data = data;
    } else {
      let originValue = this.originLeagues.filter((x) => x.id === league.id)[0];
      for (let key in league) league[key] = originValue.hasOwnProperty(key) ? originValue[key] : league[key];
      league['editMode'] = false;
      league.higherLeagues = this.simpleLeagues.filter((x) => league.higherLeagues?.some((x2) => x.id === x2.id));
      league.lowerLeagues = this.simpleLeagues.filter((x) => league.lowerLeagues?.some((x2) => x.id === x2.id));
    }
  }

  save(league: League): void {
    if (league.id === undefined) {
      this.leagueService.create(league).subscribe({
        next: (response) => {
          this.snackBar.open($localize`notification.leagueCreated`, undefined, { duration: 5000 });
          var location: string = response.headers.get('Location')!;
          this.httpClient.request<League>('get', location).subscribe((result) => {
            this.originLeagues.push(result);
            this.updateLeagueReferences(result);
            this.refreshLeagues(this.originLeagues);
          });
        },
        error: () => {
          let originValue = this.originLeagues.filter((x) => x.id === league.id)[0];
          for (let key in league) league[key] = originValue.hasOwnProperty(key) ? originValue[key] : league[key];
          this.snackBar.open($localize`notification.leagueErrorOnSave`, undefined, { duration: 5000 });
        },
      });
    } else {
      this.leagueService
        .update(league)
        .pipe(finalize(() => (league['editMode'] = false)))
        .subscribe({
          next: () => {
            let originValue = this.originLeagues.filter((x) => x.id === league.id)[0];
            for (let key in league) originValue[key] = league.hasOwnProperty(key) ? league[key] : originValue[key];
            this.snackBar.open($localize`notification.leagueSaved`, undefined, { duration: 5000 });
            let index = this.originLeagues.findIndex((item) => item.id === league.id);
            this.originLeagues[index] = league;
            this.updateLeagueReferences(league);
            this.refreshLeagues(this.originLeagues);
          },
          error: () => {
            let originValue = this.originLeagues.filter((x) => x.id === league.id)[0];
            for (let key in league) league[key] = originValue.hasOwnProperty(key) ? originValue[key] : league[key];
            this.snackBar.open($localize`notification.leagueErrorOnSave`, undefined, { duration: 5000 });
          },
        });
    }
  }

  delete(league: League, index: number): void {
    if (league.id === undefined) {
      const data = this.dataSource.data;
      data.splice(index, 1);
      this.dataSource.data = data;
    } else {
      if (confirm($localize`dialog.confirmLeagueDelete`)) {
        this.leagueService.delete(league).subscribe({
          next: () => {
            const data = this.dataSource.data;
            data.splice(index, 1);
            this.dataSource.data = data;
            this.originLeagues = data;
            this.refreshLeagues(this.originLeagues);
            this.snackBar.open($localize`notification.leagueDeleted`, undefined, { duration: 5000 });
          },
          error: () => {
            this.snackBar.open($localize`notification.leagueErrorOnDelete`, undefined, { duration: 5000 });
          },
        });
      }
    }
  }

  add(): void {
    const data = this.dataSource.data;
    let league: League = new League();
    league['editMode'] = true;
    data.unshift(league);
    this.dataSource.data = data;
  }

  anyNonPersistent(): boolean {
    let result: boolean = false;
    for (var i = 0; i < this.dataSource.data.length; i++) {
      if (this.dataSource.data[i].id === undefined) {
        result = true;
        break;
      }
    }
    return result;
  }

  anyEdit(): boolean {
    for (var i = 0; i < this.dataSource.data.length; i++) {
      if (this.dataSource.data[i]['editMode'] === true) {
        return true;
      }
    }
    return false;
  }

  onChangeCountry(league: League, $event: MatSelectChange) {
    league.countryName = this.countries.filter((x) => x.id === league.countryId)[0].name;
  }

  isLeagueInLoop(league: League): boolean {
    if (this.originLeagues.length === 0 || league.higherLeagues.length === 0 || league.lowerLeagues.length === 0) {
      return false;
    }

    const queueHigher: LeagueSimple[] = JSON.parse(JSON.stringify(league.higherLeagues));
    while (queueHigher.length > 0) {
      const top = queueHigher.shift()!;
      if (league.lowerLeagues.findIndex((x) => x.id === top.id) !== -1) {
        return true;
      }
      const higherLeagues = this.originLeagues.find((x) => x.id === top.id)!.higherLeagues;
      higherLeagues.forEach((x) => {
        queueHigher.unshift(JSON.parse(JSON.stringify(x)));
      });
    }

    return false;
  }

  getLeaguesDataSelector(isHigherLeague: boolean, league: League): LeagueSimple[] {
    let result: LeagueSimple[] = [];
    let leagueOrigin = this.originLeagues.find((x) => x.id === league.id)!;
    for (let item of this.originLeagues.filter((x) => x.countryId === league.countryId)) {
      let simpleLeague = new LeagueSimple();
      simpleLeague.id = item.id!;
      simpleLeague.name = item.name!;
      result.push(simpleLeague);
    }

    return this.simpleLeagues.filter((s) =>
      this.originLeagues
        .filter(
          (o1) =>
            (o1.countryId === league.countryId &&
              o1.id !== league.id &&
              (isHigherLeague
                ? !this.getAllHigherThanLeagues(league)
                    .filter((x) => !leagueOrigin.higherLeagues.some((x2) => x.id == x2.id))
                    .find((o2) => o2.id === o1.id) && !this.getAllLowerThanLeagues(league).find((o2) => o2.id === o1.id)
                : !this.getAllLowerThanLeagues(league)
                    .filter((x) => !leagueOrigin.lowerLeagues.some((x2) => x.id == x2.id))
                    .find((o2) => o2.id === o1.id) &&
                  !this.getAllHigherThanLeagues(league).find((o2) => o2.id === o1.id))) ||
            (isHigherLeague && league.higherLeagues.some((x) => x.id === o1.id)) ||
            (!isHigherLeague && league.lowerLeagues.some((x) => x.id === o1.id))
        )
        .some((o2) => s.id === o2.id)
    );
  }

  getHigherLeagues(leagueId?: number): League[] {
    if (leagueId === undefined) {
      return [];
    }
    let higherLeagueIds = this.originLeagues.filter((x) => x.id === leagueId)[0].higherLeagues!.flatMap((x2) => x2.id);
    return this.originLeagues.filter((x) => higherLeagueIds.includes(x.id!));
  }

  getHigherSimpleLeagues(leagueId: number): LeagueSimple[] {
    let higherLeagueIds = this.originLeagues.filter((x) => x.id === leagueId)[0].higherLeagues!.flatMap((x2) => x2.id);
    return this.simpleLeagues.filter((x) => higherLeagueIds.includes(x.id));
  }

  getAllHigherThanLeagues(league: League): LeagueSimple[] {
    let simpleLeague = this.simpleLeagues.filter((x) => x.id === league.id)[0];
    let leagues = this.getHigherLeagues(league.id!);
    if (leagues.length === 0) {
      return [];
    }
    const queue: LeagueSimple[] = [];
    queue.push(simpleLeague);

    const results: LeagueSimple[] = [];

    while (queue.length > 0) {
      const first = queue.shift()!;
      const more = this.getHigherSimpleLeagues(first.id!).filter(
        (it) => results.find((that) => that.id === it.id) == null
      );

      if (more.length > 0) {
        queue.push(...more);
      }
      results.push(first);
    }

    return results;
  }

  getLowerLeagues(leagueId?: number): League[] {
    if (leagueId === undefined) {
      return [];
    }
    let lowerLeagueIds = this.originLeagues.filter((x) => x.id === leagueId)[0].lowerLeagues!.flatMap((x2) => x2.id);
    return this.originLeagues.filter((x) => lowerLeagueIds.includes(x.id!));
  }

  getLowerSimpleLeagues(leagueId: number): LeagueSimple[] {
    let lowerLeagueIds = this.originLeagues.filter((x) => x.id === leagueId)[0].lowerLeagues!.flatMap((x2) => x2.id);
    return this.simpleLeagues.filter((x) => lowerLeagueIds.includes(x.id));
  }

  getAllLowerThanLeagues(league: League): LeagueSimple[] {
    let simpleLeague = this.simpleLeagues.filter((x) => x.id === league.id)[0];
    let leagues = this.getLowerLeagues(league.id!);
    if (leagues.length === 0) {
      return [];
    }
    const queue: LeagueSimple[] = [];
    queue.push(simpleLeague);

    const results: LeagueSimple[] = [];

    while (queue.length > 0) {
      const first = queue.shift()!;
      const more = this.getLowerSimpleLeagues(first.id!).filter(
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
