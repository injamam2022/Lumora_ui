import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AddDepartmentPayload } from '../interface/department.interface';
import { FormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DepartmentService } from '../services/department.service';
import { ToasterService } from '../../shared/services/toaster.service';

@Component({
  selector: 'app-department-creation',
  standalone: true,
  imports: [CommonModule, ButtonModule, FormsModule],
  templateUrl: './department-creation.component.html',
  styleUrl: './department-creation.component.scss',
})
export class DepartmentCreationComponent {
  public addDepartmentPayload: AddDepartmentPayload = {
    departmentName: '',
  };

  public constructor(
    private readonly config: DynamicDialogConfig,
    public departmentService: DepartmentService,
    public toasterService: ToasterService,
    private readonly ref: DynamicDialogRef
  ) {}

  ngOnInit() {
    if (this.config.data.purpose === 'edit') {
      this.departmentService
        .getSingleDepartment(this.config.data.id)
        .subscribe((responseData) => {
          console.log(responseData);
          this.addDepartmentPayload.departmentName =
            responseData.all_list[0].department_name;
        });
    }
  }

  public addCreation() {
    console.log(this.config.data.purpose);
    if (this.config.data.purpose === 'edit') {
      this.departmentService
        .updateDepartment(
          this.addDepartmentPayload.departmentName,
          this.config.data.id
        )
        .subscribe((response) => {
          console.log(response);
          this.toasterService.successToast('Department Updated');
          //refresh Table Role Data
          this.departmentService.refreshTableData(true);
        });
      this.ref.close();
    } else if (this.config.data.purpose === 'add') {
      this.departmentService
        .addDepartment(this.addDepartmentPayload.departmentName)
        .subscribe((response) => {
          console.log(response);
          this.toasterService.successToast('Department Added');
          //refresh Table Role Data
          this.departmentService.refreshTableData(true);
        });
      this.ref.close();
    }
  }
}
