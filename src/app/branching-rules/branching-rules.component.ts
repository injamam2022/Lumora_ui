import { Component, Input } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { CardModule } from 'primeng/card';
import { ProcessExecutionService } from '../shared/services/process-execution.service';
import {
  BranchingRules,
  BranchingRulesPayloadCreation,
  BranchingActionType,
  BranchingConditionOperator,
} from './interface/branching-rule.interface';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import {
  FetchParameterOptions,
  ParametersListDataResToTask,
  ProcessCreation,
  SingleStageTaskLIST,
} from '../stage-creation/interface/process-creation.interface';
import { FormsModule } from '@angular/forms';
import { ToasterService } from '../shared/services/toaster.service';
import { InputTextModule } from 'primeng/inputtext';

interface RuleBlock extends BranchingRulesPayloadCreation {
  stage_name?: string;
  task_name?: string;
  parameter_name?: string;
  target_parameter_name?: string;
  display_message_content?: string;
  parameterOptions?: string[];
  parameterType?: string;
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
  public BranchingActionType = BranchingActionType;
  public BranchingConditionOperator = BranchingConditionOperator;

  @Input() public processId = '';

  public parameterOptionList: FetchParameterOptions = {
    stat: 0,
    msg: '',
    list_count: 0,
    all_list: [],
  };

  public processCreationData: ProcessCreation = {
    data: {
      process_name: '',
      format_number: '',
      reference_document: '',
      sop_id: '',
      stages: [],
    },
  };

  public getAllBranchingRulesData!: BranchingRules;

  public stageWiseTaskList!: SingleStageTaskLIST;

  public taskWiseParameterList!: ParametersListDataResToTask;
 
  public selectedParameterType: string | undefined;

  public ruleBlocks: RuleBlock[] = [];

  public operatorOptions = [
    { label: 'Equal To', value: BranchingConditionOperator.EQUAL },
    { label: 'Greater Than', value: BranchingConditionOperator.GREATER_THAN },
    { label: 'Less Than', value: BranchingConditionOperator.LESS_THAN },
  ];

  public actionTypeOptions = [
    { label: 'Hide Parameter', value: BranchingActionType.HIDE_PARAMETER },
    {
      label: 'Display Error Message',
      value: BranchingActionType.DISPLAY_MESSAGE,
    },
  ];

  public activeTab: 'addRule' | 'viewRules' = 'addRule';

  constructor(
    public processExecutionService: ProcessExecutionService,
    public toasterService: ToasterService
  ) {}

  ngOnInit() {
    this.loadInitialData();
    this.addRuleBlock();
  }

  loadInitialData() {
    this.processExecutionService
      .getAllProcessBranchingRules(this.processId)
      .subscribe((response) => {
        this.getAllBranchingRulesData = response;
      });

    this.processExecutionService
      .getSingleProcessExecution(this.processId)
      .subscribe((response) => {
        this.processCreationData = response;
      });
  }

  addRuleBlock() {
    this.ruleBlocks.push({
      process_id: this.processId,
      stage_id: '',
      task_id: '',
      parameter_id: '',
      parameter_value: '',
      operator: BranchingConditionOperator.EQUAL,
      action_type: BranchingActionType.HIDE_PARAMETER,
    });
  }

  deleteRuleBlock(index: number) {
    this.ruleBlocks.splice(index, 1);
  }

  onStageChange(stageId: string, index: number) {
    const rule = this.ruleBlocks[index];
    rule.stage_id = stageId;
    rule.task_id = '';
    rule.parameter_id = '';
    rule.parameter_value = '';
    rule.target_parameter_id = undefined;

    this.processExecutionService
      .getTaskInfoRestoStage(stageId)
      .subscribe((response) => {
        this.stageWiseTaskList = response;
      });
  }

  onTaskChange(taskId: string, index: number) {
    const rule = this.ruleBlocks[index];
    rule.task_id = taskId;
    rule.parameter_id = '';
    rule.parameter_value = '';

    this.processExecutionService
      .getParametersInfoRestoTask(taskId)
      .subscribe((response) => {
        this.taskWiseParameterList = response;
      });
  }

  onParameterChange(parameterId: string, index: number) {
    const rule = this.ruleBlocks[index];
    const selectedParam = this.taskWiseParameterList?.data?.find(
      (param) => param.parameter_id === parameterId
    );
    rule.parameter_id = parameterId;
    rule.parameter_value = '';
    rule.parameterType = selectedParam?.parameter_type_id;

    this.processExecutionService
      .getParametersOptionsRespectToTask(parameterId)
      .subscribe((response: any) => {
        this.parameterOptionList = response;
        rule.parameterOptions = response?.all_list || [];
      });
  }

  onActionTypeChange(selectedType: string, index: number) {
    const rule = this.ruleBlocks[index];
    rule.action_type = selectedType as BranchingActionType;
    rule.target_parameter_id = undefined;
    rule.display_message_content = undefined;
    rule.validation_min_value = undefined;
    rule.validation_max_value = undefined;
    rule.validation_regex_pattern = undefined;
    rule.validation_message_for_rule = undefined;
  }

  submitAllRules() {
    const validRules = this.ruleBlocks.filter(
      (rule) =>
        rule.stage_id &&
        rule.task_id &&
        rule.parameter_id &&
        rule.parameter_value &&
        rule.operator &&
        rule.action_type
    );

    if (validRules.length === 0) {
      this.toasterService.errorToast(
        'Please fill in all rule details correctly.'
      );
      return;
    }

    console.log(validRules);

    //const payload = validRules.map(({ parameterOptions, ...rest }) => rest);

    this.processExecutionService.createBranchingRulesBulk(validRules).toPromise().then(() => {
      this.toasterService.successToast('All rules saved successfully.');
      this.ruleBlocks = [];
      this.addRuleBlock();
      this.loadInitialData();
    });
  }

  deleteRule(branchingRulesId: string) {
    this.processExecutionService.deleteBranchingRules(branchingRulesId).toPromise().then(() => {
      this.toasterService.successToast('Rule deleted successfully.');
      this.loadInitialData();
    });
  }
}
