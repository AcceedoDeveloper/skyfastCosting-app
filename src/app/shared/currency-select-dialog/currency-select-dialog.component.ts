import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-currency-select-dialog',
  imports: [
    MatDialogModule
  ],
  templateUrl: './currency-select-dialog.component.html',
  styleUrl: './currency-select-dialog.component.scss'
})
export class CurrencySelectDialogComponent {
  // `currency` is the revision's foreign currency, e.g. USD
  constructor(@Inject(MAT_DIALOG_DATA) public data: { currency: string }) {}
}
