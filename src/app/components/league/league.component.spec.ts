import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { LeagueComponent } from './league.component';
import { LeagueService } from './league.service';
import { OverlayModule } from '@angular/cdk/overlay';
import { League } from 'src/app/models/league';
import { UserService } from '../user/user.service';
import { AppComponent } from 'src/app/app.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpEvent, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';

class MockUserService {
  userObservable = of(/* mock user data */);
}
class MockAppComponent {}

describe('LeagueComponent', () => {
  let component: LeagueComponent;
  let fixture: ComponentFixture<LeagueComponent>;
  let leagueService: LeagueService;
  let mockLeagues: League[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeagueComponent],
      imports: [
        HttpClientTestingModule,
        OverlayModule,
        MatAutocompleteModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatPaginatorModule,
        MatIconModule,
        MatTableModule,
        MatSortModule,
        BrowserAnimationsModule,
      ],
      providers: [
        MatSnackBar,
        { provide: UserService, useClass: MockUserService }, // Provide the mock service
        { provide: AppComponent, useClass: MockAppComponent }, // Provide the mock AppComponent
      ],
    });

    fixture = TestBed.createComponent(LeagueComponent);
    component = fixture.componentInstance;
    leagueService = TestBed.inject(LeagueService);
    mockLeagues = [
      new League(JSON.stringify(" id: 1, name: 'League 1' ")),
      new League(JSON.stringify(" id: 2, name: 'League 2' ")),
      new League(JSON.stringify(" id: 3, name: 'Another League'")),
    ] as League[];
    mockLeagues.forEach((item) => {
      item['editMode'] = false;
    });
  });

  it('should initialize leagues and originLeagues', () => {
    expect(component.leagues).toEqual([]);
    expect(component.originLeagues).toEqual([]);
  });

  it('should fetch and set leagues during ngOnInit', fakeAsync(() => {
    spyOn(leagueService, 'list').and.returnValue(of(mockLeagues));
    component.ngOnInit();
    tick();


    expect(component.leagues).toEqual(mockLeagues);
    expect(component.originLeagues).toEqual(mockLeagues);
  }));

  it('should filter leagues by name', fakeAsync(() => {
    component.ngOnInit();
    spyOn(leagueService, 'list').and.callFake((filter) => {
      expect(filter.name).toBe('League 1');
      return of(mockLeagues.filter((x) => x.name === 'League 1'));
    });

    component.filter.name = 'League 1';
    component.search();

    expect(component.leagues).toEqual(mockLeagues.filter((x) => x.name === 'League 1'));
  }));

  it('should announce sorting changes', () => {
    const sort: Sort = { active: 'name', direction: 'asc' };
    const liveAnnouncerSpy = jasmine.createSpyObj('LiveAnnouncer', ['announce']);
    component['_liveAnnouncer'] = liveAnnouncerSpy;
    component.sortChange(sort);

    expect(liveAnnouncerSpy.announce).toHaveBeenCalledWith(`Sorted column label.name asc`);
  });

  it('should announce sorting cleared', () => {
    const sort: Sort = { active: 'name', direction: '' };

    const liveAnnouncerSpy = jasmine.createSpyObj('LiveAnnouncer', ['announce']);
    component['_liveAnnouncer'] = liveAnnouncerSpy;
    component.sortChange(sort);

    expect(liveAnnouncerSpy.announce).toHaveBeenCalledWith('Sorting cleared');
  });

  it('should add a new league', fakeAsync(() => {
    const initialLeaguesLength = component.leagues.length;
    component.add();
    tick();

    expect(component.leagues.length).toBe(initialLeaguesLength + 1);
    expect(component.leagues[0]['editMode']).toBe(true);
  }));

  it('should save changes for a new league', fakeAsync(() => {
    const okResponse: HttpResponse<Response> = new HttpResponse({
      headers: new HttpHeaders({ Location: 'https://localhost:8090/football/league/10' }),
      status: 201,
      url: 'https://localhost:8090/football/league/10',
    });
    const spyCreate = spyOn(leagueService, 'create').and.returnValue(of(okResponse));
    const initialLeaguesLength = component.leagues.length;
    component.add();
    tick();

    component.leagues[0].name = 'new league name';
    const spyGet = spyOn(leagueService, 'getByLocation').and.returnValue(
      of({ name: 'new league name', ['editMode']: false } as unknown as League)
    );

    component.save(component.leagues[0]);

    // Use tick to wait for asynchronous operations inside save to complete
    tick();

    // Expect the leagues length to remain the same (new league added successfully)
    expect(component.leagues.length).toBe(initialLeaguesLength + 1);

    // Expect the create method to be called with the correct league
    expect(spyCreate).toHaveBeenCalledWith(component.leagues[0]);

    //Expect the httpClient.request method to be called with the correct parameters
    expect(spyGet).toHaveBeenCalledWith('https://localhost:8090/football/league/10');

    expect(component.originLeagues.length).toBe(initialLeaguesLength + 1);

    // Ensure that any async tasks are complete
    flush();
  }));

  afterEach(() => {
    fixture.destroy();
  });
});
