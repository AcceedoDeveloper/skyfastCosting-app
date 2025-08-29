export interface RawMaterial {
  _id: string;
  GradeName: string;
  RatePerKg: number;
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
  cost: number;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}
