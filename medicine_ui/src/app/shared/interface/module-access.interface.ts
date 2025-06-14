// export interface ModuleAccessSingle {
//   status: string;
//   data: Data;
// }

// export interface Data {
//   moduleId: number;
//   addFlag: boolean;
//   editFlag: boolean;
//   viewFlag: boolean;
//   deleteFlag: boolean;
//   moduleName: string;
//   label: string;
//   icon: string;
//   route: string;
// }

export interface ModuleAccessSingle {
  stat: number;
  All_list: AllList[];
}

export interface AllList {
  user_access_id: string;
  role_id: string;
  module_id: string;
  add_status: boolean;
  edit_status: boolean;
  delete_status: boolean;
  view_status: boolean;
  created_at: string;
  updated_at: string;
  del_status: boolean;
  role_name: string;
  department_id: string;
  module_name: string;
  controller_name: string;
  priority_status: string;
  fav_icon: string;
  module_status: string;
}
