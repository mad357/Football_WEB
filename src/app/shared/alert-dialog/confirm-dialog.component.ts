import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent implements OnInit {
  title: string;

  message: string;

  applyText: string;

  cancelText: string;

  constructor(@Inject(MAT_DIALOG_DATA) private data: any) {
    this.title = this.data.title;
    this.message = this.data.message;
    this.applyText = this.data.applyText;
    this.cancelText = this.data.cancelText;
  }

  ngOnInit(): void {
    if (this.cancelText == null) {
      const key = this.data.applyText ? 'cancel' : 'close';
      this.cancelText = 'test';
    }
  }
}
