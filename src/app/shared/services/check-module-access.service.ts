import { Injectable } from '@angular/core';
import { BaseHttpService } from './base-http.client.service';
import { Observable } from 'rxjs';
import { ModuleAccessSingle } from '../interface/module-access.interface';

@Injectable({
  providedIn: 'root',
})
export class CheckModuleAccessService {
  constructor(private readonly baseHttpService: BaseHttpService) {}

  //check the user have access to module and other operations

  getAccessRespectToModule(moduleId: string): Observable<ModuleAccessSingle> {
    var payload = { role_id: 1, module_id: moduleId };
    return this.baseHttpService.post<ModuleAccessSingle>(
      `General/ModuleAccessSingle`,
      payload
    );
  }

  getModuleRespectToRole(
    roleId: string | number
  ): Observable<ModuleAccessSingle> {
    var payload = { role_id: roleId };
    return this.baseHttpService.post<ModuleAccessSingle>(
      `General/Module_access`,
      payload
    );
  }

  public getModuleAccess(controllerName: string) {
    const moduleAccess = JSON.parse(localStorage.getItem('moduleAccess') || '[]');
    return moduleAccess.find((mod: any) => mod.controller_name === controllerName);
  }
}
