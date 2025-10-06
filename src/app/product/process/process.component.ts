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
import { PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';

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
    MatSnackBarModule,
    MatPaginatorModule,
    FormsModule
  ],
  templateUrl: './process.component.html',
  styleUrl: './process.component.scss'
})
export class ProcessComponent implements OnInit {
  selectedFile: File | null = null;

  process$!: Observable<Process[]>;
   paginatedUsers: Process[] = [];
   filteredProcesses: Process[] = [];
    pageSize = 5;
  pageIndex = 0;
  allProcesses: Process[] = [];
  searchTerm: string = '';

  
  constructor(private store: Store, private fb: FormBuilder, private dialog: MatDialog, 
    private uploadService : ProductService, private snackBar: MatSnackBar, private tooser : ToastrService) {
  }

  ngOnInit(): void {

    this.process$ = this.store.select(selectAllProcess);
    this.process$.subscribe(process => {
      this.allProcesses = process;
    this.applyFilter();
      console.log('Process from store:', process);
    }
    ); 

    this.store.dispatch(processActions.loadProcess());
  }

  selectedProcessId: string | null = null;


 applyFilter() {
    if (!this.searchTerm) {
      this.filteredProcesses = this.allProcesses;
    } else {
      const lowerTerm = this.searchTerm.toLowerCase();
      this.filteredProcesses = this.allProcesses.filter(p =>
        p.processName.toLowerCase().includes(lowerTerm)
      );
    }
    this.pageIndex = 0; // reset paginator to first page
    this.updatePaginatedUsers();
  }
togglePopup(processId: string) {
  this.selectedProcessId = this.selectedProcessId === processId ? null : processId;
}

// calculateProcessValue(p: any): number {
//   const hours = Number(p.Hours) || 0;
//   const cycleTime = Number(p.cycleTime) || 1; // prevent divide by 0
//   const cavity = Number(p.cavity) || 1;
//   return (hours / 3600 / cycleTime) / cavity;
// }

updatePaginatedUsers() {
  const startIndex = this.pageIndex * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  this.paginatedUsers = this.filteredProcesses.slice(startIndex, endIndex);
}


  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedUsers();
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(AddProcessComponent, {
      width: '600px',
      height:'auto',
      maxWidth: '45vw', 
      disableClose:true,
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
      data: { process },
       disableClose:true,
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
        this.tooser.success('Process updated successfully!');
        this.store.dispatch(processActions.loadProcess());
      },
      error: (err) => {
        console.error('Upload error:', err);
        alert('Upload failed!');
      }
    });
  }

}
