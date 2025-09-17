import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as processActions from '../store/product.actions';
import { selectAllProcess } from '../store/product.selectors';
import { Process } from '../../model/product.model';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AddProcessComponent } from './add-process/add-process.component';
import { ConfrimDialogComponent} from '../../shared/confrim-dialog/confrim-dialog.component';
import { ProductService} from '../../services/product.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-process',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './process.component.html',
  styleUrl: './process.component.scss'
})
export class ProcessComponent implements OnInit {
  selectedFile: File | null = null;

  process$!: Observable<Process[]>;
  
  constructor(private store: Store, private fb: FormBuilder, private dialog: MatDialog, 
    private uploadService : ProductService, private snackBar: MatSnackBar, private tooser : ToastrService) {
  }

  ngOnInit(): void {

    this.process$ = this.store.select(selectAllProcess);
    this.process$.subscribe(process => {
      console.log('Process from store:', process);
    }
    ); 

    this.store.dispatch(processActions.loadProcess());
  }

  selectedProcessId: string | null = null;



togglePopup(processId: string) {
  this.selectedProcessId = this.selectedProcessId === processId ? null : processId;
}

// calculateProcessValue(p: any): number {
//   const hours = Number(p.Hours) || 0;
//   const cycleTime = Number(p.cycleTime) || 1; // prevent divide by 0
//   const cavity = Number(p.cavity) || 1;
//   return (hours / 3600 / cycleTime) / cavity;
// }



  openAddDialog() {
    const dialogRef = this.dialog.open(AddProcessComponent, {
      width: '600px',
      height:'auto',
      maxWidth: '45vw', 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(processActions.addProcess({ process: result }));
      }
    });
  }

  openEditDialog(process: Process) {
    const dialogRef = this.dialog.open(AddProcessComponent, {
      width: '600px',
      height:'auto',
      data: { process }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('update data', result);
         const payload = {
      processName: result.processName,
      machineCentre: result.machineCentre,
      TonnageJaw: result.TonnageJaw,
      Hours: result.Hours
    };


    console.log('data', payload);


    this.uploadService.updateProcess(result._id, payload).subscribe({
        next: (updated) => {
          console.log('Process updated successfully', updated);
          this.tooser.success('Process updated successfully!');
          this.store.dispatch(processActions.loadProcess());
        },
        error: (err) => {
          console.error('Error updating process', err);
          this.tooser.error('Failed to update process.');

        }
      });
    
        
        // this.store.dispatch(
        //   processActions.updateProcess({ id: process._id, process: payload })
        // );
      }
    });
  }

onDelete(id: string) {
  const dialogRef = this.dialog.open(ConfrimDialogComponent, {
    width: '350px',
    data: {
      title: 'Delete Process',
      message: 'Are you sure you want to delete this process?'
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'confirm') {
      this.store.dispatch(processActions.deleteProcess({ id }));
    } 
  });
}
 onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

 onUpload(): void {
      if (!this.selectedFile) {
      this.snackBar.open('Please select a file first!', 'Close', {
        duration: 3000, 
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar']
      });
      return;
    }

    this.uploadService.uploadFile(this.selectedFile).subscribe({
      next: (res) => {
        console.log('Upload success:', res);
        this.store.dispatch(processActions.loadProcess());
      },
      error: (err) => {
        console.error('Upload error:', err);
        alert('Upload failed!');
      }
    });
  }

}
