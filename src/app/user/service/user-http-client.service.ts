import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseHttpService } from '../../shared/services/base-http.client.service';
import {
  AddUserPayload,
  AllUser,
  CreateUserResponse,
  DeleteUser,
} from '../interface/user.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { SingleUser } from '../interface/single-user.interface';
import { RoleComponent } from '../../role/role.component';
import { Role } from '../../role/interface/role.interface';

@Injectable({
  providedIn: 'root',
})
export class UserHttpClientService {
  public refreshUserData$ = new BehaviorSubject(true);

  constructor(
    private readonly baseHttpService: BaseHttpService,
    private http: HttpClient
  ) {}

  // add user apies

  public addUserCreation(
    payloadAddUser: AddUserPayload
  ): Observable<CreateUserResponse> {
    // Remove confirmPassword from the payload
    const { confirmPassword, ...userPayload } = payloadAddUser;

    const payload = {
      admin: { ...userPayload },
    };

    return this.baseHttpService.post<CreateUserResponse>(
      'General/Add',
      payload
    );
  }

  public updateUserData(
    payloadAddUser: AddUserPayload,
    updateId: string
  ): Observable<CreateUserResponse> {
    // Remove confirmPassword from the payload
    const { confirmPassword, ...userPayload } = payloadAddUser;

    const payload = {
      admin: { ...userPayload },
      where: {
        admin_id: updateId,
      },
    };

    // const payload = {
    //   admin: { ...payloadAddUser },
    //   where: {
    //     admin_id: updateId,
    //   },
    // };

    return this.baseHttpService.post<CreateUserResponse>(
      `General/Update`,
      payload
    );
  }

  public getSingleUser(singleUserId: string) {
    var payload = {
      admin: { admin_id: singleUserId },
    };
    return this.baseHttpService.post<SingleUser>('General/Get', payload);
  }

  public getRoleRespectToDepartment(departmentId: number | string) {
    var payload = {
      role: { department_id: departmentId },
    };
    return this.baseHttpService.post<Role>('General/Get', payload);
  }

  public getAllUsers(): Observable<AllUser> {
    var payload = {
      admin: {},
      join: 'role',
    };
    return this.baseHttpService.post<AllUser>('General/Get', payload);
  }

  public deleteUser(userId: string): Observable<DeleteUser> {
    return this.baseHttpService.delete<DeleteUser>(`users/${userId}`);
  }

  public refreshTableData(refresh: boolean) {
    this.refreshUserData$.next(refresh);
  }
}
