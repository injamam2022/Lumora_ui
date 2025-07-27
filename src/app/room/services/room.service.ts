import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../shared/services/base-http.client.service';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  AddRoomPayload,
  DeleteRoom,
  Room,
  RoomData,
  GetSingleRoom,
} from '../interface/room.interface';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  public refreshRoom$ = new BehaviorSubject(true);

  constructor(public baseHttpService: BaseHttpService) {}

  public getAllRoom(): Observable<RoomData> {
    return this.baseHttpService.post<RoomData>('General/Get', {
      room: { del_status: 0 },
    });
  }

  public getAllRoomWithResources(): Observable<any> {
    return this.baseHttpService.post<any>('General/get_room_with_resources', {
      room: { del_status: 0 }
    });
  }

  public deleteRoom(roomId: string): Observable<DeleteRoom> {
    const payload = { room: { room_id: roomId } };
    return this.baseHttpService.post<DeleteRoom>(
      'General/Delete',
      payload
    );
  }

  public addRoom(roomData: any) {
    const payload = { room: roomData };
    return this.baseHttpService.post<string>('General/Add', payload);
  }

  public updateRoom(roomData: any, roomId: string) {
    const updatePayload = {
      room: roomData,
      where: { room_id: roomId }
    };
    return this.baseHttpService.post<string>('General/Update', updatePayload);
  }

  public getSingleRoom(
    roomId: string
  ): Observable<GetSingleRoom> {
    let payload = {
      room: { room_id: roomId, del_status: 0 },
    };
    return this.baseHttpService.post<GetSingleRoom>(
      'General/Get',
      payload
    );
  }

  public refreshTableData(refresh: boolean) {
    this.refreshRoom$.next(true);
  }

  public getFixedResources() {
    console.log('Calling getFixedResources API...');
    return this.baseHttpService.post<any[]>('General/get_fixed_resources', {});
  }

  public addRoomWithResources(roomData: any, resourceIds: number[]) {
    const payload = { room: roomData, resource_ids: resourceIds };
    return this.baseHttpService.post<any>('General/add_room_with_resources', payload);
  }

  public updateRoomWithResources(roomData: any, roomId: string, resourceIds: number[]) {
    const payload = { room: roomData, room_id: roomId, resource_ids: resourceIds };
    return this.baseHttpService.post<any>('General/update_room_with_resources', payload);
  }
}
