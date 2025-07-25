import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../shared/services/base-http.client.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Material, MaterialData } from '../interface/material.interface';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  public refreshMaterial$ = new BehaviorSubject(true);

  constructor(public baseHttpService: BaseHttpService) {}

  public getAllMaterials(): Observable<MaterialData> {
    return this.baseHttpService.post<MaterialData>('/General/Get', {
      material: { del_status: 0 },
    });
  }

  public deleteMaterial(productId: string) {
    const payload = { material: { product_id: productId } };
    return this.baseHttpService.post('/General/Delete', payload);
  }

  public addMaterial(materialData: any) {
    const payload = { material: materialData };
    return this.baseHttpService.post('/General/Add', payload);
  }

  public updateMaterial(materialData: any, productId: string) {
    const updatePayload = {
      material: materialData,
      where: { product_id: productId },
    };
    return this.baseHttpService.post('/General/Update', updatePayload);
  }

  public getSingleMaterial(productId: string): Observable<any> {
    let payload = {
      material: { product_id: productId, del_status: 0 },
    };
    return this.baseHttpService.post('/General/Get', payload);
  }

  public refreshTableData(refresh: boolean) {
    this.refreshMaterial$.next(true);
  }
} 