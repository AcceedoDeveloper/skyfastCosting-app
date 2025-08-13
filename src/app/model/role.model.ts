
export interface Role {
  _id: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}


export interface Department {
  _id: string;
  department: string;
  departmentCode: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}
