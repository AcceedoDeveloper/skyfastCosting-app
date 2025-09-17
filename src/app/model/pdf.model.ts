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
  ToolAmbience: string | null;
  packingRate?: number | null;
  packingPercentage?: number | null;
  rawMaterialCost: number;
  rawMaterialWeight: number;
  sumOfProcessCost: number;
  RejectionCost: number;
  TotalProcessCost: number;
  overHeadsCost: number;
  TotalPrice: number;
  overHeadsPercent: number; 
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
}
