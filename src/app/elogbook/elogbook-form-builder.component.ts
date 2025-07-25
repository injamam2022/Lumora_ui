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
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from '../shared/services/toaster.service';
import { ElogbookService } from '../shared/services/elog-execution.service';
import { ParameterManagementComponent } from '../shared/components/parameter-management/parameter-management/parameter-management.component';
import { ElogbookParameterListComponent } from './elogbook-parameter-list.component';

interface ElogbookParameter {
  param_id?: string;
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
  imports: [CommonModule, FormsModule, ButtonModule, InputTextareaModule, DropdownModule,SidebarComponent,HeaderComponent, ElogbookParameterListComponent],
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

  public parameterList: any[] = [];
  public elogbookBranchingRules: any[] = [];
  public showAddRule = false;
  public operatorOptions = [
    { label: 'Equal To', value: '=' },
    { label: 'Greater Than', value: '>' },
    { label: 'Less Than', value: '<' }
  ];
  public actionTypeOptions = [
    { label: 'Hide Parameter', value: 'hide_parameter' },
    { label: 'Display Error Message', value: 'display_message' },
    { label: 'Apply Validation', value: 'apply_validation' }
  ];
  public newRule: any = {
    parameter_id: '',
    parameter_value: '',
    operator: '=',
    action_type: 'hide_parameter',
    target_parameter_id: '',
    display_message_content: '',
    validation_min_value: '',
    validation_max_value: '',
    validation_regex_pattern: '',
    validation_message_for_rule: ''
  };

  constructor(
    public processExecutionService: ProcessExecutionService,
    public router: Router,
    public toasterService: ToasterService,
    public elogbookService: ElogbookService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const elogs_id = params['id'];
      if (elogs_id) {
        // Editing existing Elogbook
        this.eLogIdCreated = +elogs_id;
        const { elogbook$, parameters$ } = this.elogbookService.getSingleElogbookWithParameters(elogs_id);
        elogbook$.subscribe(res => {
          if (res.all_list && res.all_list.length > 0) {
            const elog = res.all_list[0];
            this.elogsCreationData = {
              elogs_id: elog.elogs_id,
              elogs_name: elog.elogs_name,
              reference_document: elog.reference_document,
              sop_id: elog.sop_id,
              format_number: elog.format_number,
              added_date: elog.added_date
            };
            this.showParameterSection = true;
          }
        });
        parameters$.subscribe(res => {
          if (res.all_list) {
            this.parameters = res.all_list.map((param: any) => ({
              param_id: param.param_id,
              parameter_name: param.parameter_name,
              parameter_description: param.parameter_description,
              parameter_type_id: param.parameter_type_id,
              multiSelectOptions: param.options ? param.options.split(',') : []
            }));
          }
        });
        // Fetch elogbook branching rules
        this.elogbookService.getElogbookBranchingRules(elogs_id).subscribe(res => {
          this.elogbookBranchingRules = res.data || [];
        });
      }
    });
  }

  save() {
    // Build the payload for update
    const cleanedParameters = this.parameterList.map((param: any) => ({
      ...(param.param_id ? { param_id: param.param_id } : {}),
      parameter_name: param.parameter_name,
      parameter_description: param.parameter_description,
      parameter_type_id: param.parameter_type_id,
      ...(param.parameter_type_id === '5' ? { multiSelectOptions: param.options || [] } : {})
    }));
    const elogbookPayload = {
      elogs_master: {
        elogs_id: this.eLogIdCreated,
        elogs_name: this.elogsCreationData.elogs_name,
        reference_document: this.elogsCreationData.reference_document,
        sop_id: this.elogsCreationData.sop_id,
        format_number: this.elogsCreationData.format_number,
        added_date: this.elogsCreationData.added_date
      },
      parameters: cleanedParameters
    };
    this.elogbookService.updateElogbookWithParameters(elogbookPayload).subscribe((response) => {
      if(response.stat === 200){
        this.toasterService.successToast('E-Logbook and Parameters Updated Successfully');
      } else {
        this.toasterService.errorToast('Failed to update E-Logbook and Parameters');
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

  addBranchingRule() {
    if (!this.eLogIdCreated || !this.newRule.parameter_id || !this.newRule.parameter_value || !this.newRule.operator || !this.newRule.action_type) {
      this.toasterService.errorToast('Please fill all required fields to add a rule.');
      return;
    }
    const payload: any = {
      branching_rules: {
        elog_id: this.eLogIdCreated,
        parameter_id: this.newRule.parameter_id,
        parameter_value: this.newRule.parameter_value,
        operator: this.newRule.operator,
        action_type: this.newRule.action_type
      }
    };
    if (this.newRule.action_type === 'hide_parameter') {
      payload.branching_rules.target_parameter_id = this.newRule.target_parameter_id;
    }
    if (this.newRule.action_type === 'display_message') {
      payload.branching_rules.display_message_content = this.newRule.display_message_content;
    }
    if (this.newRule.action_type === 'apply_validation') {
      payload.branching_rules.validation_min_value = this.newRule.validation_min_value;
      payload.branching_rules.validation_max_value = this.newRule.validation_max_value;
      payload.branching_rules.validation_regex_pattern = this.newRule.validation_regex_pattern;
      payload.branching_rules.validation_message_for_rule = this.newRule.validation_message_for_rule;
    }
    this.elogbookService.addElogbookBranchingRule(payload).subscribe(res => {
      if (res.stat === 200) {
        this.toasterService.successToast('Rule added successfully');
        this.elogbookService.getElogbookBranchingRules(this.eLogIdCreated.toString()).subscribe(rulesRes => {
          this.elogbookBranchingRules = rulesRes.data || [];
        });
        this.newRule = {
          parameter_id: '',
          parameter_value: '',
          operator: '=',
          action_type: 'hide_parameter',
          target_parameter_id: '',
          display_message_content: '',
          validation_min_value: '',
          validation_max_value: '',
          validation_regex_pattern: '',
          validation_message_for_rule: ''
        };
        this.showAddRule = false;
      } else {
        this.toasterService.errorToast('Failed to add rule');
      }
    });
  }

  deleteBranchingRule(branching_rules_id: string) {
    const payload = { branching_rules: { branching_rules_id } };
    this.elogbookService.deleteElogbookBranchingRule(payload).subscribe(res => {
      if (res.stat === 200) {
        this.toasterService.successToast('Rule deleted successfully');
        this.elogbookService.getElogbookBranchingRules(this.eLogIdCreated.toString()).subscribe(rulesRes => {
          this.elogbookBranchingRules = rulesRes.data || [];
        });
      } else {
        this.toasterService.errorToast('Failed to delete rule');
      }
    });
  }
}
