export interface MachineType {
  _id?: string;           // Optional for creation
  name: string;
  lowercaseName?: string; // Backend can set this
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}
