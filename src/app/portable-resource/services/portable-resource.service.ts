import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../shared/services/base-http.client.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { PortableResource, PortableResourceData } from '../interface/portable-resource.interface';

@Injectable({
  providedIn: 'root',
})
export class PortableResourceService {
  public refreshPortableResource$ = new BehaviorSubject(true);

  constructor(public baseHttpService: BaseHttpService) {}

  public getAllPortableResources(): Observable<PortableResourceData> {
    return this.baseHttpService.post<PortableResourceData>('/General/Get', {
      portable_resource: { del_status: 0 },
    });
  }

  public deletePortableResource(resourceId: string) {
    const payload = { portable_resource: { resource_id: resourceId } };
    return this.baseHttpService.post('/General/Delete', payload);
  }

  public addPortableResource(resourceData: any) {
    const payload = { portable_resource: resourceData };
    return this.baseHttpService.post('/General/Add', payload);
  }

  public updatePortableResource(resourceData: any, resourceId: string) {
    const updatePayload = {
      portable_resource: resourceData,
      where: { resource_id: resourceId },
    };
    return this.baseHttpService.post('/General/Update', updatePayload);
  }

  public getSinglePortableResource(resourceId: string): Observable<any> {
    let payload = {
      portable_resource: { resource_id: resourceId, del_status: 0 },
    };
    return this.baseHttpService.post('/General/Get', payload);
  }

  public refreshTableData(refresh: boolean) {
    this.refreshPortableResource$.next(true);
  }
} 