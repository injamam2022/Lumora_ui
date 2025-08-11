export interface Role {
  stat: number;
  msg?: string;
  list_count?: number;
  all_list: AllList[];
}

export interface AllList {
  role_id: string;
  role_name: string;
  del_status: string;
}

// export interface Role {
//   status: string;
//   data: Data;
// }

// export interface Data {
//   count: number;
//   rows: RoleData[];
// }

// export interface RoleData {
//   roleId: number;
//   roleName: string;
//   createdAt: string;
//   updatedAt: string;
//   deletedAt: any;
// }

export interface AddRolePayload {
  role_name: string;
  department_id: number;
  facilities: [] | string;
}

export interface UpdateRolePayload {
  role_name: string;
  department_id: number;
  facilities: [] | string;
  role_id: string;
}

export interface GetSingleRole {
  stat: number;
  msg: string;
  list_count: number;
  all_list: AllList[];
}

export interface AllList {
  role_id: string;
  role_name: string;
  del_status: string;
  department_id: any;
  added_date: string;
  department_name: any;
  department_prefix: any;
  created_at: any;
  updated_at: any;
}

// export interface GetSingleRole {
//   status: string;
//   data: SingleRole;
// }

// export interface SingleRole {
//   roleId: number;
//   roleName: string;
//   departmentId: number;
//   createdAt: string;
//   updatedAt: string;
//   deletedAt: any;
// }

export interface DeleteRole {
  status: string;
  message: string;
}

export interface AllListAssignedToWorkFlow {
  stat: number;
  msg: string;
  list_count: number;
  all_list: ListOfRoles[];
}

export interface ListOfRoles {
  assign_process_to_role_id: string;
  process_id: string;
  role_id: string;
  assigned_user_id?: string; // Optional field for E-Logbook user assignment
  del_status: string;
}
