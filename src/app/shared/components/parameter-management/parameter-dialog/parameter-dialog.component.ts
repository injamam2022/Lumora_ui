import { Component, OnInit } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Parameter, ParameterTypeList, ParameterTypeAllList } from '../../../../stage-creation/interface/process-creation.interface';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToasterService } from '../../../services/toaster.service';
import { ProcessExecutionService } from '../../../services/process-execution.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-parameter-dialog',
  standalone: true,
  imports: [
    InputTextModule,
    DropdownModule,
    FormsModule,
    CommonModule,
    ButtonModule
  ],
  providers: [
    ProcessExecutionService,
    ToasterService
  ],
  templateUrl: './parameter-dialog.component.html',
  styleUrl: './parameter-dialog.component.scss'
})
export class ParameterDialogComponent implements OnInit {
  parameterTypes: ParameterTypeAllList[] = [];
  parameter: Parameter = {
    task_id: '',
    stage_id: '',
    parameter_name: '',
    parameter_description: '',
    parameter_type_id: '',
    options: []
  };

  constructor(
    private processExecutionService: ProcessExecutionService,
    private toasterService: ToasterService,
    public ref: DynamicDialogRef // Inject DynamicDialogRef
  ) {}

  ngOnInit() {
    this.loadParameterTypes();
  }

  loadParameterTypes() {
    this.processExecutionService.getAllParameterTypes().subscribe({
      next: (response: any) => {
        if (response && response.all_list) {
          this.parameterTypes = response.all_list;
        }
      },
      error: (error: any) => {
        this.toasterService.errorToast('Failed to load parameter types');
        console.error(error);
      }
    });
  }

  saveParameter() {
    this.processExecutionService.createParameter(this.parameter).subscribe({
      next: (response: any) => {
        this.toasterService.successToast('Parameter created successfully');
        this.ref.close(this.parameter);
      },
      error: (error: any) => {
        this.toasterService.errorToast('Failed to create parameter');
      },
    });
  }
}
