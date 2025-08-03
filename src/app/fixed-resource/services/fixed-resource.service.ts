import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../shared/services/base-http.client.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { FixedResource, FixedResourceData } from '../interface/fixed-resource.interface';

@Injectable({
  providedIn: 'root',
})
export class FixedResourceService {
  public refreshFixedResource$ = new BehaviorSubject(true);

  constructor(public baseHttpService: BaseHttpService) {}

  public getAllFixedResources(): Observable<FixedResourceData> {
    return this.baseHttpService.post<FixedResourceData>('/General/Get', {
      fixed_resource: { del_status: 0 },
    });
  }

  public deleteFixedResource(resourceId: string) {
    const payload = { fixed_resource: { resource_id: resourceId } };
    return this.baseHttpService.post('/General/Remove', payload);
  }

  public addFixedResource(resourceData: any) {
    const payload = { fixed_resource: resourceData };
    return this.baseHttpService.post('/General/Add', payload);
  }

  public updateFixedResource(resourceData: any, resourceId: string) {
    const updatePayload = {
      fixed_resource: resourceData,
      where: { resource_id: resourceId },
    };
    return this.baseHttpService.post('/General/Update', updatePayload);
  }

  public getSingleFixedResource(resourceId: string): Observable<any> {
    let payload = {
      fixed_resource: { resource_id: resourceId, del_status: 0 },
    };
    return this.baseHttpService.post('/General/Get', payload);
  }

  public refreshTableData(refresh: boolean) {
    this.refreshFixedResource$.next(true);
  }
}
