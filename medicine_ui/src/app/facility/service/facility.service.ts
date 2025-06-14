import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BaseHttpService } from '../../shared/services/base-http.client.service';
import {
  CityList,
  CountryList,
  CreateFacilityPayload,
  DeleteFacility,
  Facility,
  SingleFacility,
  StateList,
} from '../interface/facility.interface';
//import { StageCreation } from '../interface/stage.interface';

@Injectable({
  providedIn: 'root',
})
export class FacilityService {
  public refreshFacility$ = new BehaviorSubject(true);

  constructor(public baseHttpService: BaseHttpService) {}

  public getAllCountry(): Observable<CountryList> {
    let payload = {
      country: { del_status: 0 },
    };
    return this.baseHttpService.post<CountryList>('General/Get', payload);
  }
  public getAllState(countryId: string): Observable<StateList> {
    let payload = {
      state: { country_id: countryId, del_status: 0 },
    };
    return this.baseHttpService.post<StateList>('General/Get', payload);
  }

  public getAllCities(stateId: string): Observable<CityList> {
    let payload = {
      city: { state_id: stateId, del_status: 0 },
    };
    return this.baseHttpService.post<CityList>('General/Get', payload);
  }

  public getAllFacility(): Observable<Facility> {
    let payload = { facility: { del_status: 0 } };
    return this.baseHttpService.post<Facility>('General/Get', payload);
  }

  public deleteFacility(facilityId: string): Observable<DeleteFacility> {
    const payload = { facility: { facility_id: facilityId } };
    return this.baseHttpService.post<DeleteFacility>(`General/Delete`, payload);
  }

  public addFacility(addFacilityPayload: CreateFacilityPayload) {
    console.log(addFacilityPayload);
    const payload = { facility: addFacilityPayload };
    return this.baseHttpService.post<string>('General/Add', payload);
  }

  public updateFacility(
    updatePayload: CreateFacilityPayload,
    facilityId: string
  ) {
    return this.baseHttpService.patch<string>(
      `facilities/${facilityId}`,
      updatePayload
    );
  }

  public getSingleFacility(facilityId: string): Observable<SingleFacility> {
    const payload = { facility: { facility_id: facilityId, del_status: 0 } };
    return this.baseHttpService.post<SingleFacility>(`General/Get`, payload);
  }

  public refreshTableData(refresh: boolean) {
    this.refreshFacility$.next(true);
  }

  // public getStageUpdates() {
  //   return this.baseHttpService.get<StageCreation>(`General/Process_info`);
  // }
}
