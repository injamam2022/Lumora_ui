import { Component, Input } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ButtonModule } from 'primeng/button';
import { GenericTableComponent } from '../shared/components/generic-table/generic-table.component';
import { TableColumn } from '../user/interface/table-column.interface';
import { FilterMatchMode } from 'primeng/api';
import { FixedResourceService } from './services/fixed-resource.service';
import { FixedResourceCreationComponent } from './fixed-resource-creation/fixed-resource-creation.component';
import { GlobalHttpClientService } from '../shared/services/global-dialog-http-client.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToasterService } from '../shared/services/toaster.service';
import { CommonModule } from '@angular/common';
import { FixedResource, FixedResourceData } from './interface/fixed-resource.interface';
import { EntityIdMapping } from '../shared/enum/entity-is-mapping.enum';
import { CheckModuleAccessService } from '../shared/services/check-module-access.service';
import { RouterLinkActive, RouterOutlet } from '@angular/router';
import { ModuleAccessSingle } from '../shared/interface/module-access.interface';
import { DetailsSectionComponent } from '../shared/details-section/details-section.component';

@Component({
  selector: 'app-fixed-resource',
  standalone: true,
  imports: [
    SidebarComponent,
    HeaderComponent,
    ButtonModule,
    GenericTableComponent,
    CommonModule,
    DetailsSectionComponent,
  ],
  templateUrl: './fixed-resource.component.html',
  styleUrl: './fixed-resource.component.scss',
})
export class FixedResourceComponent {
  public genericTableColumns: TableColumn[] = [
    { field: 'resource_name', header: 'Resource Name', hasFilter: true, hasSorting: true, matchModeOptions: [{ label: 'Contains', value: FilterMatchMode.CONTAINS }], translationColumnKey: 'Resource Name', mappedProperty: 'resource_name' },
    { field: 'resource_type', header: 'Resource Type', hasFilter: true, hasSorting: true, matchModeOptions: [{ label: 'Contains', value: FilterMatchMode.CONTAINS }], translationColumnKey: 'Resource Type', mappedProperty: 'resource_type' },
    { field: 'resource_code', header: 'Resource Code', hasFilter: true, hasSorting: true, matchModeOptions: [{ label: 'Contains', value: FilterMatchMode.CONTAINS }], translationColumnKey: 'Resource Code', mappedProperty: 'resource_code' },
    { field: 'capacity_unit', header: 'Capacity Unit', hasFilter: true, hasSorting: true, matchModeOptions: [{ label: 'Contains', value: FilterMatchMode.CONTAINS }], translationColumnKey: 'Capacity Unit', mappedProperty: 'capacity_unit' },
    { field: 'capacity_quantity', header: 'Capacity Quantity', hasFilter: true, hasSorting: true, matchModeOptions: [{ label: 'Contains', value: FilterMatchMode.CONTAINS }], translationColumnKey: 'Capacity Quantity', mappedProperty: 'capacity_quantity' },
    { field: 'created_at', header: 'Created At', hasFilter: true, hasSorting: true, matchModeOptions: [{ label: 'Contains', value: FilterMatchMode.CONTAINS }], translationColumnKey: 'Created At', mappedProperty: 'created_at' },
  ];
  ref: DynamicDialogRef | undefined;
  public allFixedResourceData!: FixedResourceData;
  public entityIdMapping = EntityIdMapping.FixedResource;
  @Input() fixedResourceModuleId = '';
  public moduleAccess!: ModuleAccessSingle;
  public editButtonStatus = false;
  public deleteButtonStatus = false;
  public constructor(
    public fixedResourceService: FixedResourceService,
    public globalHttpClientService: GlobalHttpClientService,
    public dialogService: DialogService,
    public toasterService: ToasterService,
    public checkModuleAccessService: CheckModuleAccessService
  ) {}
  public ngOnInit() {
    const access = this.checkModuleAccessService.getModuleAccess('fixed_resource');
    this.editButtonStatus = !!(access && access.edit_status);
    this.deleteButtonStatus = !!(access && access.delete_status);
    this.checkModuleAccessService.getAccessRespectToModule(this.fixedResourceModuleId).subscribe((responseData) => {
      this.moduleAccess = responseData;
    });
    this.fixedResourceService.refreshFixedResource$.subscribe((data) => {
      this.fixedResourceService.getAllFixedResources().subscribe((response) => {
        this.allFixedResourceData = response;
      });
    });
  }
  public openAddFixedResourceDialog() {
    this.ref = this.dialogService.open(FixedResourceCreationComponent, {
      data: { purpose: 'add' },
      header: 'Add Fixed Resource',
      width: '40%',
    });
  }
  public editParticularData(editId: string) {
    this.ref = this.dialogService.open(FixedResourceCreationComponent, {
      header: 'Edit Fixed Resource',
      data: { purpose: 'edit', id: editId },
      width: '40%',
    });
  }
  public deleteParticularData(deleteId: string) {
    this.fixedResourceService.deleteFixedResource(deleteId).subscribe((response: any) => {
      if (response.stat == 200) {
        this.toasterService.successToast('Deleted Successfully');
        this.fixedResourceService.refreshTableData(true);
      }
    });
  }
}
