import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProcessExecutionService } from '../../../services/process-execution.service';
import { ToasterService } from '../../../services/toaster.service';

// Interfaces
import {
  Parameter,
  ParameterOptions,
  ParameterTypeList,
} from '../../../../stage-creation/interface/process-creation.interface';

@Component({
  selector: 'app-parameter-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextareaModule,
    DropdownModule,
  ],
  templateUrl: './parameter-dialog.component.html',
  styleUrls: ['./parameter-dialog.component.scss'],
})
export class ParameterDialogComponent implements OnInit {
  public formCreation: Parameter = {
    task_id: '1',
    stage_id: '1',
    parameter_type_id: '',
    parameter_description: '',
    parameter_name: '',
  };

  public formOptionCreation: ParameterOptions = {
    parameter_id: '',
    options_for_parameter: '',
    option_selected: '',
  };

  public parameterTypes!: ParameterTypeList;
  public multiSelectOptions: string[] = [];

  constructor(
    @Inject(DynamicDialogRef) public ref: DynamicDialogRef,
    public processExecutionService: ProcessExecutionService,
    private readonly config: DynamicDialogConfig,
    public readonly toasterService: ToasterService
  ) {}

  ngOnInit() {
    this.fetchParameterTypes();
    // Set elogs_id from config if present
    if (this.config.data && this.config.data.elogs_id) {
      (this.formCreation as any).elogs_id = this.config.data.elogs_id;
    }
  }

  fetchParameterTypes() {
    this.processExecutionService.getAllParameterTypes().subscribe({
      next: (response) => {
        this.parameterTypes = response;
      },
      error: (err) => {
        console.error('Failed to load parameter types:', err);
      },
    });
  }

  handleParameterTypeChange() {
    if (this.formCreation.parameter_type_id === '5') {
      this.multiSelectOptions = ['']; // Start with 1 option
    } else {
      this.multiSelectOptions = [];
    }
  }

  addMultiSelectOption() {
    this.multiSelectOptions.push('');
  }

  removeMultiSelectOption(index: number) {
    this.multiSelectOptions.splice(index, 1);
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  saveParameterFields() {
    // Ensure elogs_id is set
    if (this.config.data && this.config.data.elogs_id) {
      (this.formCreation as any).elogs_id = this.config.data.elogs_id;
    }

    // Only send fields required by param_master (do NOT include options)
    const paramPayload: any = {
      elogs_id: (this.formCreation as any).elogs_id,
      parameter_name: this.formCreation.parameter_name,
      parameter_description: this.formCreation.parameter_description,
      parameter_type_id: this.formCreation.parameter_type_id,
    };

    this.processExecutionService.createParameter(paramPayload).subscribe({
      next: (response) => {
        if (response.stat === 200) {
          this.toasterService.successToast('Parameter Created Successfully');

          if (this.formCreation.parameter_type_id === '5') {
            // Only if multiselect
            const parameter_id = response.insert_id;

            this.multiSelectOptions.forEach((option: string) => {
              const parameterOptionPayload = {
                parameter_options: {
                  parameter_id: parameter_id,
                  options_for_parameter: option,
                },
              };

              this.processExecutionService
                .createParameterOptions(parameterOptionPayload)
                .subscribe((responseOptions) => {
                  if (responseOptions.stat === 200) {
                    console.log('Option created:', option);
                  }
                });
            });

            this.ref.close(this.formCreation);
          } else {
            // If not multiselect, close directly
            this.ref.close(this.formCreation);
          }
        }
      },
      error: (error) => {
        this.toasterService.errorToast('Failed to create parameter');
      },
    });
  }
}
