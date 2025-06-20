import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PasswordModule } from 'primeng/password';
import { AddUserPayload } from '../interface/user.interface';
import { UserHttpClientService } from '../service/user-http-client.service';
import { FilterMatchMode } from 'primeng/api';
import { TableColumn } from '../interface/table-column.interface';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToasterService } from '../../shared/services/toaster.service';
import {
  Department,
  DepartmentData,
} from '../../department/interface/department.interface';
import { DepartmentService } from '../../department/services/department.service';
import { CommonModule } from '@angular/common';
import { Role } from '../../role/interface/role.interface';
import { FacilityService } from '../../facility/service/facility.service';
import { Facility } from '../../facility/interface/facility.interface';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessagesModule } from 'primeng/messages';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    FormsModule,
    DropdownModule,
    MultiSelectModule,
    CommonModule,
    ButtonModule,
    PasswordModule,
  ],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss',
})
export class AddUserComponent {
  // cities: City[] | undefined;

  // selectedCity: City | undefined;

  public addUserPayload: AddUserPayload = {
    role_id: 2,
    admin_name: '',
    email_id: '',
    password: '',
    department_id: 0,
  };

  public allDepartmentData!: DepartmentData;

  public allRoleData!: Role;

  public allFacilityData!: Facility;

  selectedFacilities!: string[];

  constructor(
    public departmentService: DepartmentService,
    public facilityService: FacilityService,
    public userHttpClientService: UserHttpClientService,
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

    console.log();
    if (this.config.data.purpose === 'edit') {
      this.userHttpClientService
        .getSingleUser(this.config.data.id)
        .subscribe((responseData) => {
          console.log(responseData);

          this.addUserPayload.admin_name = responseData.all_list[0].admin_name;
          this.addUserPayload.email_id = responseData.all_list[0].email_id;
          this.addUserPayload.department_id =
            responseData.all_list[0].department_id;
          this.getTheRoleId();
          this.addUserPayload.role_id = responseData.all_list[0].role_id;
          this.addUserPayload.password = btoa(
            responseData.all_list[0].password
          );
          //this.addUserPayload.facilities = responseData.data.facilities;
        });
    }
  }

  getTheRoleId() {
    console.log();
    this.userHttpClientService
      .getRoleRespectToDepartment(this.addUserPayload.department_id)
      .subscribe((responseData) => {
        console.log(responseData);
        this.allRoleData = responseData;
      });
  }

  public addCreationUser() {
    // console.log(this.selectedFacilities);

    // const data = Number(this.selectedFacilities);
    // this.addUserPayload.facilities.push(data);

    // console.log(this.addUserPayload);
    // return;

    this.addUserPayload.password = btoa(this.addUserPayload.password);

    if (this.config.data.purpose === 'edit') {
      this.userHttpClientService
        .updateUserData(this.addUserPayload, this.config.data.id)
        .subscribe((responseData) => {
          console.log(responseData);
          this.toasterService.successToast('User Updated');
          this.userHttpClientService.refreshTableData(true);
          this.ref.close();
        });
    } else if (this.config.data.purpose === 'add') {
      this.userHttpClientService
        .addUserCreation(this.addUserPayload)
        .subscribe((responseData) => {
          console.log(responseData);
          this.toasterService.successToast('User Created');
          this.userHttpClientService.refreshTableData(true);
          this.ref.close();
        });
    }
  }
  date2: Date | undefined;
}
