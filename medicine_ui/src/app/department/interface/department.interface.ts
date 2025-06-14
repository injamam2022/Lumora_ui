export interface DepartmentData {
  stat: number;
  msg: string;
  list_count: number;
  all_list: Department[];
}

export interface Department {
  department_id: string;
  department_name: string;
  department_prefix: string;
  created_at: string;
  updated_at: string;
  del_status: string;
}

// export interface Department {
//   status: string;
//   data: Data;
// }

// export interface Data {
//   count: number;
//   rows: Row[];
// }

// export interface Row {
//   departmentId: number;
//   departmentName: string;
//   createdAt: string;
//   updatedAt: string;
//   deletedAt: any;
// }

export interface AddDepartmentPayload {
  departmentName: string;
}

export interface GetSingleDepartment {
  stat: number;
  msg: string;
  list_count: number;
  all_list: AllList[];
}

export interface AllList {
  department_id: string;
  department_name: string;
  department_prefix: string;
  created_at: string;
  updated_at: string;
  del_status: string;
}

// export interface GetSingleDepartment {
//   status: string;
//   data: DataSingleDepartment;
// }

// export interface DataSingleDepartment {
//   departmentId: number;
//   departmentName: string;
//   createdAt: string;
//   updatedAt: string;
//   deletedAt: any;
// }

export interface DeleteDepartment {
  stat: number;
  msg: string;
}
