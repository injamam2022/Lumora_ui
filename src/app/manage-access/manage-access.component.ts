import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { TableModule } from 'primeng/table';
import { ManageAccessService } from './service/manage-access.service';
import {
  ManageAccess,
  ManageAccessPayload,
} from './interface/access.interface';
import { CommonModule } from '@angular/common';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { RoleHttpClientService } from '../role/service/role-http-client.service';
import { Role } from '../role/interface/role.interface';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { DepartmentService } from '../department/services/department.service';
import {
  Department,
  DepartmentData,
} from '../department/interface/department.interface';
import { UserHttpClientService } from '../user/service/user-http-client.service';
import { ToasterService } from '../shared/services/toaster.service';
import { CheckModuleAccessService } from '../shared/services/check-module-access.service';
import { ModuleAccessSingle } from '../shared/interface/module-access.interface';

@Component({
  selector: 'app-manage-access',
  standalone: true,
  imports: [
    SidebarComponent,
    HeaderComponent,
    TableModule,
    CommonModule,
    CheckboxModule,
    FormsModule,
    DropdownModule,
    ButtonModule,
  ],
  templateUrl: './manage-access.component.html',
  styleUrl: './manage-access.component.scss',
})
export class ManageAccessComponent {
  public accessModule!: ModuleAccessSingle;

  public storeRoleId = 0;

  public manageAccessPayload: ManageAccessPayload[] = [
    {
      roleId: 0,
      moduleId: 1,
      addFlag: true,
      editFlag: true,
      viewFlag: true,
      deleteFlag: true,
    },
  ];

  public allRoleData!: Role;

  public allDepartmentData!: DepartmentData;

  public accessSection = false;

  public constructor(
    public manageAccessService: ManageAccessService,
    public roleHttpClientService: RoleHttpClientService,
    public departmentService: DepartmentService,
    public userHttpClientService: UserHttpClientService,
    public toasterService: ToasterService,
    public checkModuleAccessService: CheckModuleAccessService
  ) {}

  ngOnInit() {
    this.departmentService.getAllDepartment().subscribe((response) => {
      console.log(response);
      this.allDepartmentData = response;
    });
  }

  fetchRoleRespectToDepartMent(departmentId: number) {
    // this.roleHttpClientService.getAllRoles().subscribe((response) => {
    //   console.log(response);
    //   this.allRoleData = response;
    // });
    // this.accessSection = false;

    this.userHttpClientService
      .getRoleRespectToDepartment(departmentId)
      .subscribe((responseData) => {
        console.log(responseData);
        this.allRoleData = responseData;
      });
  }

  selectTheRoleForAccess(roleId: number) {
    console.log(roleId);
    this.storeRoleId = roleId;
    this.checkModuleAccessService
      .getModuleRespectToRole(this.storeRoleId)
      .subscribe((responseData) => {
        // this.items = responseData.All_list;
        this.accessModule = responseData;
        console.log(this.accessModule.All_list);
      });
    // this.manageAccessService.getAccess(roleId).subscribe((response) => {
    //   console.log(response);
    //   this.accessModule = response;
    //   this.accessSection = true;
    //   console.log(this.accessModule);
    // });
  }

  selectEntireRow(event: CheckboxChangeEvent, rowIndex: number) {
    // Get the current row data
    const currentRow = this.accessModule.All_list[rowIndex];

    // Toggle the checkboxes of the specific row based on the "Select All" checkbox state
    currentRow.add_status = event.checked;
    currentRow.edit_status = event.checked;
    currentRow.delete_status = event.checked;
    currentRow.view_status = event.checked;
  }

  public saveModuleAccess() {
    const payload = {
      role_id: this.storeRoleId,
      module_access: this.accessModule.All_list.map((mod: any) => ({
        module_id: mod.module_id,
        add_status: mod.add_status,
        edit_status: mod.edit_status,
        delete_status: mod.delete_status,
        view_status: mod.view_status
      }))
    };

    this.manageAccessService.saveModuleAccess(payload).subscribe({
      next: (response: any) => {
        if (response.stat === 200) {
          this.toasterService.successToast('Module access updated successfully');
        } else if (response.stat === 400) {
          this.toasterService.errorToast('Role ID and module access data are required');
        } else if (response.stat === 500) {
          this.toasterService.errorToast('Failed to update module access');
        } else {
          this.toasterService.errorToast('Unknown error occurred');
        }
      },
      error: () => {
        this.toasterService.errorToast('Network or server error');
      }
    });
  }
}
