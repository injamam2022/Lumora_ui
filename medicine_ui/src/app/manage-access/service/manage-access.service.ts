import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../shared/services/base-http.client.service';
import { Observable } from 'rxjs';
import {
  ManageAccess,
  ManageAccessPayload,
} from '../interface/access.interface';

@Injectable({
  providedIn: 'root',
})
export class ManageAccessService {
  constructor(private readonly baseHttpService: BaseHttpService) {}

  public getAccess(roleId: number): Observable<ManageAccess> {
    return this.baseHttpService.get<ManageAccess>(`access/${roleId}`);
  }

  public saveModuleAccess(payload: any) {
    return this.baseHttpService.post<string>(
      'General/UpdateModuleAccess',
      payload
    );
  }
}
