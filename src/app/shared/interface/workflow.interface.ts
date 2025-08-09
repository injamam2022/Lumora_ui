export interface WorkflowStatus {
  assigned: 'assigned';
  in_progress: 'in_progress';
  submitted: 'submitted';
  under_review: 'under_review';
  approved: 'approved';
  rejected: 'rejected';
}

export interface FormSubmission {
  submission_id: number;
  process_id: number;
  facility_id: number;
  department_id: number;
  room_id: number;
  material_id: number;
  material_description: string;
  fixed_resources: string;
  portable_resources: string;
  form_data: string;
  user_id: number;
  workflow_status: keyof WorkflowStatus;
  assigned_operator_id: number | null;
  reviewer_id: number | null;
  assigned_date: string | null;
  review_date: string | null;
  submitted_date: string;
  del_status: number;
}

export interface FormComment {
  comment_id: number;
  submission_id: number;
  user_id: number;
  user_role: string;
  comment_text: string;
  created_date: string;
  del_status: number;
  user_name?: string;
}

export interface WorkflowResponse {
  stat: number;
  data: FormSubmission;
  editable: boolean;
  can_submit: boolean;
  can_review: boolean;
  user_role: number;
  status: keyof WorkflowStatus;
  comments: FormComment[];
  msg?: string;
}

export interface WorkflowUpdateRequest {
  submission_id: string;
  new_status: keyof WorkflowStatus;
  comment?: string;
}

export interface FormAssignmentRequest {
  submission_id: string;
  operator_id: string;
}

// Multi-user workflow interfaces
export interface ReviewAssignment {
  assignment_id: number;
  submission_id: number;
  reviewer_id: number;
  reviewer_name: string;
  review_sequence: number;
  review_status: 'pending' | 'in_progress' | 'approved' | 'rejected';
  review_date?: string;
  review_comment?: string;
  created_at: string;
  updated_at: string;
}

export interface CurrentReviewerInfo {
  current_reviewer_id: number;
  review_sequence: number;
  total_reviewers: number;
  reviewer_list: number[];
  current_assignment?: ReviewAssignment;
}

export interface ReviewerStatus {
  is_current_reviewer: boolean;
  is_assigned_reviewer: boolean;
  current_reviewer_id: number;
  review_sequence: number;
  total_reviewers: number;
}

export interface MultiUserWorkflowResponse extends WorkflowResponse {
  current_reviewer_info?: CurrentReviewerInfo;
  review_assignments?: ReviewAssignment[];
  reviewer_status?: ReviewerStatus;
}

// Admin interface for multi-user workflow
export interface ReviewerAssignment {
  submission_id: number;
  reviewer_ids: number[];
  assigned_by: number;
  assigned_date: string;
}

export interface UserInfo {
  admin_id: number;
  admin_name: string;
  role_id: number;
  role_name?: string;
}

export interface AssignmentResponse {
  stat: number;
  msg: string;
  data?: any;
}
