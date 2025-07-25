import { Material } from './../../material/interface/material.interface';
import { PortableResourceComponent } from '../../portable-resource/portable-resource.component';
import { FixedResource } from './../../fixed-resource/interface/fixed-resource.interface';
export enum EntityIdMapping {
  User = 'admin_id',
  Role = 'role_id',
  Department = 'department_id',
  Product = 'product_id',
  Facility = 'facility_id',
  Process = 'process_id',
  Elogbook = 'elogs_id',
  Room = 'room_id',
  FixedResource = 'fixed_resource_id',
  PortableResource = 'portable_resource_id',
  Material = 'material_id'
}
