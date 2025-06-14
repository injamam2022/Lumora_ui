export interface AddUserPayload {
  role_id: number | string;
  admin_name: string;
  email_id: string;
  password: string;
  confirmPassword?: string;
  department_id: number | string;
  facilities?: number[];
}

export interface CreateUserResponse {
  status: string;
  data: Data;
}

export interface Data {
  id: number;
  userType: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  updatedAt: string;
  createdAt: string;
  deletedAt: any;
}

//Get All User

export interface AllUser {
  stat: number;
  msg: string;
  list_count: number;
  all_list: AllList[];
}

export interface AllList {
  admin_id: string;
  role_id: string;
  email_id: string;
  password: string;
  page_id: string;
  del_status: string;
  role_name: string;
  department_id: string;
  added_date: string;
}

export interface DeleteUser {
  status: string;
  message: string;
}
