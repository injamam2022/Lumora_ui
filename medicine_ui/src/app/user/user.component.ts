import { Component, Input, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { GenericTableComponent } from '../shared/components/generic-table/generic-table.component';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialogModule,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { AddUserComponent } from './add-user/add-user.component';
import { InputTextModule } from 'primeng/inputtext';
import { FilterMatchMode } from 'primeng/api';
import { TableColumn } from './interface/table-column.interface';
import { UserHttpClientService } from './service/user-http-client.service';
import { AllUser } from './interface/user.interface';
import { CommonModule } from '@angular/common';
import { EntityIdMapping } from '../shared/enum/entity-is-mapping.enum';
import { ToasterService } from '../shared/services/toaster.service';
import { CheckModuleAccessService } from '../shared/services/check-module-access.service';
import { ModuleAccessSingle } from '../shared/interface/module-access.interface';
import { ChangeLogComponent } from '../shared/components/change-log/change-log.component';
import { ChangeLogHttpClientService } from '../shared/services/change-log-http-client.service';
import { ChangeLog } from '../shared/interface/change-log.interface';

@Component({
  selector: 'app-user',
  standalone: true,
  providers: [DialogService],
  imports: [
    SidebarComponent,
    HeaderComponent,
    GenericTableComponent,
    ButtonModule,
    DynamicDialogModule,
    InputTextModule,
    CommonModule,
    ChangeLogComponent,
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent {
  ref: DynamicDialogRef | undefined;

  public genericTableColumns: TableColumn[] = [
    {
      field: 'role_name',
      header: 'User Role',
      hasFilter: true,
      hasSorting: true,
      matchModeOptions: [
        {
          label: 'Contains',
          value: FilterMatchMode.CONTAINS,
        },
      ],
      translationColumnKey: 'User Role',
      mappedProperty: 'role_name',
    },
    {
      field: 'admin_name',
      header: 'Name',
      hasFilter: true,
      hasSorting: true,
      matchModeOptions: [
        {
          label: 'Contains',
          value: FilterMatchMode.CONTAINS,
        },
      ],
      translationColumnKey: 'Name',
      mappedProperty: 'admin_name',
    },

    {
      field: 'email_id',
      header: 'Email',
      hasFilter: true,
      hasSorting: true,
      matchModeOptions: [
        {
          label: 'Contains',
          value: FilterMatchMode.CONTAINS,
        },
      ],
      translationColumnKey: 'Email',
      mappedProperty: 'email_id',
    },
  ];

  public allUserData!: AllUser;

  public entityIdMapping = EntityIdMapping;

  @Input() userModuleId = '';

  public moduleAccess!: ModuleAccessSingle;

  public changeLogData!: ChangeLog;

  public editButtonStatus = false;
  public deleteButtonStatus = false;
  public addButtonStatus = false;

  constructor(
    public dialogService: DialogService,
    public userHttpClientService: UserHttpClientService,
    public toasterService: ToasterService,
    public checkModuleAccessService: CheckModuleAccessService,
    public changeLogHttpClientService: ChangeLogHttpClientService
  ) {}

  ngOnInit() {
    const access = this.checkModuleAccessService.getModuleAccess('user');
    this.editButtonStatus = !!(access && access.edit_status);
    this.deleteButtonStatus = !!(access && access.delete_status);
    this.addButtonStatus = !!(access && access.add_status);
    //for change Log
    this.userHttpClientService.refreshUserData$.subscribe((response) => {
      this.userHttpClientService.getAllUsers().subscribe((data) => {
        this.allUserData = data;
        console.log(this.allUserData);
      });

      this.changeLogHttpClientService
        .getChangeLogRespectToModule(this.userModuleId)
        .subscribe((responseData) => {
          console.log(responseData);
          this.changeLogData = responseData;
        });
    });
  }

  public openAddUserDialog() {
    console.log('Add User');

    this.ref = this.dialogService.open(AddUserComponent, {
      header: 'Add User',
      width: '40%',
      data: { purpose: 'add' },
    });
  }

  public editParticularData(editId: string) {
    console.log(editId);
    this.ref = this.dialogService.open(AddUserComponent, {
      header: 'Edit User',
      data: { purpose: 'edit', id: editId },
      width: '40%',
    });
  }

  public deleteParticularData(deleteId: string) {
    this.userHttpClientService.deleteUser(deleteId).subscribe((response) => {
      console.log(response);
      if (response.status) {
        this.toasterService.successToast('Deleted Successfully');
        this.userHttpClientService.refreshTableData(true);
      }
      //this.allRoleData = response;
    });
  }
}
