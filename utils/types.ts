export interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

export type FilingStatus = 'single' | 'mfj' | 'hoh' | 'mfs';
export type ThemeMode = 'light' | 'dark' | 'nightVision' | 'system' | 'scheduled';

export type StateCode = 
  | 'AL' | 'AK' | 'AZ' | 'AR' | 'CA' | 'CO' | 'CT' | 'DE' | 'DC' | 'FL' 
  | 'GA' | 'HI' | 'ID' | 'IL' | 'IN' | 'IA' | 'KS' | 'KY' | 'LA' | 'ME' 
  | 'MD' | 'MA' | 'MI' | 'MN' | 'MS' | 'MO' | 'MT' | 'NE' | 'NV' | 'NH' 
  | 'NJ' | 'NM' | 'NY' | 'NC' | 'ND' | 'OH' | 'OK' | 'OR' | 'PA' | 'RI' 
  | 'SC' | 'SD' | 'TN' | 'TX' | 'UT' | 'VT' | 'VA' | 'WA' | 'WV' | 'WI' 
  | 'WY' | 'NONE' | 'CUSTOM';

export interface TaxSettings {
  filingStatus: FilingStatus;
  stateCode: StateCode;
  stateTaxRate: number; // used for CUSTOM
  useStandardDeduction: boolean;
  customDeduction: number;
  includeFica: boolean;
  additionalWithholding: number; // Weekly additional amount
  is1099: boolean;
}

export interface AppSettings {
  companyName: string;
  hourlyRate: number;
  overtimeThreshold: number; // hours per week
  overtimeMultiplier: number;
  isFlsaExempt: boolean; 
  weekStartDay: number; // 0 for Sunday, 1 for Monday, etc.
  minWeeklyGuarantee: number; // Minimum guaranteed pay per week
  taxSettings: TaxSettings;
  // Theme Settings
  themeMode: ThemeMode;
  darkScheduleStart: string; // HH:mm format
  darkScheduleEnd: string;   // HH:mm format
}

export interface ShiftStats {
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  grossPay: number;
  regularPay: number;
  overtimePay: number;
  // Tax Estimates
  estimatedFederalTax: number;
  estimatedStateTax: number;
  estimatedFICA: number;
  netPay: number;
  guaranteeApplied: boolean;
}