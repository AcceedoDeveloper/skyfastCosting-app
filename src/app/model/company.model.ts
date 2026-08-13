export interface Company {
  _id: string;
  companyName: string;
  companySlogan: string;
  companyAddress: string;
  companyGSTNumber: string;
  backupEmailId?: string;
  backupTiming?: string;
  meltScrapPercentage?: number;
  paymentDaysPercentage?: number;
  quotationNumberPrefix?: string;
  quotationFormatNumber?: string;
  quotationFormatDate?: string;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}
