import { Component, Input } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { GenericTableComponent } from '../shared/components/generic-table/generic-table.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableColumn } from '../user/interface/table-column.interface';
import { FilterMatchMode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { LoginHttpClientService } from '../login/service/login-http-client.service';
import { Role } from './interface/role.interface';
import { CommonModule } from '@angular/common';
import { AddRoleComponent } from './add-role/add-role.component';
import { EntityIdMapping } from '../shared/enum/entity-is-mapping.enum';
import { ToasterService } from '../shared/services/toaster.service';
import { UserHttpClientService } from '../user/service/user-http-client.service';
import { RoleHttpClientService } from './service/role-http-client.service';
import { GlobalHttpClientService } from '../shared/services/global-dialog-http-client.service';
import { CheckModuleAccessService } from '../shared/services/check-module-access.service';
import { ModuleAccessSingle } from '../shared/interface/module-access.interface';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [
    SidebarComponent,
    HeaderComponent,
    GenericTableComponent,
    ButtonModule,
    CommonModule,
  ],
  templateUrl: './role.component.html',
  styleUrl: './role.component.scss',
})
export class RoleComponent {
  ref: DynamicDialogRef | undefined;

  public genericTableColumns: TableColumn[] = [
    {
      field: 'role_name',
      header: 'Role Name',
      hasFilter: true,
      hasSorting: true,
      matchModeOptions: [
        {
          label: 'Contains',
          value: FilterMatchMode.CONTAINS,
        },
      ],
      translationColumnKey: 'Role Name',
      mappedProperty: 'role_name',
    },
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
      field: 'facilities',
      header: 'Facilities',
      hasFilter: true,
      hasSorting: true,
      matchModeOptions: [
        {
          label: 'Contains',
          value: FilterMatchMode.CONTAINS,
        },
      ],
      translationColumnKey: 'Facilities',
      mappedProperty: 'facilities',
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

  public allRoleData!: Role;

  public entityIdMapping = EntityIdMapping;

  @Input() roleModuleId = '';

  public moduleAccess!: ModuleAccessSingle;

  public editButtonStatus = false;
  public deleteButtonStatus = false;

  constructor(
    public roleHttpClientService: RoleHttpClientService,
    public globalHttpClientService: GlobalHttpClientService,
    public dialogService: DialogService,
    public toasterService: ToasterService,
    public checkModuleAccessService: CheckModuleAccessService
  ) {}

  public ngOnInit() {
    // Set access flags from localStorage
    const access = this.checkModuleAccessService.getModuleAccess('role');
    this.editButtonStatus = !!(access && access.edit_status);
    this.deleteButtonStatus = !!(access && access.delete_status);

    this.roleHttpClientService.refreshRole$.subscribe((data) => {
      this.roleHttpClientService.getAllRoles().subscribe((response) => {
        console.log(response);
        this.allRoleData = response;
      });
    });
  }

  public openAddRoleDialog() {
    this.ref = this.dialogService.open(AddRoleComponent, {
      data: { purpose: 'add' },
      header: 'Add Role',
      width: '40%',
    });
  }

  public editParticularData(editId: string) {
    console.log(editId);
    this.ref = this.dialogService.open(AddRoleComponent, {
      header: 'Edit Role',
      data: { purpose: 'edit', id: editId },
      width: '40%',
    });
  }

  public deleteParticularData(deleteId: string) {
    //this.globalHttpClientService.showConfirmationDialog(any,'Are you Sure', 'hey',"s");
    //return;
    this.roleHttpClientService.deleteRole(deleteId).subscribe((response) => {
      console.log(response);
      if (response.status) {
        this.toasterService.successToast('Deleted Successfully');
        this.roleHttpClientService.refreshTableData(true);
      }
      //this.allRoleData = response;
    });
  }
}
