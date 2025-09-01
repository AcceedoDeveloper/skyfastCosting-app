import { Customer } from "./machine.model";

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
  rawMaterial?: string[];
  processSelection?: string[];
  noOfProcess?: number;
  noOfRawMaterial?: number;
   Rejection?: number;
  Packing?: string;
  InterestRate?: number;
  InspectorCost?: number;
  ToolAmbience?: string;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}
