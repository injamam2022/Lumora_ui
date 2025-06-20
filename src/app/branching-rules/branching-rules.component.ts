import { Component, Input } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { CardModule } from 'primeng/card';
import { ProcessExecutionService } from '../shared/services/process-execution.service';
import { ProcessListData } from '../manage-process/interface/manage-process-interface';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import {
  BranchingRules,
  BranchingRulesPayloadCreation,
  BranchingActionType,
  BranchingConditionOperator,
} from './interface/branching-rule.interface';
import { DropdownModule } from 'primeng/dropdown';
import {
  FetchParameterOptions,
  ParametersListDataResToTask,
  ProcessCreation,
  SingleStageTaskLIST,
  ParameterTypeAllList,
} from '../stage-creation/interface/process-creation.interface';
import { FormsModule } from '@angular/forms';
import { ToasterService } from '../shared/services/toaster.service';
import { InputTextModule } from 'primeng/inputtext';

interface SelectedOption {
  name: string;
  code: string;
}

@Component({
  selector: 'app-branching-rules',
  standalone: true,
  imports: [
    SidebarComponent,
    HeaderComponent,
    DropdownModule,
    CardModule,
    CommonModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
  ],
  templateUrl: './branching-rules.component.html',
  styleUrl: './branching-rules.component.scss',
})
export class BranchingRulesComponent {
  selectedOptions: SelectedOption[] | undefined;
  public BranchingActionType = BranchingActionType;
  public BranchingConditionOperator = BranchingConditionOperator;

  public getAllBranchingRulesData!: BranchingRules;

  @Input() public processId = '';

  public processCreationData: ProcessCreation = {
    data: {
      process_name: '',
      format_number: '',
      reference_document: '',
      sop_id: '',
      stages: [],
    },
  };

  public branchingRulesCreation: BranchingRulesPayloadCreation = {
    process_id: '',
    stage_id: '',
    task_id: '',
    parameter_id: '',
    parameter_value: '',
    operator: BranchingConditionOperator.EQUAL,
    target_parameter_id: undefined,
    action_type: BranchingActionType.HIDE_PARAMETER,
    display_message_content: undefined,
    validation_min_value: undefined,
    validation_max_value: undefined,
    validation_regex_pattern: undefined,
    validation_message_for_rule: undefined,
  };

  public stageWiseTaskList!: SingleStageTaskLIST;

  public parameterOptionList: FetchParameterOptions = { stat: 0, msg: '', list_count: 0, all_list: [] };

  public taskWiseParameterList!: ParametersListDataResToTask;

  public selectedParameterType: string | undefined;

  constructor(
    public processExecutionService: ProcessExecutionService,
    public toasterService: ToasterService
  ) {}

  ngOnInit() {
    this.selectedOptions = [
      { name: 'Yes', code: 'Yes' },
      { name: 'No', code: 'No' },
    ];

    //fetch all branching rules for a process
    this.processExecutionService
      .getAllProcessBranchingRules(this.processId)
      .subscribe((response) => {
        this.getAllBranchingRulesData = response;
        console.log('rules', this.getAllBranchingRulesData);
      });

    //fetch all stages for a process
    this.processExecutionService
      .getSingleProcessExecution(this.processId)
      .subscribe((response) => {
        this.processCreationData = response;
      });
  }

  fetchTaskRespectToStages(stageId: any) {
    console.log(stageId);
    this.processExecutionService
      .getTaskInfoRestoStage(stageId)
      .subscribe((response) => {
        this.stageWiseTaskList = response;
      });
  }

  fetchParameterRespectToTask(taskId: any) {
    this.processExecutionService
      .getParametersInfoRestoTask(taskId)
      .subscribe((response) => {
        this.taskWiseParameterList = response;
      });
  }

  fetchParameterOptionsToParameter(parameterId: any) {
    this.selectedParameterType = undefined;

    const selectedParam = this.taskWiseParameterList.data.find(param => param.parameter_id === parameterId);
    if (selectedParam) {
      this.selectedParameterType = selectedParam.parameter_type_id;
    }

    this.processExecutionService
      .getParametersOptionsRespectToTask(parameterId)
      .subscribe((response: any) => {
        this.parameterOptionList = response;
      });
  }

  addNewRules() {
    this.branchingRulesCreation.process_id = this.processId;
    this.processExecutionService
      .createBranchingRules(this.branchingRulesCreation)
      .subscribe((response: any) => {
        if (response.stat === 200) {
          this.toasterService.successToast('Rules Created Successfully');
          if (this.branchingRulesCreation.action_type === BranchingActionType.DISPLAY_MESSAGE) {
            this.branchingRulesCreation.display_message_content = undefined;
          } else if (this.branchingRulesCreation.action_type === BranchingActionType.APPLY_VALIDATION) {
            this.branchingRulesCreation.validation_min_value = undefined;
            this.branchingRulesCreation.validation_max_value = undefined;
            this.branchingRulesCreation.validation_regex_pattern = undefined;
            this.branchingRulesCreation.validation_message_for_rule = undefined;
          }
          this.processExecutionService
            .getAllProcessBranchingRules(this.processId)
            .subscribe((response) => {
              this.getAllBranchingRulesData = response;
              console.log('rules', this.getAllBranchingRulesData);
            });
        }
      });
  }

  public showSingleBranchingRules() {}

  onActionTypeChange(selectedType: string) {
    this.branchingRulesCreation.action_type = selectedType as BranchingActionType;
    this.branchingRulesCreation.target_parameter_id = undefined;
    this.branchingRulesCreation.display_message_content = undefined;
    this.branchingRulesCreation.validation_min_value = undefined;
    this.branchingRulesCreation.validation_max_value = undefined;
    this.branchingRulesCreation.validation_regex_pattern = undefined;
    this.branchingRulesCreation.validation_message_for_rule = undefined;
  }
}
