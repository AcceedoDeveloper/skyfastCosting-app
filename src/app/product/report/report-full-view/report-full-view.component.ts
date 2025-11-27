import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CustomerDetails } from '../../../model/customer-details.model';

@Component({
  selector: 'app-report-full-view',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './report-full-view.component.html',
  styleUrl: './report-full-view.component.scss'
})
export class ReportFullViewComponent implements OnInit, OnDestroy {
  customer: CustomerDetails | null = null;
  isLoading = true;
  errorMessage = '';
  private storageKey: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const viewId = params.get('viewId');
      if (!viewId) {
        this.errorMessage = 'Missing view reference.';
        this.isLoading = false;
        return;
      }

      this.storageKey = `reportFullView:${viewId}`;
      try {
        const payload = window?.localStorage?.getItem(this.storageKey);
        if (!payload) {
          this.errorMessage = 'No report data found for the provided reference.';
          this.isLoading = false;
          return;
        }
        this.customer = JSON.parse(payload);
      } catch (error) {
        console.error('Failed to load report data', error);
        this.errorMessage = 'Unable to load report data.';
      } finally {
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.storageKey) {
      window?.localStorage?.removeItem(this.storageKey);
    }
  }

  getCustomerName(customer: CustomerDetails | null): string {
    return customer?.customerName?.customerName || 'N/A';
  }

  getLatestRevision(customer: CustomerDetails | null): any {
    if (!customer?.revisions || customer.revisions.length === 0) {
      return null;
    }
    return customer.revisions[customer.revisions.length - 1];
  }

  formatDate(date: Date | string | undefined | null): string {
    if (!date) return 'N/A';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  }

  getCurrentDateString(): string {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

