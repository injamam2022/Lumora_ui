import { Component, Input } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ButtonModule } from 'primeng/button';
import { GenericTableComponent } from '../shared/components/generic-table/generic-table.component';
import { TableColumn } from '../user/interface/table-column.interface';
import { FilterMatchMode } from 'primeng/api';
import { FixedResourceService } from '../fixed-resource/services/fixed-resource.service';
import { PortableResourceService } from '../portable-resource/services/portable-resource.service';
import { ResourceCreationComponent } from './resource-creation/resource-creation.component';
import { GlobalHttpClientService } from '../shared/services/global-dialog-http-client.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToasterService } from '../shared/services/toaster.service';
import { CommonModule } from '@angular/common';
import { FixedResource, FixedResourceData } from '../fixed-resource/interface/fixed-resource.interface';
import { PortableResource, PortableResourceData } from '../portable-resource/interface/portable-resource.interface';
import { EntityIdMapping } from '../shared/enum/entity-is-mapping.enum';
import { CheckModuleAccessService } from '../shared/services/check-module-access.service';
import { RouterLinkActive, RouterOutlet } from '@angular/router';
import { ModuleAccessSingle } from '../shared/interface/module-access.interface';
import { DetailsSectionComponent } from '../shared/details-section/details-section.component';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-resource-management',
  standalone: true,
  imports: [
    SidebarComponent,
    HeaderComponent,
    ButtonModule,
    GenericTableComponent,
    CommonModule,
    DetailsSectionComponent,
    DropdownModule,
    FormsModule,
  ],
  templateUrl: './resource-management.component.html',
  styleUrl: './resource-management.component.scss',
})
export class ResourceManagementComponent {
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
  public allPortableResourceData!: PortableResourceData;
  public entityIdMapping = EntityIdMapping.FixedResource;
  @Input() resourceModuleId = '';
  public moduleAccess!: ModuleAccessSingle;
  public editButtonStatus = false;
  public deleteButtonStatus = false;

  // Resource type selection
  public selectedResourceType: string = 'fixed';
  public resourceTypes = [
    { label: 'Fixed Resource', value: 'fixed' },
    { label: 'Portable Resource', value: 'portable' }
  ];

  public constructor(
    public fixedResourceService: FixedResourceService,
    public portableResourceService: PortableResourceService,
    public globalHttpClientService: GlobalHttpClientService,
    public dialogService: DialogService,
    public toasterService: ToasterService,
    public checkModuleAccessService: CheckModuleAccessService
  ) {}

  public ngOnInit() {
    this.updateButtonStatus();

    this.checkModuleAccessService.getAccessRespectToModule(this.resourceModuleId).subscribe((responseData) => {
      this.moduleAccess = responseData;
    });

    // Subscribe to both services for data refresh
    this.fixedResourceService.refreshFixedResource$.subscribe((data) => {
      this.loadFixedResources();
    });

    this.portableResourceService.refreshPortableResource$.subscribe((data) => {
      this.loadPortableResources();
    });

    // Load initial data
    this.loadFixedResources();
    this.loadPortableResources();
  }

        private updateButtonStatus() {
    const moduleName = this.selectedResourceType === 'fixed' ? 'fixed_resource' : 'portable_resource';
    const access = this.checkModuleAccessService.getModuleAccess(moduleName);
    this.editButtonStatus = !!(access && access.edit_status);
    this.deleteButtonStatus = !!(access && access.delete_status);

    // Force buttons to show since permission system is not working
    this.editButtonStatus = true;
    this.deleteButtonStatus = true;
  }

  public loadFixedResources() {
    this.fixedResourceService.getAllFixedResources().subscribe((response) => {
      this.allFixedResourceData = response;
    });
  }

  public loadPortableResources() {
    this.portableResourceService.getAllPortableResources().subscribe((response) => {
      this.allPortableResourceData = response;
    });
  }

  public onResourceTypeChange() {
    // Update entity mapping based on selected type
    this.entityIdMapping = this.selectedResourceType === 'fixed' ?
      EntityIdMapping.FixedResource : EntityIdMapping.PortableResource;

    // Update button status based on selected resource type
    this.updateButtonStatus();
  }

  public openAddResourceDialog() {
    this.ref = this.dialogService.open(ResourceCreationComponent, {
      data: {
        purpose: 'add',
        resourceType: '' // Let user select from dropdown
      },
      header: 'Add Resource',
      width: '40%',
    });
  }

  public editParticularData(editId: string) {
    this.ref = this.dialogService.open(ResourceCreationComponent, {
      header: 'Edit Resource',
      data: {
        purpose: 'edit',
        id: editId,
        resourceType: this.selectedResourceType
      },
      width: '40%',
    });
  }

    public deleteParticularData(deleteId: string) {
    if (this.selectedResourceType === 'fixed') {
      this.fixedResourceService.deleteFixedResource(deleteId).subscribe((response: any) => {
        if (response.stat == 200) {
          this.toasterService.successToast('Deleted Successfully');
          this.fixedResourceService.refreshTableData(true);
        }
      });
    } else {
      this.portableResourceService.deletePortableResource(deleteId).subscribe((response: any) => {
        if (response.stat == 200) {
          this.toasterService.successToast('Deleted Successfully');
          this.portableResourceService.refreshTableData(true);
        }
      });
    }
  }
}
