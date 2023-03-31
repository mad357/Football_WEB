import { Component, OnInit, ViewChild } from '@angular/core';
import { League } from 'src/app/models/league';
import { LeagueService } from './league.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-league',
  templateUrl: './league.component.html',
  styleUrls: ['./league.component.css'],
})
export class LeagueComponent implements OnInit {
  isBusy = false;
  leagues: League[] = [];
  displayedColumns: string[] = ['countryName', 'name', 'actions'];
  dataSource = new MatTableDataSource<League>(this.leagues);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private leagueService: LeagueService, private _liveAnnouncer: LiveAnnouncer) {}

  ngOnInit(): void {
    this.leagueService.list().subscribe((leagues) => {
      this.leagues = leagues as League[];
      this.dataSource.data = leagues;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      leagues.forEach((item) => {
        item.editMode = false;
      });
    });
  }

  sortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
}
