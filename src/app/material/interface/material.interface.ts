export interface MaterialData {
  stat: number;
  msg: string;
  list_count: number;
  all_list: Material[];
}

export interface Material {
  product_id: string;
  product_name: string;
  product_desc: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  del_status: string;
} 