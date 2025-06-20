export interface ElogsCreation {
    stat?: number;
    msg?: string;
    data: ElogListOfData;
  }
  
  export interface  ElogListOfData {
    elogs_id?: string | number;
    elogs_name?: string;
    reference_document?: string;
    sop_id?: string;
    format_number?: string;
    added_date?: string;
    del_status?: string;
  }