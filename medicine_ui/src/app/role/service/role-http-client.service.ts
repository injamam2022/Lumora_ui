import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../shared/services/base-http.client.service';
import {
  AddRolePayload,
  AllListAssignedToWorkFlow,
  DeleteRole,
  GetSingleRole,
  Role,
  UpdateRolePayload,
} from '../interface/role.interface';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoleHttpClientService {
  public refreshRole$ = new BehaviorSubject(true);

  constructor(private readonly baseHttpService: BaseHttpService) {}

  public getAllRoles(): Observable<Role> {
    // const payload = {
    //   role: {},
    //   join: 'department','role_to_facility','facility'
    // };

    return this.baseHttpService.post<Role>('General/GetRole', {});
  }

  public getAllAlreadyAssignedWorkFlowRoles(
    processId: string
  ): Observable<AllListAssignedToWorkFlow> {
    const payload = {
      assign_process_to_role: { process_id: processId },
    };

    return this.baseHttpService.post<AllListAssignedToWorkFlow>(
      'General/Get',
      payload
    );
  }

  public deleteRole(roleId: string): Observable<DeleteRole> {
    return this.baseHttpService.delete<DeleteRole>(`roles/${roleId}`);
  }

  public addRole(addRolePayload: AddRolePayload) {
    // const payload = {
    //   role: { ...addRolePayload },
    // };
    return this.baseHttpService.post<string>('General/AddRole', addRolePayload);
  }

  public updateRole(updatePayload: UpdateRolePayload, roleId: string) {
    const payload = {
      role: { ...updatePayload, role_id: roleId }
    };

    return this.baseHttpService.post<string>(`General/UpdateRole`, payload);
  }

  public getSingleRole(roleId: string): Observable<GetSingleRole> {
    const payload = {
      role: { role_id: roleId },
      join: 'department',
    };
    console.log('payalod', payload);
    return this.baseHttpService.post<GetSingleRole>(`General/Get`, payload);
  }

  public refreshTableData(refresh: boolean) {
    this.refreshRole$.next(true);
  }
}
