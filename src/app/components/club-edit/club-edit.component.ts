import { LeagueService } from '../league/league.service';
import { HostListener, Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { Club } from 'src/app/models/club';
import { Country } from 'src/app/models/country';
import { CountryService } from '../league/country.service';
import { League, LeagueSimple } from 'src/app/models/league';
import { Observable, lastValueFrom } from 'rxjs';
import { ClubService } from '../club/club.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-club-edit',
  templateUrl: './club-edit.component.html',
  styleUrls: ['./club-edit.component.css'],
})
export class ClubEditComponent implements OnInit {
  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.anyChanges();
  }

  isNew: boolean;
  formGroup: UntypedFormGroup = this.fb.group({});
  club!: Club;
  contryList: Country[] = [];
  leagueList: League[] = [];
  leagueSimpleList: LeagueSimple[] = [];
  isBusy = false;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private countryService: CountryService,
    private leagueService: LeagueService,
    private clubService: ClubService,
    public app: AppComponent
  ) {
    this.isNew = router.url.includes('/new');
    if (this.isNew) {
      this.club = new Club();
    } else {
      this.club = route.snapshot.data['club'];
    }
  }
  //reactive forms
  ngOnInit(): void {
    this.countryService.list().subscribe((result) => {
      this.contryList = result;
    });
    this.leagueService.list().subscribe((result) => {
      this.leagueList = result.map((x) => Object.assign(new League(), x));
      this.leagueList.forEach((item) => {
        this.leagueSimpleList.push(item.toSimpleLeague());
      });
    });
    this.initForm();
  }

  initForm(): void {
    this.formGroup = this.fb.group({
      name: [this.club.name, Validators.required],
      fullname: [this.club.fullname, Validators.required],
      alias: [this.club.alias],
      yearFound: [this.club.yearFound, [Validators.pattern('^[0-9]*$'), Validators.max(new Date().getFullYear())]],
      countryId: [this.club.country?.id, Validators.required],
      leagueId: [this.club.leagueShort?.id, Validators.required],
    });
    if (!this.app.user!.hasRole('admin')) {
      this.formGroup.disable();
    }
  }

  assignFormToClub(): void {
    const value = this.formGroup.getRawValue();
    this.club.name = value.name;
    this.club.fullname = value.fullname;
    this.club.alias = value.alias;
    this.club.yearFound = value.yearFound;
    this.club.country = this.contryList.find((x) => x.id === value.countryId);
    this.club.leagueShort = this.leagueSimpleList.find((x) => x.id === value.leagueId);
  }

  anyChanges(): boolean {
    const value = this.formGroup.getRawValue();
    if (this.club.name != value.name) {
      return true;
    }
    if (this.club.fullname != value.fullname) {
      return true;
    }
    if (this.club.alias != value.alias) {
      return true;
    }
    if (this.club.yearFound != value.yearFound) {
      return true;
    }
    let country = this.contryList.find((x) => x.id === value.countryId);
    if (this.club.country?.id != country?.id) {
      return true;
    }
    let league = this.leagueSimpleList.find((x) => x.id === value.leagueId);
    if (this.club.leagueShort?.id != league?.id) {
      return true;
    }

    return false;
  }

  isLeagueInCountry(itemId: number): boolean {
    if (itemId === null) {
      return true;
    }
    let league = this.leagueList.find((x) => x.id === itemId)!;
    const value = this.formGroup.getRawValue();
    if (value.countryId === null || value.countryId === league?.countryId) {
      return true;
    } else {
      return false;
    }
  }

  save(): void {
    this.isBusy = true;
    this.assignFormToClub();
    if (this.isNew) {
      this.clubService.create(this.club).subscribe({
        next: (r) => {
          this.snackBar.open($localize`save.success.club`, undefined, {
            duration: 5000,
          });
          this.router.navigate(['/club']);
        },
        error: (e) => {
          this.isBusy = false;
        },
      });
    }
    else {
      this.clubService.update(this.club).subscribe({
        next: (r) => {
          this.snackBar.open($localize`save.success.club`, undefined, {
            duration: 5000,
          });
          this.router.navigate(['/club']);
        },
        error: (e) => {
          this.isBusy = false;
        },
      });
    }
  }

  canSave(): boolean {
    if (this.isBusy) {
      return false;
    }

    return this.formGroup.valid;
  }
}
