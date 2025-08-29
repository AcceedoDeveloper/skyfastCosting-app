export interface CustomerDetails {
  _id?: string; // optional before save
  customerId?: string;
  customerName: string;
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
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}
