export interface ProcessCreation {
  stat?: number;
  msg?: string;
  data: ProcessListOfData;
}

export interface  ProcessListOfData {
  process_id?: string | number;
  process_name?: string;
  reference_document?: string;
  sop_id?: string;
  format_number?: string;
  added_date?: string;
  del_status?: string;
  stages?: Stage[];
}

export interface Stage {
  stage_id?: string | number | undefined;
  stage_name?: string;
  process_id?: string | number;
  added_date?: string;
  tasks?: Task[];
}

export interface SingleStageTaskLIST {
  stat: number;
  msg: string;
  data: Task[];
}

export interface Task {
  task_id?: string;
  task_name?: string;
  stage_id?: string;
  added_date?: string;
  parameters?: Parameter[];
}

export interface ParametersListDataResToTask {
  stat: number;
  msg: string;
  data: Parameter[];
}

export interface ParameterOptionInner {
  parameter_id: number;
  options_for_parameter: string;
}

export interface FetchParameterOptions {
  stat: number;
  msg: string;
  list_count: number;
  all_list: ParameterOptionAllList[];
}

export interface ParameterOptionAllList {
  parameter_options_id: string;
  parameter_id: string;
  options_for_parameter: string;
  option_selected: string;
  added_date: string;
  del_status: string;
}

export interface ParameterOptionWrapper {
  parameter_options: ParameterOptionInner;
}

export interface ParameterOptions {
  parameter_id?: any;
  options_for_parameter?: any;
  option_selected?: any;
}

export interface Parameter {
  task_id: string;
  stage_id: string;
  parameter_id?: string;
  parameter_name?: string;
  parameter_description: string;
  parameter_type_id: string;
  options?: [];
  option_selected?: string;
}

export interface ParameterTypeList {
  stat: number;
  msg: string;
  list_count: number;
  all_list: ParameterTypeAllList[];
}

export interface ParameterTypeAllList {
  parameter_type_id: string;
  parameter_type_name: string;
  parameter_type_description: string;
  added_date: string;
  del_status: string;
}

export interface ProcessCreationSuccess {
  stat: number;
  msg: string;
  insert_id: number;
}

export interface TaskListStageWise {
  stat: number;
  msg: string;
  list_count: number;
  all_list: StageListTaskWise[];
}

export interface StageListTaskWise {
  task_id: string;
  task_name: string;
  stage_id: string;
  added_date: string;
  del_status: string;
}

export interface AssignProcessToRole {
  process_id: string;
  role_id: string;
}
