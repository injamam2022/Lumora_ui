import {
  Department,
  DepartmentData,
} from '../../department/interface/department.interface';
import { Facility } from '../../facility/interface/facility.interface';
import { ProcessListData } from '../../manage-process/interface/manage-process-interface';
import { Role } from '../../role/interface/role.interface';
import { AllUser } from '../../user/interface/user.interface';
import { ElogbookListData } from '../../manage-process/interface/manage-process-interface';
//AllUser | Role | Department | Facility |
export type Entity =
  | ProcessListData
  | DepartmentData
  | Role
  | AllUser
  | Facility
  | ElogbookListData;
