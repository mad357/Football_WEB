import { LeagueComponent } from './components/league/league.component';
import { LoginComponent } from './components/login/login.component';
import { LoginModule } from './components/login/login.module';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeagueModule } from './components/league/league.module';
import { AuthorizationGuard } from './guards/authorization.guard';
import { ClubModule } from './components/club/club.module';
import { ClubComponent } from './components/club/club.component';
import { ClubEditComponent } from './components/club-edit/club-edit.component';
import { ClubResolver } from './components/club-edit/club.resolver';

const routes: Routes = [
  {
    path: '',
    component: LeagueComponent,
    canActivate: [AuthorizationGuard],
    data: {
      roles: ['admin', 'user'],
    },
  },
  {
    path: 'league',
    component: LeagueComponent,
    canActivate: [AuthorizationGuard],
    data: {
      roles: ['admin', 'user'],
    },
  },
  {
    path: 'club',
    component: ClubComponent,
    canActivate: [AuthorizationGuard],
    data: {
      roles: ['admin', 'user'],
    },
  },
  {
    path: 'club/:id',
    component: ClubEditComponent,
    canActivate: [AuthorizationGuard],
    data: {
      roles: ['admin', 'user'],
    },
    resolve: {
      club: ClubResolver,
    }
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule, LeagueModule, LoginModule, ClubModule],
})
export class AppRoutingModule {}
