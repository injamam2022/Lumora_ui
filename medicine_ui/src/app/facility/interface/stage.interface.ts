import { FormControlOptions } from '@angular/forms';

export interface Form {
  type?: string;
  label?: string;
  value: string | number | boolean | object | null | any;
  mandatory?: boolean;
  validations?: Validation[];
  verificationType?: string;
  verifications?: Verification[];
  rules?: Verification[]; // Since `Rule` was identical to `Verification`
  description?: string;
  forms?: Form[]; // Recursive structure for nested forms
}

export interface Validation {
  rule: string; // e.g., "minLength", "maxLength", "regex"
  message: string;
  params?: any; // Additional parameters for validation rules
}

export interface Verification {
  roleId: number;
  isApproved: boolean;
  approvedBy: number;
}

export interface Rule {
  roleId: number;
  isApproved: boolean;
  approvedBy: number;
}
