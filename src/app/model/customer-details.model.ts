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
}


export interface CustomerDetails {
  _id?: string; // optional before save
  customerId: Customer; 
  customerName: Customer;
  productName: string;
  partName: string;
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
  ToolAmbience?: string;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
  revisions: Revision[];
  

}
