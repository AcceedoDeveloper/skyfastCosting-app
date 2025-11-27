export interface RawMaterial {
  _id: string;
  GradeName: string;
  gradeName?: string;
  RatePerKg: number;
  ratePerKg?: number;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}


// model/process.model.ts
export interface Process {
  _id: string;
  processName: string;
  TonnageJaw: string;
  Hours: string;
  cavity: number;
  cycleTime: string;
  calculation: number;
  cost?: number;
  machineCentre: number;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}
