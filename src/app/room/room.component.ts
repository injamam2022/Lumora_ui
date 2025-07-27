import { Component, Input } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ButtonModule } from 'primeng/button';
import { GenericTableComponent } from '../shared/components/generic-table/generic-table.component';
import { TableColumn } from '../user/interface/table-column.interface';
import { FilterMatchMode } from 'primeng/api';
import { RoomService } from './services/room.service';
import { RoomCreationComponent } from './room-creation/room-creation.component';
import { GlobalHttpClientService } from '../shared/services/global-dialog-http-client.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToasterService } from '../shared/services/toaster.service';
import { CommonModule } from '@angular/common';
import { Room, RoomData } from './interface/room.interface';
import { EntityIdMapping } from '../shared/enum/entity-is-mapping.enum';
import { CheckModuleAccessService } from '../shared/services/check-module-access.service';
import { RouterLinkActive, RouterOutlet } from '@angular/router';
import { ModuleAccessSingle } from '../shared/interface/module-access.interface';
import { DetailsSectionComponent } from '../shared/details-section/details-section.component';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    SidebarComponent,
    HeaderComponent,
    ButtonModule,
    GenericTableComponent,
    CommonModule,
    DetailsSectionComponent,
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss',
})
export class RoomComponent {
  public genericTableColumns: TableColumn[] = [
    {
      field: 'room_name',
      header: 'Room Name',
      hasFilter: true,
      hasSorting: true,
      matchModeOptions: [
        {
          label: 'Contains',
          value: FilterMatchMode.CONTAINS,
        },
      ],
      translationColumnKey: 'Room Name',
      mappedProperty: 'room_name',
    },
    {
      field: 'room_type',
      header: 'Room Type',
      hasFilter: true,
      hasSorting: true,
      matchModeOptions: [
        {
          label: 'Contains',
          value: FilterMatchMode.CONTAINS,
        },
      ],
      translationColumnKey: 'Room Type',
      mappedProperty: 'room_type',
    },
    {
      field: 'section_area_id',
      header: 'Section Area ID',
      hasFilter: true,
      hasSorting: true,
      matchModeOptions: [
        {
          label: 'Contains',
          value: FilterMatchMode.CONTAINS,
        },
      ],
      translationColumnKey: 'Section Area ID',
      mappedProperty: 'section_area_id',
    },
    {
      field: 'assigned_resources',
      header: 'Assigned Fixed Resources',
      hasFilter: true,
      hasSorting: true,
      matchModeOptions: [
        {
          label: 'Contains',
          value: FilterMatchMode.CONTAINS,
        },
      ],
      translationColumnKey: 'Assigned Fixed Resources',
      mappedProperty: 'assigned_resources',
    },
    {
      field: 'created_at',
      header: 'Created At',
      hasFilter: true,
      hasSorting: true,
      matchModeOptions: [
        {
          label: 'Contains',
          value: FilterMatchMode.CONTAINS,
        },
      ],
      translationColumnKey: 'Created At',
      mappedProperty: 'created_at',
    },
  ];
  ref: DynamicDialogRef | undefined;

  public allRoomData!: RoomData;

  public entityIdMapping = EntityIdMapping;

  @Input() roomModuleId = '';

  public moduleAccess!: ModuleAccessSingle;

  public editButtonStatus = false;
  public deleteButtonStatus = false;

  public constructor(
    public roomService: RoomService,
    public globalHttpClientService: GlobalHttpClientService,
    public dialogService: DialogService,
    public toasterService: ToasterService,
    public checkModuleAccessService: CheckModuleAccessService
  ) {}
  public ngOnInit() {
    const access = this.checkModuleAccessService.getModuleAccess('room');
    this.editButtonStatus = !!(access && access.edit_status);
    this.deleteButtonStatus = !!(access && access.delete_status);

    this.checkModuleAccessService
      .getAccessRespectToModule(this.roomModuleId)
      .subscribe((responseData) => {
        this.moduleAccess = responseData;
      });

    this.roomService.refreshRoom$.subscribe((data) => {
      this.roomService.getAllRoomWithResources().subscribe({
        next: (response) => {
          console.log('Room with Resources Response:', response);
          this.allRoomData = response;
        },
        error: (error) => {
          console.error('Error fetching room with resources:', error);
          // Fallback to original method if new one fails
          this.roomService.getAllRoom().subscribe((fallbackResponse) => {
            console.log('Fallback Response:', fallbackResponse);
            this.allRoomData = fallbackResponse;
          });
        }
      });
    });
  }

  public openAddRoomDialog() {
    this.ref = this.dialogService.open(RoomCreationComponent, {
      data: { purpose: 'add' },
      header: 'Add Room',
      width: '40%',
    });
  }

  public editParticularData(editId: string) {
    this.ref = this.dialogService.open(RoomCreationComponent, {
      header: 'Edit Room',
      data: { purpose: 'edit', id: editId },
      width: '40%',
    });
  }

  public deleteParticularData(deleteId: string) {
    this.roomService.deleteRoom(deleteId).subscribe((response) => {
      if (response.stat == 200) {
        this.toasterService.successToast('Deleted Successfully');
        this.roomService.refreshTableData(true);
      }
    });
  }
}
