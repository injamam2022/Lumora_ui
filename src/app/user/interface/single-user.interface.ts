export interface SingleUser {
  stat: number;
  msg: string;
  list_count: number;
  all_list: AllList[];
}

export interface AllList {
  admin_id: string;
  admin_name: string;
  role_id: string;
  department_id: string;
  email_id: string;
  password: string;
  page_id: any;
  del_status: string;
}
