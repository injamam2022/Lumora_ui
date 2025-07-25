import { Component, Input } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ButtonModule } from 'primeng/button';
import { GenericTableComponent } from '../shared/components/generic-table/generic-table.component';
import { TableColumn } from '../user/interface/table-column.interface';
import { FilterMatchMode } from 'primeng/api';
import { MaterialService } from './services/material.service';
import { MaterialCreationComponent } from './material-creation/material-creation.component';
import { GlobalHttpClientService } from '../shared/services/global-dialog-http-client.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToasterService } from '../shared/services/toaster.service';
import { CommonModule } from '@angular/common';
import { Material, MaterialData } from './interface/material.interface';
import { EntityIdMapping } from '../shared/enum/entity-is-mapping.enum';
import { CheckModuleAccessService } from '../shared/services/check-module-access.service';
import { RouterLinkActive, RouterOutlet } from '@angular/router';
import { ModuleAccessSingle } from '../shared/interface/module-access.interface';
import { DetailsSectionComponent } from '../shared/details-section/details-section.component';

@Component({
  selector: 'app-material',
  standalone: true,
  imports: [
    SidebarComponent,
    HeaderComponent,
    ButtonModule,
    GenericTableComponent,
    CommonModule,
    DetailsSectionComponent,
  ],
  templateUrl: './material.component.html',
  styleUrl: './material.component.scss',
})
export class MaterialComponent {
  public genericTableColumns: TableColumn[] = [
    { field: 'product_name', header: 'Product Name', hasFilter: true, hasSorting: true, matchModeOptions: [{ label: 'Contains', value: FilterMatchMode.CONTAINS }], translationColumnKey: 'Product Name', mappedProperty: 'product_name' },
    { field: 'product_desc', header: 'Product Description', hasFilter: true, hasSorting: true, matchModeOptions: [{ label: 'Contains', value: FilterMatchMode.CONTAINS }], translationColumnKey: 'Product Description', mappedProperty: 'product_desc' },
    { field: 'product_type', header: 'Product Type', hasFilter: true, hasSorting: true, matchModeOptions: [{ label: 'Contains', value: FilterMatchMode.CONTAINS }], translationColumnKey: 'Product Type', mappedProperty: 'product_type' },
    { field: 'created_at', header: 'Created At', hasFilter: true, hasSorting: true, matchModeOptions: [{ label: 'Contains', value: FilterMatchMode.CONTAINS }], translationColumnKey: 'Created At', mappedProperty: 'created_at' },
  ];
  ref: DynamicDialogRef | undefined;
  public allMaterialData!: MaterialData;
  public entityIdMapping = EntityIdMapping.Material;
  @Input() materialModuleId = '';
  public moduleAccess!: ModuleAccessSingle;
  public editButtonStatus = false;
  public deleteButtonStatus = false;
  public constructor(
    public materialService: MaterialService,
    public globalHttpClientService: GlobalHttpClientService,
    public dialogService: DialogService,
    public toasterService: ToasterService,
    public checkModuleAccessService: CheckModuleAccessService
  ) {}
  public ngOnInit() {
    const access = this.checkModuleAccessService.getModuleAccess('material');
    this.editButtonStatus = !!(access && access.edit_status);
    this.deleteButtonStatus = !!(access && access.delete_status);
    this.checkModuleAccessService.getAccessRespectToModule(this.materialModuleId).subscribe((responseData) => {
      this.moduleAccess = responseData;
    });
    this.materialService.refreshMaterial$.subscribe((data) => {
      this.materialService.getAllMaterials().subscribe((response) => {
        this.allMaterialData = response;
      });
    });
  }
  public openAddMaterialDialog() {
    this.ref = this.dialogService.open(MaterialCreationComponent, {
      data: { purpose: 'add' },
      header: 'Add Material',
      width: '40%',
    });
  }
  public editParticularData(editId: string) {
    this.ref = this.dialogService.open(MaterialCreationComponent, {
      header: 'Edit Material',
      data: { purpose: 'edit', id: editId },
      width: '40%',
    });
  }
  public deleteParticularData(deleteId: string) {
    this.materialService.deleteMaterial(deleteId).subscribe((response: any) => {
      if (response.stat == 200) {
        this.toasterService.successToast('Deleted Successfully');
        this.materialService.refreshTableData(true);
      }
    });
  }
} 