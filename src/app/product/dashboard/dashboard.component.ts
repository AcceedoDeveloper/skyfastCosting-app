import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { DashboardPaginatorIntl } from '../../shared/dashboard-paginator-intl.service';

interface Quotation {
  customer: string;
  email: string;
  partName: string;
  status: string;
  sentAt: string;
  actualCost: number;
  difference: number;
}

interface Activity {
  initials: string;
  avatarColor: string;
  description: string;
  date: string;
  time: string;
}

interface Update {
  role: string;
  category: string;
  dotColor: string;
}

interface Country {
  name: string;
  percentage: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatPaginatorModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: DashboardPaginatorIntl }
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  // Quotation Summary
  totalQuotations = 60;
  approvedQuotations = 42;
  pendingQuotations = 12;
  rejectedQuotations = 6;

  // Date picker
  selectedDate: string = new Date().toISOString().split('T')[0];

  // Quotations Table
  quotations: Quotation[] = [
    { customer: 'Acceedo', email: 'acceedo@gmail.com', partName: 'Partname-x', status: 'Pending', sentAt: '20/10/2025', actualCost: 2400000, difference: 5600 },
    { customer: 'Uniqueshell', email: 'uniqueshell@gmail.com', partName: 'Partname-x', status: 'Approved', sentAt: '21/10/2025', actualCost: 24056000, difference: 5500 },
    { customer: 'Skyfast', email: 'skyfast@gmail.com', partName: 'Partname-x', status: 'Approved', sentAt: '22/10/2025', actualCost: 2400000, difference: 5200 },
    { customer: 'Indo shell', email: 'indoshell@gmail.com', partName: 'Partname-x', status: 'Rejected', sentAt: '23/10/2025', actualCost: 2400000, difference: 5100 },
    { customer: 'Acceedo', email: 'acceedo@gmail.com', partName: 'Partname-x', status: 'Pending', sentAt: '24/10/2025', actualCost: 2400000, difference: 5000 },
    { customer: 'Uniqueshell', email: 'uniqueshell@gmail.com', partName: 'Partname-x', status: 'Approved', sentAt: '25/10/2025', actualCost: 24056000, difference: 4900 },
    { customer: 'Skyfast', email: 'skyfast@gmail.com', partName: 'Partname-x', status: 'Approved', sentAt: '26/10/2025', actualCost: 2400000, difference: 4800 },
    { customer: 'Indo shell', email: 'indoshell@gmail.com', partName: 'Partname-x', status: 'Pending', sentAt: '27/10/2025', actualCost: 2400000, difference: 4700 },
  ];

  paginatedQuotations: Quotation[] = [];
  pageSize = 5;
  pageIndex = 0;

  // Today Activity
  todayActivities: Activity[] = [
    { initials: 'EK', avatarColor: '#3b82f6', description: 'Indo shell payment', date: '04 April, 2021', time: '04:00 PM' },
    { initials: 'JH', avatarColor: '#8b5cf6', description: 'Uniqueshell delivery', date: '04 April, 2021', time: '03:30 PM' },
    { initials: 'AF', avatarColor: '#1e40af', description: 'Skyfast waiting for response', date: '04 April, 2021', time: '03:00 PM' },
    { initials: 'RP', avatarColor: '#60a5fa', description: 'Acceedo approved', date: '04 April, 2021', time: '02:30 PM' },
    { initials: 'SM', avatarColor: '#3b82f6', description: 'New quotation created', date: '04 April, 2021', time: '02:00 PM' },
  ];

  // Cost Estimation
  currencyRates = [
    { name: 'Indna (Ru)', value: '1' },
    { name: 'USD', value: '90' }
  ];

  // Recent Updates
  recentUpdates: Update[] = [
    { role: 'Admin', category: 'raw material', dotColor: '#10b981' },
    { role: 'Manager', category: 'Process', dotColor: '#86efac' },
    { role: 'Officer', category: 'Customer', dotColor: '#065f46' },
    { role: 'Admin', category: 'Role', dotColor: '#86efac' },
    { role: 'Manager', category: 'Department', dotColor: '#10b981' },
  ];

  // Sales by Countries
  salesByCountries: Country[] = [
    { name: 'Australia', percentage: '20%' },
    { name: 'Canada', percentage: '20%' },
    { name: 'France', percentage: '20%' },
    { name: 'Indonesia', percentage: '20%' },
    { name: 'Italy', percentage: '20%' },
  ];

  ngOnInit(): void {
    this.updatePaginatedQuotations();
  }

  updatePaginatedQuotations(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedQuotations = this.quotations.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedQuotations();
  }

  onSalesPageChange(event: PageEvent): void {
    // Handle sales pagination if needed
  }
}
