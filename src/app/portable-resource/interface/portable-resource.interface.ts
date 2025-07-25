export interface PortableResourceData {
  stat: number;
  msg: string;
  list_count: number;
  all_list: PortableResource[];
}

export interface PortableResource {
  resource_id: string;
  resource_name: string;
  resource_type: string;
  resource_code: string;
  capacity_unit: string;
  capacity_quantity: number;
  created_at: string;
  updated_at: string;
  del_status: string;
} 