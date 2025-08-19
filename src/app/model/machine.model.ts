export interface MachineType {
  _id: string;           // Optional for creation
  name: string;
  lowercaseName?: string; // Backend can set this
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}


// model/machine.model.ts
export interface Machine {
  _id: string;
  machineNumber: string;
  machineName: string;
  machineType: string;
  createdAt: string; // or Date if you want to convert it
  updatedAt: string; // or Date
  __v: number;
}


export interface Customer {
  _id: string;
  customerName: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
