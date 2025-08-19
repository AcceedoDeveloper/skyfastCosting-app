
export interface Role {
  _id: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  __v: number
}


export interface Department {
  _id: string;
  department: string;
  departmentCode: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

