import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../shared/services/base-http.client.service';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  AddDepartmentPayload,
  DeleteDepartment,
  Department,
  DepartmentData,
  GetSingleDepartment,
} from '../interface/department.interface';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  public refreshDepartment$ = new BehaviorSubject(true);

  constructor(public baseHttpService: BaseHttpService) {}

  public getAllDepartment(): Observable<DepartmentData> {
    return this.baseHttpService.post<DepartmentData>('/General/Get', {
      department: { del_status: 0 },
    });
  }

  public deleteDepartment(departmentId: string): Observable<DeleteDepartment> {
    const payload = { department: { department_id: departmentId } };
    return this.baseHttpService.post<DeleteDepartment>(
      `General/Delete`,
      payload
    );
  }

  public addDepartment(departmentName: string) {
    const payload = {
      department: { department_name: departmentName },
    };
    return this.baseHttpService.post<string>('/General/Add', payload);
  }

  public updateDepartment(departmentName: string, departmentId: string) {
    var updatePayload = {
      department: {
        department_name: departmentName,
      },
      where: {
        department_id: departmentId,
      },
    };

    return this.baseHttpService.post<string>(`General/Update`, updatePayload);
  }

  public getSingleDepartment(
    departmentIdId: string
  ): Observable<GetSingleDepartment> {
    let payload = {
      department: { department_id: departmentIdId, del_status: 0 },
    };
    return this.baseHttpService.post<GetSingleDepartment>(
      `/General/Get`,
      payload
    );
  }

  public refreshTableData(refresh: boolean) {
    this.refreshDepartment$.next(true);
  }
}
