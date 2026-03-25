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
import { PageEvent, MatPaginatorIntl } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { ProcessPaginatorIntl } from '../../shared/process-paginator-intl.service';

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
  providers: [
    { provide: MatPaginatorIntl, useClass: ProcessPaginatorIntl }
  ],
  templateUrl: './process.component.html',
  styleUrl: './process.component.scss'
})
export class ProcessComponent implements OnInit {
  selectedFile: File | null = null;
  isUploading: boolean = false;
  uploadSuccess: boolean = false;
  uploadProgress: number = 0;
  isDownloading: boolean = false;

  process$!: Observable<Process[]>;
   paginatedUsers: Process[] = [];
   filteredProcesses: Process[] = [];
    pageSize = 10;
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
      width: '520px',
      height:'auto',
      maxWidth: '45vw', 
      disableClose:true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // Dialog closed successfully - reload processes
        this.store.dispatch(processActions.loadProcess());
      }
      // If result is false or null, dialog was cancelled or error occurred
      // Error handling is done in AddProcessComponent
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
      if (result === true) {
        // Dialog closed successfully - reload processes
        this.store.dispatch(processActions.loadProcess());
      }
      // If result is false or null, dialog was cancelled or error occurred
      // Error handling is done in AddProcessComponent
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
    this.uploadSuccess = false;
    this.uploadProgress = 0;
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

    this.isUploading = true;
    this.uploadSuccess = false;
    this.uploadProgress = 0;

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      }
    }, 200);

    this.uploadService.uploadFile(this.selectedFile).subscribe({
      next: (res) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        console.log('Upload success:', res);
        this.tooser.success('File uploaded successfully!');
        this.store.dispatch(processActions.loadProcess());
        
        // Show success state
        this.isUploading = false;
        this.uploadSuccess = true;
        
        // Reset after 3 seconds
        setTimeout(() => {
          this.uploadSuccess = false;
          this.selectedFile = null;
          this.uploadProgress = 0;
        }, 3000);
      },
      error: (err) => {
        clearInterval(progressInterval);
        this.uploadProgress = 0;
        this.isUploading = false;
        this.uploadSuccess = false;
        console.error('Upload error:', err);
        this.tooser.error('Upload failed! Please try again.');
      }
    });
  }

  onDownload(): void {
    if (this.isDownloading) {
      return;
    }

    this.isDownloading = true;
    
    this.uploadService.downloadProcessExcel().subscribe({
      next: (blob: Blob) => {
        // Create a blob URL and trigger download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Process_List_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url); // cleanup
        
        this.tooser.success('File downloaded successfully!');
        this.isDownloading = false;
      },
      error: (err) => {
        console.error('Download error:', err);
        this.tooser.error('Download failed! Please try again.');
        this.isDownloading = false;
      }
    });
  }

}
