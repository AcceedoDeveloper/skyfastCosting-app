export interface Company {
  _id: string;
  companyName: string;
  companySlogan: string;
  companyAddress: string;
  companyGSTNumber: string;
  backupEmailId?: string;
  backupTiming?: string;
  meltScrapPercentage?: number;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}
