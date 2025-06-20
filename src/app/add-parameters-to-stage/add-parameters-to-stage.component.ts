import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProcessExecutionService } from '../shared/services/process-execution.service';
import { ToasterService } from '../shared/services/toaster.service';

// Interfaces
import {
  Parameter,
  ParameterOptions,
  ParameterTypeList,
} from '../stage-creation/interface/process-creation.interface';

@Component({
  selector: 'app-add-parameters-to-stage',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextareaModule,
    DropdownModule,
  ],
  templateUrl: './add-parameters-to-stage.component.html',
  styleUrls: ['./add-parameters-to-stage.component.scss'],
})
export class AddParametersToStageComponent {
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

  // saveParameterFields() {
  //   this.formCreation.stage_id = this.config.data.stage_id;
  //   this.formCreation.task_id = this.config.data.task_id;

  //   if (this.formCreation.parameter_type_id === '5') {
  //     this.formOptionCreation.options_for_parameter = JSON.stringify({
  //       parameter_options: this.multiSelectOptions,
  //     });
  //   }

  //   this.processExecutionService
  //     .createParameter(this.formCreation)
  //     .subscribe((response) => {
  //       if (response.stat === 200) {
  //         this.toasterService.successToast('Stage Created');
  //         if (this.formCreation.parameter_type_id === '5') {
  //           this.formOptionCreation.parameter_id = response.insert_id;
  //           this.processExecutionService
  //             .createParameterOptions(this.formOptionCreation)
  //             .subscribe((responseOptions) => {
  //               if (responseOptions.stat === 200) {
  //                 this.ref.close(this.formCreation);
  //               }
  //             });
  //         } else {
  //           this.ref.close(this.formCreation);
  //         }
  //       }
  //     });
  // }

  saveParameterFields() {
    this.formCreation.stage_id = this.config.data.stage_id;
    this.formCreation.task_id = this.config.data.task_id;

    this.processExecutionService
      .createParameter(this.formCreation)
      .subscribe((response) => {
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
      });
  }
}
