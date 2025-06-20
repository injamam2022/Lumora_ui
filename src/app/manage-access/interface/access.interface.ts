export interface ManageAccess {
  status: string;
  data: Data;
}

export interface Data {
  count: number;
  rows: Row[];
}

export interface Row {
  accessId: number;
  roleId: number;
  moduleId: number;
  addFlag: boolean;
  editFlag: boolean;
  viewFlag: boolean;
  deleteFlag: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: any;
}

export interface ManageAccessPayload {
  roleId: number;
  moduleId: number;
  addFlag: boolean;
  editFlag: boolean;
  viewFlag: boolean;
  deleteFlag: boolean;
}
