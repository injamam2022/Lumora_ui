import { Injectable } from '@angular/core';
import { BaseHttpService } from './base-http.client.service';
import { ChangeLog } from '../interface/change-log.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChangeLogHttpClientService {
  constructor(private readonly baseHttpService: BaseHttpService) {}

  getChangeLogRespectToModule(moduleId: string): Observable<ChangeLog> {
    return this.baseHttpService.get<ChangeLog>(
      `access/change-logs/${moduleId}`
    );
  }
}
