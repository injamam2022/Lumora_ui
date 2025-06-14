export interface ChangeLog {
  status: string;
  data: Data;
}

export interface Data {
  count: number;
  rows: Row[];
}

export interface Row {
  changeLogId: number;
  moduleId: number;
  userId: number;
  firstName: string;
  lastName: string;
  changes: Changes;
}

export interface Changes {
  action: string;
  change: string;
  changeTime: string;
}
