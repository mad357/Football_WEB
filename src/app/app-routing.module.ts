import { LeagueComponent } from './components/league/league.component';
import { LoginComponent } from './components/login/login.component';
import { LoginModule } from './components/login/login.module';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeagueModule } from './components/league/league.module';
import { AuthorizationGuard } from './guards/authorization.guard';
import { ClubModule } from './components/club/club.module';
import { ClubComponent } from './components/club/club.component';

const routes: Routes = [
  {
    path: '',
    component: LeagueComponent,
    canActivate: [AuthorizationGuard],
  },
  {
    path: 'league',
    component: LeagueComponent,
    canActivate: [AuthorizationGuard],
  },
  {
    path: 'club',
    component: ClubComponent,
    canActivate: [AuthorizationGuard],
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
