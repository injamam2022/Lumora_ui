import { Component, Input } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ButtonModule } from 'primeng/button';
import { GenericTableComponent } from '../shared/components/generic-table/generic-table.component';
import { ModuleAccessSingle } from '../shared/interface/module-access.interface';
import { GlobalHttpClientService } from '../shared/services/global-dialog-http-client.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToasterService } from '../shared/services/toaster.service';
import { CheckModuleAccessService } from '../shared/services/check-module-access.service';
import { TableColumn } from '../user/interface/table-column.interface';
import { FilterMatchMode } from 'primeng/api';
import { FacilityCreationComponent } from './facility-creation/facility-creation.component';
import { FacilityService } from './service/facility.service';
import { Facility } from './interface/facility.interface';
import { EntityIdMapping } from '../shared/enum/entity-is-mapping.enum';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-facility',
  standalone: true,
  imports: [
    SidebarComponent,
    HeaderComponent,
    ButtonModule,
    GenericTableComponent,
    CommonModule,
  ],
  templateUrl: './facility.component.html',
  styleUrl: './facility.component.scss',
})
export class FacilityComponent {
  public moduleAccess!: ModuleAccessSingle;

  public genericTableColumns: TableColumn[] = [
    {
      field: 'location_full_address',
      header: 'Location Full Address',
      hasFilter: true,
      hasSorting: true,
      matchModeOptions: [
        {
          label: 'Contains',
          value: FilterMatchMode.CONTAINS,
        },
      ],
      translationColumnKey: 'Location Full Address',
      mappedProperty: 'location_full_address',
    },
    {
      field: 'location_phone',
      header: 'Phone',
      hasFilter: true,
      hasSorting: true,
      matchModeOptions: [
        {
          label: 'Contains',
          value: FilterMatchMode.CONTAINS,
        },
      ],
      translationColumnKey: 'Phone',
      mappedProperty: 'location_phone',
    },
    {
      field: 'location_postcode',
      header: 'Postal Code',
      hasFilter: true,
      hasSorting: true,
      matchModeOptions: [
        {
          label: 'Contains',
          value: FilterMatchMode.CONTAINS,
        },
      ],
      translationColumnKey: 'Postal Code',
      mappedProperty: 'location_postcode',
    },
    {
      field: 'added_date',
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
      mappedProperty: 'added_date',
    },
  ];

  public ref: DynamicDialogRef | undefined;

  @Input() facilityModuleId = '';

  public allFacilityData!: Facility;

  public entityIdMapping = EntityIdMapping;

  public editButtonStatus = false;
  public deleteButtonStatus = false;

  constructor(
    public globalHttpClientService: GlobalHttpClientService,
    public dialogService: DialogService,
    public toasterService: ToasterService,
    public checkModuleAccessService: CheckModuleAccessService,
    public facilityService: FacilityService
  ) {}

  public ngOnInit() {
    const access = this.checkModuleAccessService.getModuleAccess('facility');
    this.editButtonStatus = !!(access && access.edit_status);
    this.deleteButtonStatus = !!(access && access.delete_status);

    this.checkModuleAccessService
      .getAccessRespectToModule(this.facilityModuleId)
      .subscribe((responseData) => {
        console.log(responseData);
        this.moduleAccess = responseData;
      });

    this.facilityService.refreshFacility$.subscribe((data) => {
      this.facilityService.getAllFacility().subscribe((response) => {
        console.log('gggg', response);
        this.allFacilityData = response;
      });
    });
  }

  public openAddFacilityDialog() {
    this.ref = this.dialogService.open(FacilityCreationComponent, {
      data: { purpose: 'add' },
      header: 'Add Facility',
      width: '40%',
    });
  }

  public editParticularData(editId: string) {
    console.log(editId);
    this.ref = this.dialogService.open(FacilityCreationComponent, {
      header: 'Edit Facility',
      data: { purpose: 'edit', id: editId },
      width: '40%',
    });
  }

  public deleteParticularData(deleteId: string) {
    this.facilityService.deleteFacility(deleteId).subscribe((response) => {
      console.log(response);
      if (response.stat === 200) {
        this.toasterService.successToast(response.msg);
        this.facilityService.refreshTableData(true);
      }
      //this.allRoleData = response;
    });
  }
}
