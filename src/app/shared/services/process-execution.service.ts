import { Injectable } from '@angular/core';
import { BaseHttpService } from './base-http.client.service';
import { ProcessListData } from '../../manage-process/interface/manage-process-interface';
import { Observable } from 'rxjs';
import {
  AssignProcessToRole,
  FetchParameterOptions,
  Parameter,
  ParameterOptions,
  ParameterOptionWrapper,
  ParametersListDataResToTask,
  ParameterTypeAllList,
  ParameterTypeList,
  ProcessCreation,
  ProcessCreationSuccess,
  ProcessListOfData,
  SingleStageTaskLIST,
  Stage,
  Task,
  TaskListStageWise,
} from '../../stage-creation/interface/process-creation.interface';
import {
  BranchingRules,
  BranchingRulesPayloadCreation,
} from '../../branching-rules/interface/branching-rule.interface';
import { ElogListOfData } from '../../elogbook/interface/elogbook.interface';

@Injectable({
  providedIn: 'root',
})
export class ProcessExecutionService {
  constructor(private readonly baseHttpService: BaseHttpService) {}

  public getAllProcess(roleId?: string): Observable<ProcessListData> {
    let payload = { role_id: roleId };
    return this.baseHttpService.post<ProcessListData>(`General/GetProcessByRole`, payload);
  }

  public getAllProcessBranchingRules(
    process_id: string
  ): Observable<BranchingRules> {
    let payload = {
      process_id: process_id,
    };
    return this.baseHttpService.post<BranchingRules>(
      `General/GetBranchingRulesForProcess`,
      payload
    );
  }

  public getAllProcessParameters(
    process_id: string
  ): Observable<BranchingRules> {
    let payload = { parameter: { del_status: 0, process_id: process_id } };
    return this.baseHttpService.post<BranchingRules>(`General/Get`, payload);
  }

  public getSingleProcessExecution(
    process_id: string
  ): Observable<ProcessCreation> {
    let payload = { process_id: process_id };
    return this.baseHttpService.post<ProcessCreation>(
      `General/Process_new`,
      payload
    );
  }

  public getTaskInfoRestoStage(stage_id: any) {
    let payload = {
      stage_id: stage_id,
    };
    return this.baseHttpService.post<SingleStageTaskLIST>(
      `General/getTasksByStageId`,
      payload
    );
  }

  public getParametersInfoRestoTask(task_id: any) {
    let payload = {
      task_id: task_id,
    };
    return this.baseHttpService.post<ParametersListDataResToTask>(
      `General/getParametersByTaskId`,
      payload
    );
  }

  public getAllParameterTypes() {
    let payload = { parameter_type: { del_status: 0 } };

    return this.baseHttpService.post<ParameterTypeList>(`General/Get`, payload);
  }

  public getParametersOptionsRespectToTask(parameter_id: any) {
    let payload = {
      parameter_options: { del_status: 0, parameter_id: parameter_id },
    };

    return this.baseHttpService.post<FetchParameterOptions>(
      `General/Get`,
      payload
    );
  }

  public createProcessFirst(processCreationPayload: ProcessListOfData) {
    let payload = { process: { ...processCreationPayload } };

    return this.baseHttpService.post<ProcessCreationSuccess>(
      `General/Add`,
      payload
    );
  }

  public createElogsFirst(elogsCreationPayload: ElogListOfData) {
    let payload = { elogs: { ...elogsCreationPayload } };

    return this.baseHttpService.post<ProcessCreationSuccess>(
      `General/Add`,
      payload
    );
  }

  public assIgnProcessToRole(assIgnProcessToRole: AssignProcessToRole) {
    let payload = { assign_process_to_role: { ...assIgnProcessToRole } };

    return this.baseHttpService.post<ProcessCreationSuccess>(
      `General/Add`,
      payload
    );
  }

  public createStage(stagePayload: Stage) {
    let payload = { stage: { ...stagePayload } };

    return this.baseHttpService.post<ProcessCreationSuccess>(
      `General/Add`,
      payload
    );
  }

  public createParameter(parameterPayload: Parameter) {
    let payload = { parameter: { ...parameterPayload } };

    return this.baseHttpService.post<ProcessCreationSuccess>(
      `General/Add`,
      payload
    );
  }

  createParameterOptions(parameterOptionPayload: ParameterOptionWrapper) {
    return this.baseHttpService.post<ProcessCreationSuccess>(
      `General/Add`,
      parameterOptionPayload
    );
  }

  public createTask(taskPayload: Task) {
    let payload = { task: { ...taskPayload } };

    return this.baseHttpService.post<ProcessCreationSuccess>(
      `General/Add`,
      payload
    );
  }

  public createBranchingRules(
    branchingRulesPayload: BranchingRulesPayloadCreation
  ) {
    let payload = { branching_rules: { ...branchingRulesPayload } };

    return this.baseHttpService.post<ProcessCreationSuccess>(
      `General/Add`,
      payload
    );
  }

  public updateStage(stageId: string, stageName: string) {
    let payload = {
      stage: {
        "stage_name": stageName
      } ,
      "where": {
        "stage_id": stageId
    }
    };
    return this.baseHttpService.post<ProcessCreationSuccess>(
      `General/Update`,
      payload
    );
  }

  public updateTask(taskId: string, taskName: string) {
    let payload = {
      task: {
        task_name: taskName
      }
      ,
      "where": {
        "task_id": taskId
      }
    };
    return this.baseHttpService.post<ProcessCreationSuccess>(
      `General/Update`,
      payload
    );
  }

  public submitProcess(processId: string) {
    let payload = {
      process: {
        status: 1
      },
      where: {
        process_id: processId
      }
    };
    return this.baseHttpService.post<ProcessCreationSuccess>(
      `General/Update`,
      payload
    );
  }

  public checkProcessStatus(processId: string, roleId: string): Observable<any> {
    const payload = {
      process_id: processId,
      role_id: roleId
    };
    return this.baseHttpService.post<any>(`General/CheckProcessStatus`, payload);
  }

  public assignProcessToUser(processId: string, roleId: string, userId: string): Observable<any> {
    const payload = {
      process_id: processId,
      role_id: roleId,
      assigned_user_id: userId
    };
    console.log(payload);
    return this.baseHttpService.post<any>('General/AssignProcessToUser', payload);
  }

  public saveElogParameters(elogParametersPayload: any): Observable<ProcessCreationSuccess> {
    return this.baseHttpService.post<ProcessCreationSuccess>(
      `General/Save_parameters`,
      elogParametersPayload
    );
  }

  public createBranchingRulesBulk(rules: any[]) {
    // Remove parameterOptions from each rule before sending
    //const cleanedRules = rules.map(({ parameterOptions, ...rest }) => rest);
    return this.baseHttpService.post<any>(
      'General/AddBranchingRules',
       rules
    );
  }

  public deleteBranchingRules(branchingRulesId: string) {
    let payload = {
      branching_rules: { branching_rules_id: branchingRulesId },
    };
    return this.baseHttpService.post<string>(`General/Delete`, payload);
  }

  public submitFormData(formData: any): Observable<any> {
    // Get user data from localStorage
    const userData = localStorage.getItem('userData');
    const userRole = userData ? JSON.parse(userData).role_id : 1;
    const userId = userData ? JSON.parse(userData).admin_id : 1;

    // Add user data to the form data
    const payload = {
      ...formData,
      user_id: userId,
      user_role: userRole
    };

    console.log('Submitting form with payload:', payload);
    return this.baseHttpService.post<any>('General/SaveFormSubmission', payload);
  }

  public getParameterValues(processId: string): Observable<any> {
    const payload = { process_id: processId };
    return this.baseHttpService.post<any>('General/get_parameter_values', payload);
  }

  // Get form submission with workflow data
  public getFormSubmissionWithWorkflow(processId: string): Observable<any> {
    // Get user data from localStorage
    const userData = localStorage.getItem('userData');
    const userRole = userData ? JSON.parse(userData).role_id : 1;
    const userId = userData ? JSON.parse(userData).admin_id : 1;

    const payload = {
      process_id: processId,
      user_id: userId,
      user_role: userRole
    };
    return this.baseHttpService.post<any>('General/GetFormSubmissionWithWorkflow', payload);
  }

  // Update workflow status
  public updateWorkflowStatus(submissionId: string, newStatus: string, comment?: string): Observable<any> {
    // Get user data from localStorage
    const userData = localStorage.getItem('userData');
    const userRole = userData ? JSON.parse(userData).role_id : 1;
    const userId = userData ? JSON.parse(userData).admin_id : 1;

    const payload = {
      submission_id: submissionId,
      new_status: newStatus,
      comment: comment || '',
      user_id: userId,
      user_role: userRole
    };
    return this.baseHttpService.post<any>('General/UpdateWorkflowStatus', payload);
  }

  // Assign form to operator
  public assignFormToOperator(submissionId: string, operatorId: string): Observable<any> {
    // Get user data from localStorage
    const userData = localStorage.getItem('userData');
    const userRole = userData ? JSON.parse(userData).role_id : 1;
    const userId = userData ? JSON.parse(userData).admin_id : 1;

    const payload = {
      submission_id: submissionId,
      operator_id: operatorId,
      user_id: userId,
      user_role: userRole
    };
    return this.baseHttpService.post<any>('General/AssignFormToOperator', payload);
  }

  public getFormSubmissions(payload: any): Observable<any> {
    return this.baseHttpService.post<any>('General/Get', payload);
  }

  public getCompleteFormData(processId: string): Observable<any> {
    const payload = { process_id: processId };
    console.log('Calling getCompleteFormData with payload:', payload);
    // Use the index routing pattern that calls get_complete_form_data_data
    return this.baseHttpService.post<any>('General/get_complete_form_data', payload);
  }

  public deleteProcess(processId: string): Observable<any> {
    const payload = { process: { process_id: processId } };
    console.log('Calling deleteProcess with payload:', payload);
    return this.baseHttpService.post<any>('General/Delete', payload);
  }

  public deleteStage(stageId: string): Observable<any> {
    const payload = { stage_id: stageId };
    console.log('Calling deleteStage with payload:', payload);
    return this.baseHttpService.post<any>('General/delete_stage', payload);
  }

  public deleteTask(taskId: string): Observable<any> {
    const payload = { task_id: taskId };
    console.log('Calling deleteTask with payload:', payload);
    return this.baseHttpService.post<any>('General/delete_task', payload);
  }

  public deleteParameter(parameterId: string): Observable<any> {
    const payload = { parameter_id: parameterId };
    console.log('Calling deleteParameter with payload:', payload);
    return this.baseHttpService.post<any>('General/delete_parameter', payload);
  }

  // Get workflow rules for a specific status
  public getWorkflowRules(currentStatus: string): Observable<any> {
    const userData = localStorage.getItem('userData');
    const userRole = userData ? JSON.parse(userData).role_id : 1;
    const userId = userData ? JSON.parse(userData).admin_id : 1;

    const payload = {
      current_status: currentStatus,
      user_id: userId,
      user_role: userRole
    };

    return this.baseHttpService.post<any>(`General/GetWorkflowRules`, payload);
  }

  // Validate workflow transition
  public validateWorkflowTransition(currentStatus: string, newStatus: string): Observable<any> {
    const userData = localStorage.getItem('userData');
    const userRole = userData ? JSON.parse(userData).role_id : 1;
    const userId = userData ? JSON.parse(userData).admin_id : 1;

    const payload = {
      current_status: currentStatus,
      new_status: newStatus,
      user_id: userId,
      user_role: userRole
    };

    return this.baseHttpService.post<any>(`General/ValidateWorkflowTransition`, payload);
  }

  // Debug user role and form status
  public debugUserRole(processId: string): Observable<any> {
    const userData = localStorage.getItem('userData');
    const userRole = userData ? JSON.parse(userData).role_id : 1;
    const userId = userData ? JSON.parse(userData).admin_id : 1;

    const payload = {
      process_id: processId,
      user_id: userId,
      user_role: userRole
    };

    return this.baseHttpService.post<any>(`General/DebugUserRole`, payload);
  }
}
