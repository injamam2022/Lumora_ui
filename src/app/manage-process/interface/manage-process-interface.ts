export interface ProcessListData {
  stat: number;
  msg: string;
  list_count: number;
  all_list: ProcessAllList[];
}

export interface ProcessAllList {
  process_id: string;
  process_name: string;
  reference_document: string;
  sop_id: string;
  format_number: string;
  added_date: string;
  del_status: string;
}


export interface ElogbookListData {
  stat: number;
  msg: string;
  list_count: number;
  all_list: ElogbookListData[];
}
export interface ElogbookListData {
  elogbook_id: string;
  elogbook_name: string;
  reference_document: string;
  sop_id: string;
  format_number: string;
  added_date: string;
  del_status: string;
  status: string;
  created_at: string;
}