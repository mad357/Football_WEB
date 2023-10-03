import { ClubService } from '../club/club.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Club } from 'src/app/models/club';

@Injectable({
  providedIn: 'root',
})
export class ClubResolver implements Resolve<Club | undefined | null> {
  constructor(private clubService: ClubService) {}

  resolve(route: ActivatedRouteSnapshot): Club | undefined | null {
    const id = +route.params['id'];

    if (isNaN(id)) {
      return null;
    }

    return this.clubService.findById(id);
  }
}
