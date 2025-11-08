import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface Process {
  processName: string;
  TonnageJaw: string;
  Hours: number;
  machineCentre: number;
  count: number;
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-process-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Process Details</h2>
    <mat-dialog-content>
      <div class="process-table-container" *ngIf="processes.length > 0">
        <table mat-table [dataSource]="processes" class="process-table">
          <!-- Process Name Column -->
          <ng-container matColumnDef="processName">
            <th mat-header-cell *matHeaderCellDef>Process Name</th>
            <td mat-cell *matCellDef="let process">{{ process.processName }}</td>
          </ng-container>

          <!-- Tonnage Jaw Column -->
          <ng-container matColumnDef="tonnageJaw">
            <th mat-header-cell *matHeaderCellDef>Tonnage / Jaw</th>
            <td mat-cell *matCellDef="let process">{{ process.TonnageJaw }}</td>
          </ng-container>

          <!-- Hours Column -->
          <ng-container matColumnDef="hours">
            <th mat-header-cell *matHeaderCellDef>Hours</th>
            <td mat-cell *matCellDef="let process">{{ process.Hours }}</td>
          </ng-container>

          <!-- Machine Centre Column -->
          <ng-container matColumnDef="machineCentre">
            <th mat-header-cell *matHeaderCellDef>Machine Centre</th>
            <td mat-cell *matCellDef="let process">{{ process.machineCentre }}</td>
          </ng-container>

          <!-- Count Column -->
          <ng-container matColumnDef="count">
            <th mat-header-cell *matHeaderCellDef>Count</th>
            <td mat-cell *matCellDef="let process">{{ process.count }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
      <div class="no-data" *ngIf="processes.length === 0">
        <p>No process data available</p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>
        <mat-icon>close</mat-icon>
        Close
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      padding: 20px;
      min-height: 200px;
      max-height: 600px;
      overflow-y: auto;
    }

    .process-table-container {
      width: 100%;
      overflow-x: auto;
    }

    .process-table {
      width: 100%;
    }

    .process-table th {
      background-color: #f8f9fa;
      font-weight: 600;
      color: #333;
      padding: 12px 16px;
      text-align: left;
    }

    .process-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .process-table tr:hover {
      background-color: #f9f9f9;
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
    }

    mat-dialog-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class ProcessDetailsDialogComponent {
  processes: Process[] = [];
  displayedColumns: string[] = ['processName', 'tonnageJaw', 'hours', 'machineCentre', 'count'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { processes: Process[] },
    public dialogRef: MatDialogRef<ProcessDetailsDialogComponent>
  ) {
    this.processes = data?.processes || [];
  }
}

