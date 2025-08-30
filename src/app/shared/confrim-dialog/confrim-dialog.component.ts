import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-confrim-dialog',
  imports: [
    MatDialogModule
  ],
  templateUrl: './confrim-dialog.component.html',
  styleUrl: './confrim-dialog.component.scss'
})
export class ConfrimDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { title?: string, message?: string }) {}

}
