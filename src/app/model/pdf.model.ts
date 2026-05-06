export interface CustomerResponse {
  message: string;
  CustomerName: string;
  partName: string;
  Revision: string;
  results: CustomerDetailss[];
}

export interface CustomerDetailss {
  _id: string;
  customerName: CustomerName;
  partName: string;
  revisions: Revision[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  drawingNo: string;
  drawingImage: string;
}

export interface CustomerName {
  _id: string;
  customerName: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Revision {
  _id: string;
  revisionNumber: number;
  productName: string;
  cavities: number;
  castingWeight: number;
  shortWeight: number;
  meltingLoss: number;
  Status: string;
  rawMaterial: RawMaterial[];
  noOfRawMaterials: number;
  processes: Process[];
  noOfProcess: number;
  Rejection: number;
  Packing: string | null;
  InterestRate: number | null;
  InspectorCost: number | null;
  Freight:string | null;
  ModeOfTransport:string | null;
  ToolAmbience: string | null;
  packingRate?: number | null;
  packingPercentage?: number | null;
  rawMaterialCost: number;
  IccNetMaterialCost:number;
  netMaterialCost: number;
  rawMaterialWeight: number;
  sumOfProcessCost: number;
  RejectionCost: number;
  TotalProcessCost: number;
  overHeadsCost: number;
  TotalPrice: number;
  overHeadsPercent: number; 
  revisionName: string;
  toolCost: number,
  PackingCost: number
  CMMInspection: number,
  Insurance: number,
  SeaPacking: number,
  Payment90DaysICC: number,
  currency: string,
sumOfProcessCostEUR: string;
sumOfProcessCostUSD: string;
RejectionCostEUR: string;
RejectionCostUSD: string;
TotalProcessCostEUR: string;
TotalProcessCostUSD: string;
TotalPriceEUR : string;
TotalPriceUSD : string;
}

export interface RawMaterial {
  _id: string;
  GradeName: string;
  RatePerKg: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Process {
  processId: string;
  processName: string;
  TonnageJaw: string;
  Hours: number;
  cycleTime: number;
  cost: number;
  cavity: number;
   HourlyOutput: number;
   ProcessCostEUR: number;
   ProcessCostUSD: number;
}
