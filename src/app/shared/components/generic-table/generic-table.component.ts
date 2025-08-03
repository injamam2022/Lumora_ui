import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { UserHttpClientService } from '../../../user/service/user-http-client.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';
import { ProgressBar, ProgressBarModule } from 'primeng/progressbar';
import { TableColumn } from '../../../user/interface/table-column.interface';
import { Entity } from '../../type/entity.type';
import { CommonModule } from '@angular/common';
import { EntityIdMapping } from '../../enum/entity-is-mapping.enum';

export interface Country {
  name?: string;
  code?: string;
}

export interface Representative {
  name?: string;
  image?: string;
}

export interface Customer {
  id?: number;
  name?: string;
  country?: Country;
  company?: string;
  date?: string | Date;
  status?: string;
  activity?: number;
  representative?: Representative;
  verified?: boolean;
  balance?: number;
}

@Component({
  selector: 'app-generic-table',
  standalone: true,
  imports: [
    TableModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MultiSelectModule,
    DropdownModule,
    TagModule,
    ButtonModule,
    SliderModule,
    ProgressBarModule,
    CommonModule,
  ],
  templateUrl: './generic-table.component.html',
  styleUrl: './generic-table.component.scss',
})
export class GenericTableComponent {
  customers!: Customer[];

  representatives!: Representative[];

  statuses!: any[];

  loading: boolean = true;

  activityValues: number[] = [0, 100];

  //generic table

  @Input() public genericTableColumns: TableColumn[] = [];

  //Fetching the Generic Table Data
  @Input() public genericTableData!: Entity;

  @Input() public entityIdMapping!: EntityIdMapping;

  @Input() public editButtonStatus!: boolean;

  @Input() public assignButtonStatus!: boolean;

  @Input() public deleteButtonStatus!: boolean;

  @Output() public editEvent = new EventEmitter<string>();

  @Output() public deleteEvent = new EventEmitter<string>();

  @Output() public assignEvent = new EventEmitter<string>();
  disabled: { [klass: string]: any } | null | undefined;

  constructor(private customerService: UserHttpClientService) {}

  ngOnInit() {
    this.representatives = [
      { name: 'Amy Elsner', image: 'amyelsner.png' },
      { name: 'Anna Fali', image: 'annafali.png' },
      { name: 'Asiya Javayant', image: 'asiyajavayant.png' },
      { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
      { name: 'Elwin Sharvill', image: 'elwinsharvill.png' },
      { name: 'Ioni Bowcher', image: 'ionibowcher.png' },
      { name: 'Ivan Magalhaes', image: 'ivanmagalhaes.png' },
      { name: 'Onyama Limba', image: 'onyamalimba.png' },
      { name: 'Stephen Shaw', image: 'stephenshaw.png' },
      { name: 'Xuxue Feng', image: 'xuxuefeng.png' },
    ];

    this.statuses = [
      { label: 'Unqualified', value: 'unqualified' },
      { label: 'Qualified', value: 'qualified' },
      { label: 'New', value: 'new' },
      { label: 'Negotiation', value: 'negotiation' },
      { label: 'Renewal', value: 'renewal' },
      { label: 'Proposal', value: 'proposal' },
    ];
  }

  clear(table: Table) {
    table.clear();
  }

  triggerEditEvent(id: string) {
    this.editEvent.emit(id);
  }

  triggerDeleteEvent(id: string) {
    console.log('=== TRIGGER DELETE EVENT ===');
    console.log('Delete ID:', id);
    console.log('Delete ID type:', typeof id);
    console.log('Delete button status:', this.deleteButtonStatus);
    this.deleteEvent.emit(id);
  }

  triggerAssignEvent(id: string) {
    this.assignEvent.emit(id);
  }

  public getEntityId(tableEntryData: Entity, entityIdMapped: EntityIdMapping) {
    console.log('=== GET ENTITY ID ===');
    console.log('Table entry data:', tableEntryData);
    console.log('Entity ID mapped:', entityIdMapped);
    const entityId = tableEntryData[entityIdMapped as unknown as keyof Entity] as string;
    console.log('Extracted entity ID:', entityId);
    return entityId;
  }

  getCreationStatusSeverity(status: any): any {
    console.log(status);
    if (status == 0) {
      return 'Pending';
    } else {
      return 'Completed';
    }
  }
}
