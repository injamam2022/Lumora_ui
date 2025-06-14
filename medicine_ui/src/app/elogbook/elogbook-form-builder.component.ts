import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ElogListOfData, ElogsCreation } from './interface/elogbook.interface';
import { ProcessExecutionService } from '../shared/services/process-execution.service';
import { Router } from '@angular/router';
import { ToasterService } from '../shared/services/toaster.service';

interface ElogbookParameter {
  parameter_name: string;
  parameter_description: string;
  parameter_type_id: string;
  multiSelectOptions?: string[];
  min_value?: number;
  max_value?: number;
  validation_rule?: string;
  validation_type_id?: string;
  validation_message?: string;
  user_value?: any;
}

@Component({
  selector: 'app-elogbook-form-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextareaModule, DropdownModule,SidebarComponent,HeaderComponent],
  templateUrl: './elogbook-form-builder.component.html',
  styleUrl: './elogbook-form-builder.component.scss',
})
export class ElogbookFormBuilderComponent {
  @Output() saveElogbook = new EventEmitter<any>();

  public elogsCreationData: ElogListOfData = {
    elogs_name: '',
    format_number: '',
    reference_document: '',
    sop_id: '',
  };

  public eLogIdCreated!:number;
  public showParameterSection: boolean = false;

  public parameters: ElogbookParameter[] = [];
  public parameterTypes = [
    { parameter_type_id: '1', parameter_type_name: 'Text' },
    { parameter_type_id: '2', parameter_type_name: 'Textarea' },
    { parameter_type_id: '3', parameter_type_name: 'Date' },
    { parameter_type_id: '5', parameter_type_name: 'Multi-Select' },
  ];

  constructor(
    public processExecutionService: ProcessExecutionService,
    public router: Router,
    public toasterService: ToasterService
  ) {}

  addParameter() {
    this.parameters.push({
      parameter_name: '',
      parameter_description: '',
      parameter_type_id: '',
      multiSelectOptions: [],
    });
  }

  removeParameter(index: number) {
    this.parameters.splice(index, 1);
  }

  addMultiSelectOption(param: ElogbookParameter) {
    if (!param.multiSelectOptions) param.multiSelectOptions = [];
    param.multiSelectOptions.push('');
  }

  removeMultiSelectOption(param: ElogbookParameter, idx: number) {
    if (param.multiSelectOptions) param.multiSelectOptions.splice(idx, 1);
  }

  save() {
    console.log(this.parameters);

    const elogParametersPayload = {
      elog_id: this.eLogIdCreated,
      parameters: this.parameters.map(param => {
        const parameterPayload: any = { // Use 'any' type for flexibility due to uncertainty
          parameter_name: param.parameter_name,
          parameter_description: param.parameter_description,
          parameter_type_id: param.parameter_type_id,
          // Assuming backend links parameters to elog_id from the top level payload
          // task_id and stage_id might not be needed for elog parameters
        };

        if (param.parameter_type_id === '5' && param.multiSelectOptions) {
          parameterPayload.options = param.multiSelectOptions.map(option => ({
            options_for_parameter: option,
            // Might need parameter_id here if options are saved with the parameter
          }));
        }

        return parameterPayload;
      })
    };

    console.log('Payload to send for saving parameters:', elogParametersPayload);

    // **Here you would call the actual service method to save the parameters.**
    // Since the exact method for 'General/Save_parameters' is unknown,
    // I cannot implement the actual service call here.
    // You would replace this comment with something like:
    // this.elogbookService.saveElogParameters(elogParametersPayload).subscribe(...)
    // or
    this.processExecutionService.saveElogParameters(elogParametersPayload).subscribe((response) => {
      console.log(elogParametersPayload);
      console.log(response);
      if(response.stat == 200){
        this.toasterService.successToast('Parameters Saved Successfully');
      }
    });
  }

  createElogs() {
    console.log(this.elogsCreationData);
    this.processExecutionService
      .createElogsFirst(this.elogsCreationData)
      .subscribe((response) => {
        if (response.stat == 200) {
          this.eLogIdCreated = response.insert_id;
          this.toasterService.successToast(
            'Elog Created.You can Add Parameters'
          );
          this.showParameterSection = true;
          //this.router.navigate(['/elo/' + response.insert_id]);
        }
      });
  }
} 