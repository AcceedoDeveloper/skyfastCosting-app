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
  RatePerKg: number;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}


export interface Revision {
  revisionNumber: number;
  Rejection: number;
  InterestRate: number;
  InspectorCost: number;
  Freight:string;
  ModeOfTransport:string

  Packing: string;
  ToolAmbience: string;
  castingWeight: number;
  cavities: number;
  meltingLoss: number;
  shortWeight: number;
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
      CMMInspection: number,
    Insurance: number,
    SeaPacking: number,
    Payment90DaysICC: number,
    currency: string
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
