export interface BranchingRules {
  stat: number;
  msg: string;
  data: BranchingRulesAll[];
}

export interface BranchingRulesAll {
  branching_rules_id: string;
  process_id: string;
  stage_id: string;
  stage_name: string;
  task_id: string;
  task_name: string;
  parameter_id: string;
  parameter_name: string;
  parameter_value: string;
  operator?: BranchingConditionOperator;
  target_parameter_id?: string;
  target_parameter_name?: string;
  added_date: string;
  action_type?: BranchingActionType;
  display_message_content?: string;
  validation_min_value?: number;
  validation_max_value?: number;
  validation_regex_pattern?: string;
  validation_message_for_rule?: string;
}

export interface BranchingRulesPayloadCreation {
  process_id: string;
  stage_id: number | string;
  task_id: number | string;
  parameter_id: number | string;
  parameter_value: string;
  operator?: BranchingConditionOperator;
  target_parameter_id?: string;
  action_type?: BranchingActionType;
  display_message_content?: string;
  validation_min_value?: number;
  validation_max_value?: number;
  validation_regex_pattern?: string;
  validation_message_for_rule?: string;
}

export enum BranchingActionType {
  HIDE_PARAMETER = 'hide_parameter',
  DISPLAY_MESSAGE = 'display_message',
  APPLY_VALIDATION = 'apply_validation',
}

export enum BranchingConditionOperator {
  EQUAL = '=',
  GREATER_THAN = '>',
  LESS_THAN = '<',
}
