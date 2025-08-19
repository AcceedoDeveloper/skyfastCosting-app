
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

export interface Shift {
  _id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  createdAt: string;  // ISO Date string
  updatedAt: string;  // ISO Date string
  __v: number;
}


