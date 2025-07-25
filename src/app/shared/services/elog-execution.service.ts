import { Injectable } from '@angular/core';
import { BaseHttpService } from './base-http.client.service';
import { ElogbookListData, ProcessListData } from '../../manage-process/interface/manage-process-interface';
import { BehaviorSubject, Observable } from 'rxjs';
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

@Injectable({
  providedIn: 'root',
})
export class ElogbookService {

  public refreshElogbook$ = new BehaviorSubject(true);
  constructor(private readonly baseHttpService: BaseHttpService) { }

  public getAllElogBook(roleId?: string): Observable<ElogbookListData> {
    let payload = { role_id: roleId };
    return this.baseHttpService.post<ElogbookListData>(`General/GetElogByRole`, payload);
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
      },
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

  public deleteElogbook(deleteId: string) {
    return this.baseHttpService.post<any>('General/Delete', { elogs: { elogs_id: deleteId } });
  }

  public updateElogbookWithParameters(payload: any) {
    return this.baseHttpService.post<any>('General/update_elogbook_with_parameters', payload);
  }

  public getSingleElogbookWithParameters(elogs_id: string) {
    // Fetch Elogbook details
    const elogbook$ = this.baseHttpService.post<any>('General/Get', {
      elogs_master: { elogs_id }
    });
    // Fetch parameters for this Elogbook
    const parameters$ = this.baseHttpService.post<any>('General/Get', {
      param_master: { elogs_id, status: 1 }
    });
    return { elogbook$, parameters$ };
  }

  public getElogbookBranchingRules(elog_id: string) {
    let payload = { elog_id };
    return this.baseHttpService.post<any>('General/GetBranchingRulesForElog', payload);
  }

  public addElogbookBranchingRule(payload: any) {
    return this.baseHttpService.post<any>('General/Add', payload);
  }

  public deleteElogbookBranchingRule(payload: any) {
    return this.baseHttpService.post<any>('General/Delete', payload);
  }

    public refreshTableData(refresh: boolean) {
    this.refreshElogbook$.next(true);
  }
}

