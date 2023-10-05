import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { ConfirmDialogComponent } from './alert-dialog/confirm-dialog.component';

@NgModule({
  declarations: [ConfirmDialogComponent],
  imports: [BrowserModule, MatButtonModule, MatDialogModule],
  exports: [ConfirmDialogComponent],
})
export class SharedModule {}
