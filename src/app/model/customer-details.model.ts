import { Customer } from "./machine.model";

export interface Process {
  processId: string;
  processName: string;
  TonnageJaw?: string;
  Hours?: number;
  cycleTime?: number;
  cavity?: number;
  cost?: number;
  calculation?: number;
}

export interface RawMaterial {
  _id?: string;
  GradeName: string;
  gradeName?: string;
  RatePerKg: number;
  ratePerKg?: number;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}


export interface Revision {
  _id?: string;
  revisionNumber: number;
  revisionName?: string;
  Rejection: number;
  InterestRate: number;
  InspectorCost: number;
  Freight:string;
  ModeOfTransport:string
  Packing: string;
  ToolAmbience: string;
  scrapIncluded:boolean;
  meltPerKg:number;
  scrapRecoverable:number;
  castingWeight: number;
  cavities: number;
  meltingLoss: number;
  shortWeight: number;
  grossWeight:number;
  rawMaterial?: RawMaterial[];
  processes?: Process[];
  productName: string;
  selected?: boolean;
  noOfProcess?: number;
  noOfRawMaterial?: number;
  packingPercentage?: number;
  packingRate?: number;
  overHeadsPercent: number;
  DieLifeTime?: number;
  CMMInspection: number;
  DieMaintenance:string;
  Inspection:string;
  WIPPartsHandlingTray:string;
  PaymentTerms:string;
  DeliveryTerms:string;
  Insurance: number;
  SeaPacking: number;
  Payment90DaysICC: number;
  currency: string;
  includeRejections?: boolean;
  commercialTermsParams?: Record<string, string>;
  transpotationParams?: Record<string, string>;
  rejectionParams?: Record<string, string>;
  otherParams?: Record<string, string>;
  Status?: string;
}


export interface CustomerDetails {
  _id?: string; // optional before save
  customerId: Customer; 
  customerName: Customer;
  drawingImage?: string;  
  productName: string;
  partName: string;
  drawingNo: number;
  cavities: number;
  castingWeight: number;
  shortWeight: number;
  meltingLoss: number;
  rawMaterial?: RawMaterial[]; 
  processSelection?: string[];
  processes?: Process[];
   Rejection?: number;
  Packing?: string;
  InterestRate?: number;
  InspectorCost?: number;
  Freight?:string;
  ModeOfTransport?:string;
 CMMInspection: number,
    Insurance: number,
    SeaPacking: number,
    Payment90DaysICC: number
  ToolAmbience?: string;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
  revisions: Revision[];
  
 
  

}


export interface Quotation {
  customer: string;
  email: string;
  partName: string;
  status: string;
  sentAt: string;
  sentAtDate?: Date; // Store original date for easier filtering
  actualCost: number;
  difference: number;
  revisionNumber?: number;
  revisionName?: string;
}

export interface PaginatedCustomerResponse {
  metadata: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filtersApplied: {
    StartDate: string | null;
    EndDate: string | null;
    customerName: string | null;
    partName: string | null;
    drawingNo: string | null;
  };
  data: CustomerDetails[];
}

export interface CustomerFilters {
  StartDate?: string;
  EndDate?: string;
  customerName?: string;
  partName?: string;
  drawingNo?: string;
  page?: number;
  limit?: number;
}
