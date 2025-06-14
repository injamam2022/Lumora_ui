import { SelectItem } from 'primeng/api';

export interface TableColumn {
  columnTypeMultiselect?: boolean;
  field: string;
  header: string;
  hasFilter: boolean;

  hasSorting: boolean;

  matchModeOptions?: Array<SelectItem>;

  translationColumnKey: string;

  mappedProperty: string;
}
