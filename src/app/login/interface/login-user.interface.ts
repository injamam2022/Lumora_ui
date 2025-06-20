export interface LoginUserPayload {
  email_id: string;
  password: string;
}

export interface LoginUserResponse {
  stat: number;
  msg: string;
  all_list: AllList;
}

export interface AllList {
  admin_id: string;
  role_id: string;
  email_id: string;
  password: string;
  page_id: string;
  del_status: string;
  name: string;
  phone: string;
  access_token: string;
}

export interface FacilityData {
  count: number;
  rows: FacilityRow[];
}

export interface FacilityRow {
  facilityId: number;
  locationName: string;
}

export interface ModuleAccess {
  count: number;
  rows: Row[];
}

export interface Row {
  moduleId: number;
  addFlag: boolean;
  editFlag: boolean;
  viewFlag: boolean;
  moduleName: string;
  label: string;
  icon: string;
  route: string;
}
