// pdf-view.component.ts
import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { ConfigService } from '../../../shared/config.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-pdf-view',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './pdf-view.component.html',
  styleUrl: './pdf-view.component.scss'
})
export class PdfViewComponent implements OnInit {
  quotationData: any;
  domesticpdf = false;
  pdfwithouticon = false;
  domesticpdfwithouticon = false;
  isDialogMode = false;
  customerName: string = '';
  partName: string = '';
  revision: number = 0;

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { customerName: string; partName: string; revision: number } | null,
    @Optional() private dialogRef: MatDialogRef<PdfViewComponent>,
    private productService: ProductService,
    private config: ConfigService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Check if component is used as dialog or route
    this.isDialogMode = !!this.data && !!this.dialogRef;
  }

  // The currency the quotation is priced in. Empty = whatever the revision was
  // quoted in; the download passes an explicit one (e.g. "INR" or "USD") and the
  // server converts every cost figure to it.
  requestedCurrency = '';

  private applyCurrencySelection(raw: string | null): void {
    const picked = (raw || '').split(',').map(c => c.trim().toUpperCase()).filter(Boolean);
    this.requestedCurrency = picked[0] || '';

    // logged so the PDF renderer can forward it to the server console, and
    // stamped on window so savePDF can read it back after the page loads
    const flags = { rawParam: raw, picked, requestedCurrency: this.requestedCurrency };
    console.log('[pdf-view] currency selection', JSON.stringify(flags));
    (window as any).__pdfCurrencyFlags = flags;
  }

  ngOnInit(): void {
    if (this.isDialogMode) {
      // Dialog mode - use injected data
      this.customerName = this.data!.customerName;
      this.partName = this.data!.partName;
      this.revision = this.data!.revision;
      this.fetchQuotationData();
    } else {
      // Route mode - get data from query params
      this.route.queryParamMap.pipe(
        switchMap(params => {
          // Handle both lowercase and capitalized parameter names for compatibility
          this.customerName = params.get('CustomerName') || params.get('customerName') || '';
          this.partName = params.get('partName') || '';
          this.revision = parseInt(params.get('Revision') || params.get('revision') || '0', 10);
          this.applyCurrencySelection(params.get('currencies'));
          
          if (!this.customerName || !this.partName || !this.revision) {
            console.error('Missing required query parameters', {
              customerName: this.customerName,
              partName: this.partName,
              revision: this.revision
            });
            return [];
          }
          
          return this.productService.quotationData(
            this.customerName, this.partName, this.revision, this.requestedCurrency
          );
        })
      ).subscribe({
        next: (res) => {
          if (res) {
            this.setQuotationData(res);
          }
        },
        error: (err) => {
          console.error('Error fetching quotation:', err);
        }
      });
    }
    this.downloadPDF();

  }

  private fetchQuotationData(): void {
    this.productService.quotationData(this.customerName, this.partName, this.revision, this.requestedCurrency)
      .subscribe({
        next: (res) => {
          this.setQuotationData(res);
        },
        error: (err) => {
          console.error('Error fetching quotation:', err);
        }
      });
  }

  private setQuotationData(res: any): void {
    this.quotationData = res;
    console.log('Quotation Data:', this.quotationData);
    
    // Determine which PDF view to show based on currency
    const hasCurrency = res.results[0]?.revisions[0]?.currency != null;
    if (hasCurrency) {
      this.pdfwithouticon = true;
      this.domesticpdf = false;
      this.domesticpdfwithouticon = false;
    } else {
      this.domesticpdfwithouticon = true;
      this.domesticpdf = false;
      this.pdfwithouticon = false;
    }
  }

  closeda() {
    if (this.isDialogMode && this.dialogRef) {
      this.dialogRef.close();
    } else {
      // Route mode - navigate back or close window
      this.router.navigate(['/product/quotation']);
    }
  }

  downloadPDF() {
    const params = {
      customerName: this.customerName,
      partName: this.partName,
      revision: this.revision
    };
  
    this.productService.downloadQuotationPDF(params).subscribe({
      next: ({ fileName }) => {
        const reportUrl = this.config.getCostingUrl('') + `get-report/${fileName}`;
        window.open(reportUrl, '_blank');
      },
      error: (err) => console.error('Error generating PDF:', err)
    });
  }

  getDrawingImage(): string {
    if (!this.quotationData?.results?.[0]?.drawingImage) {
      return '';
    }

    const api = this.config.getCostingUrl('');
    const imagePath = this.quotationData.results[0].drawingImage;
    
    // If already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Normalize path - add /uploads/ if it's just a filename
    let normalizedPath = imagePath;
    if (!imagePath.startsWith('/')) {
      normalizedPath = `/uploads/${imagePath}`;
    } else if (!imagePath.startsWith('/uploads/')) {
      normalizedPath = `/uploads${imagePath}`;
    }
    
    return api + encodeURI(normalizedPath);
  }

  // The server prices the whole quotation in one currency, so the cost cells just
  // print what came back — these say which currency that was and how to format it.
  get displayCurrency(): string {
    return this.quotationData?.results?.[0]?.revisions?.[0]?.displayCurrency || 'INR';
  }

  isForeignCurrencyQuotation(): boolean {
    return this.displayCurrency !== 'INR';
  }

  // foreign currency amounts are small enough to need the third decimal
  get costFormat(): string {
    return this.isForeignCurrencyQuotation() ? '1.2-3' : '1.2-2';
  }

  // ----- Total quoted price columns -----
  // The quoted-price row must always span 10 columns, so the optional cost
  // columns borrow their width from Total Labour Cost and Total price.

  showProfitOrToolColumn(revision: any): boolean {
    if (!revision) {
      return false;
    }
    return revision.scrapCredited === true
      ? true
      : Number(revision.toolCost || 0) !== 0;
  }

  showIccCostColumn(revision: any): boolean {
    return Number(revision?.iccCost || 0) !== 0;
  }

  showSettingCostColumn(revision: any): boolean {
    return revision?.settingCostApplicable === true
      && Number(revision?.settingCost || 0) !== 0;
  }

  private optionalTqpColumns(revision: any): number {
    return (this.showProfitOrToolColumn(revision) ? 1 : 0)
      + (this.showIccCostColumn(revision) ? 1 : 0)
      + (this.showSettingCostColumn(revision) ? 1 : 0);
  }

  // label(2) + net material(1) + labour + overheads + optional + total price = 10.
  private tqpColspans(revision: any): { labour: number; overheads: number; totalPrice: number } {
    const budget = 7 - this.optionalTqpColumns(revision);

    for (const [labour, overheads] of [[2, 2], [2, 1], [1, 1]]) {
      const totalPrice = budget - labour - overheads;
      if (totalPrice >= 1) {
        return { labour, overheads, totalPrice };
      }
    }
    return { labour: 1, overheads: 1, totalPrice: Math.max(1, budget - 2) };
  }

  getLabourColspan(revision: any): number {
    return this.tqpColspans(revision).labour;
  }

  getOverheadsColspan(revision: any): number {
    return this.tqpColspans(revision).overheads;
  }

  getTotalPriceColspan(revision: any): number {
    return this.tqpColspans(revision).totalPrice;
  }

  getTotalPriceValueColspan(revision: any): number {
    return this.tqpColspans(revision).totalPrice;
  }

  // the payment terms the ICC carrying cost was quoted on, e.g. "45 Days" -> 45
  getPaymentTermsDays(revision: any): number {
    if (revision?.paymentTermsDays != null) {
      return Number(revision.paymentTermsDays);
    }
    const match = String(revision?.PaymentTerms || '').match(/\d+/);
    return match ? Number(match[0]) : 0;
  }
}
