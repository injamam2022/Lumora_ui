import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AddRolePayload } from '../interface/role.interface';
import { RoleHttpClientService } from '../service/role-http-client.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToasterService } from '../../shared/services/toaster.service';
import { DepartmentService } from '../../department/services/department.service';
import {
  Department,
  DepartmentData,
} from '../../department/interface/department.interface';
import { DropdownModule } from 'primeng/dropdown';
import { FacilityService } from '../../facility/service/facility.service';
import { Facility } from '../../facility/interface/facility.interface';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-add-role',
  standalone: true,
  imports: [
    ButtonModule,
    FormsModule,
    CommonModule,
    DropdownModule,
    MultiSelectModule,
  ],
  templateUrl: './add-role.component.html',
  styleUrl: './add-role.component.scss',
})
export class AddRoleComponent {
  public addRolePayload: AddRolePayload = {
    role_name: '',
    department_id: 0,
    facilities: [],
  };

  public allDepartmentData!: DepartmentData;

  public allFacilityData!: Facility;

  constructor(
    public roleHttpClientService: RoleHttpClientService,
    public departmentService: DepartmentService,
    public facilityService: FacilityService,
    private readonly config: DynamicDialogConfig,
    private readonly toasterService: ToasterService,
    private readonly ref: DynamicDialogRef
  ) {}

  ngOnInit() {
    this.departmentService.getAllDepartment().subscribe((response) => {
      console.log(response);
      this.allDepartmentData = response;
    });

    this.facilityService.getAllFacility().subscribe((response) => {
      console.log('rrrrrr', response);
      this.allFacilityData = response;
    });

    if (this.config.data.purpose === 'edit') {
      this.roleHttpClientService
        .getSingleRole(this.config.data.id)
        .subscribe((responseData) => {
          console.log('edit', responseData);
          this.addRolePayload.role_name = responseData.all_list[0].role_name;
          this.addRolePayload.department_id =
            responseData.all_list[0].department_id;
        });
    }
  }

  public addCreationRole() {
    console.log(this.config.data.purpose);
    if (this.config.data.purpose === 'edit') {
      const updatePayload = {
        ...this.addRolePayload,
        role_id: this.config.data.id
      };
      this.roleHttpClientService
        .updateRole(updatePayload, this.config.data.id)
        .subscribe((response) => {
          console.log(response);
          this.toasterService.successToast('Role Added');
          //refresh Table Role Data
          this.roleHttpClientService.refreshTableData(true);
          this.ref.close();
        });
    } else if (this.config.data.purpose === 'add') {
      this.roleHttpClientService
        .addRole(this.addRolePayload)
        .subscribe((response) => {
          console.log(response);
          this.toasterService.successToast('Role Updated');
          //refresh Table Role Data
          this.roleHttpClientService.refreshTableData(true);
          this.ref.close();
        });
    }
  }
}
