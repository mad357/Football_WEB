import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClubComponent } from './club.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { ClubEditComponent } from '../club-edit/club-edit.component';

@NgModule({
  declarations: [ClubComponent, ClubEditComponent],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatRippleModule,
    MatSelectModule,
    MatTooltipModule,
    RouterModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatBadgeModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTabsModule,
    MatGridListModule,
    MatRadioModule,
    MatDatepickerModule,
    MatButtonToggleModule,
    MatAutocompleteModule,
    MatExpansionModule,
    MatDialogModule,
  ],
})
export class ClubModule {}
