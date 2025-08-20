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


export interface User {
  _id: string;
  fullName: string;
  userName: string;
  password: string;
  emailId: string;
  phoneNumber: string;
  role: any;   // can be Role object or string depending on API
  deleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
  token?: string;
}
