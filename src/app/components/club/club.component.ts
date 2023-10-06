import { AppComponent } from './../../app.component';
import { LeagueFilter } from '../league/league.component';
import { ClubService } from './club.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription, lastValueFrom } from 'rxjs';
import { Club } from 'src/app/models/club';
import { ClubDeletedEvent, ClubEvent } from './club-event';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { LeagueService } from '../league/league.service';
import { League, LeagueSimple } from 'src/app/models/league';
import { Country } from 'src/app/models/country';
import { CountryService } from '../league/country.service';
import { ConfirmDialogComponent } from 'src/app/shared/alert-dialog/confirm-dialog.component';

interface SortOption {
  key: string;
  value: string;
}

const FULLNAME: SortOption = { key: $localize`sorting.fullname`, value: 'fullname' };
const NAME: SortOption = { key: $localize`sorting.name`, value: 'name' };
const ALIAS: SortOption = { key: $localize`sorting.alias`, value: 'alias' };
@Component({
  selector: 'app-club',
  templateUrl: './club.component.html',
  styleUrls: ['./club.component.css'],
})
export class ClubComponent implements OnInit, OnDestroy {
  limit = 10;
  total = 0;
  page = 0;
  sortOption = FULLNAME;
  sortOptions = [ALIAS, NAME, FULLNAME];
  ascending = true;
  items: Club[] = [];

  leagueListFilter: LeagueSimple[] = [];
  leagueFilter?: LeagueSimple;
  countryListFilter: Country[] = [];
  countryFilter?: Country;
  clubName?: String;
  yearFound?: number;

  private searchSubject = new Subject<void>();
  private action = Subscription.EMPTY;
  private subscriptions: Subscription[] = [];

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private clubService: ClubService,
    private leagueService: LeagueService,
    private countryService: CountryService,
    public app: AppComponent
  ) {}

  async ngOnInit(): Promise<void> {
    this.search();
    this.leagueListFilter = await lastValueFrom(this.leagueService.listSimple());
    this.countryListFilter = await lastValueFrom(this.countryService.list());
    this.subscriptions.push(
      this.clubService.eventData.subscribe((event) => {
        if (event instanceof ClubDeletedEvent) {
          this.search();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((it) => it.unsubscribe());
    this.action.unsubscribe();
  }

  search(): void {
    this.action.unsubscribe();
    let params: any = {
      page: this.page,
      limit: this.limit,
      order: this.sortOption.value,
      ascending: this.ascending,
    };
    this.countryFilter?.id ? (params.countryId = this.countryFilter.id) : '';
    this.leagueFilter?.id ? (params.leagueId = this.leagueFilter.id) : '';
    this.clubName ? (params.clubName = this.clubName) : '';
    this.yearFound ? (params.yearFound = this.yearFound) : '';

    this.action = this.clubService.list(params).subscribe((results) => this.onSearchComplete(results));

    this.clubService.listSize(params).subscribe((result) => (this.total = result));
  }

  private onSearchComplete(results: Club[]): void {
    this.items = results;
  }

  async delete(clubId: number): Promise<void> {
    const config = new MatDialogConfig();
    config.width = '400px';
    config.data = {
      title: $localize`delete.dialog.title`,
      message: $localize`delete.dialog.msg ${'club'}`,
      applyText: $localize`button.confirm`,
      cancelText: $localize`button.cancel`,
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, config);
    const allow = (await lastValueFrom(dialogRef.afterClosed())) as boolean;

    if (!allow) {
      return;
    }
    this.clubService.delete(clubId).subscribe({
      next: (r) => {
        this.snackBar.open($localize`delete.success.club`, undefined, {
          duration: 5000,
        });
        this.router.navigate(['/club']);
      },
    });
  }

  stop(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
  }

  changePage(event: PageEvent): void {
    this.page = event.pageIndex;
    this.limit = event.pageSize;
    this.search();
  }

  clearClubName(): void {
    this.clubName = undefined;
    this.search();
  }

  clearYearFound(): void {
    this.yearFound = undefined;
    this.search();
  }

  sortBy(sortOption: SortOption): void {
    this.sortOption = sortOption;
    this.search();
  }

  reverseOrder(): void {
    this.ascending = !this.ascending;
    this.search();
  }
}
