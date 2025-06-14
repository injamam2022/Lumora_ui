import { Component, Input } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ButtonModule } from 'primeng/button';
import { GenericTableComponent } from '../shared/components/generic-table/generic-table.component';
import { TableColumn } from '../user/interface/table-column.interface';
import { FilterMatchMode } from 'primeng/api';
import { DepartmentService } from './services/department.service';
import { DepartmentCreationComponent } from './department-creation/department-creation.component';
import { GlobalHttpClientService } from '../shared/services/global-dialog-http-client.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToasterService } from '../shared/services/toaster.service';
import { CommonModule } from '@angular/common';
import { Department, DepartmentData } from './interface/department.interface';
import { EntityIdMapping } from '../shared/enum/entity-is-mapping.enum';
import { CheckModuleAccessService } from '../shared/services/check-module-access.service';
import { RouterLinkActive, RouterOutlet } from '@angular/router';
import { ModuleAccessSingle } from '../shared/interface/module-access.interface';
import { DetailsSectionComponent } from '../shared/details-section/details-section.component';

@Component({
  selector: 'app-department',
  standalone: true,
  imports: [
    SidebarComponent,
    HeaderComponent,
    ButtonModule,
    GenericTableComponent,
    CommonModule,
    DetailsSectionComponent,
  ],
  templateUrl: './department.component.html',
  styleUrl: './department.component.scss',
})
export class DepartmentComponent {
  public genericTableColumns: TableColumn[] = [
    {
      field: 'department_name',
      header: 'Department Name',
      hasFilter: true,
      hasSorting: true,
      matchModeOptions: [
        {
          label: 'Contains',
          value: FilterMatchMode.CONTAINS,
        },
      ],
      translationColumnKey: 'Department Name',
      mappedProperty: 'department_name',
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

  public allDepartmentData!: DepartmentData;

  public entityIdMapping = EntityIdMapping;

  @Input() departmentModuleId = '';

  public moduleAccess!: ModuleAccessSingle;

  public editButtonStatus = false;
  public deleteButtonStatus = false;

  public constructor(
    public departmentService: DepartmentService,
    public globalHttpClientService: GlobalHttpClientService,
    public dialogService: DialogService,
    public toasterService: ToasterService,
    public checkModuleAccessService: CheckModuleAccessService
  ) {}
  public ngOnInit() {
    const access = this.checkModuleAccessService.getModuleAccess('department');
    this.editButtonStatus = !!(access && access.edit_status);
    this.deleteButtonStatus = !!(access && access.delete_status);

    this.checkModuleAccessService
      .getAccessRespectToModule(this.departmentModuleId)
      .subscribe((responseData) => {
        console.log(responseData);
        this.moduleAccess = responseData;
      });

    this.departmentService.refreshDepartment$.subscribe((data) => {
      this.departmentService.getAllDepartment().subscribe((response) => {
        console.log(response);
        this.allDepartmentData = response;
      });
    });
  }

  public openAddRoleDialog() {
    this.ref = this.dialogService.open(DepartmentCreationComponent, {
      data: { purpose: 'add' },
      header: 'Add Department',
      width: '40%',
    });
  }

  public editParticularData(editId: string) {
    console.log(editId);
    this.ref = this.dialogService.open(DepartmentCreationComponent, {
      header: 'Edit Department',
      data: { purpose: 'edit', id: editId },
      width: '40%',
    });
  }

  public deleteParticularData(deleteId: string) {
    //this.globalHttpClientService.showConfirmationDialog(any,'Are you Sure', 'hey',"s");
    //return;
    this.departmentService.deleteDepartment(deleteId).subscribe((response) => {
      console.log(response);
      if (response.stat == 200) {
        this.toasterService.successToast('Deleted Successfully');
        this.departmentService.refreshTableData(true);
      }
      //this.allRoleData = response;
    });
  }
}
