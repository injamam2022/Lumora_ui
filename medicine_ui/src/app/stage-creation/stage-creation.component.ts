import { Component, Input, NgZone } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { BranchingRulesComponent } from '../branching-rules/branching-rules.component';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { FacilityService } from '../facility/service/facility.service';
import { CommonModule } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AddParametersToStageComponent } from '../add-parameters-to-stage/add-parameters-to-stage.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProcessExecutionService } from '../shared/services/process-execution.service';
import { DragDropModule } from 'primeng/dragdrop';
import { CdkDragDrop, moveItemInArray, DragDropModule as CdkDragDropModule } from '@angular/cdk/drag-drop';
import { FacilityChooserComponent } from './facility-chooser/facility-chooser.component';
import { AllFacilityList } from '../facility/interface/facility.interface';

import {
  Parameter,
  ProcessCreation,
  SingleStageTaskLIST,
  TaskListStageWise,
} from './interface/process-creation.interface';
import { Router } from '@angular/router';
import { ToasterService } from '../shared/services/toaster.service';
import { BranchingActionType, BranchingRulesAll, BranchingConditionOperator } from '../branching-rules/interface/branching-rule.interface';

@Component({
  selector: 'app-stage-creation',
  standalone: true,
  imports: [
    SidebarComponent,
    HeaderComponent,
    CardModule,
    FormsModule,
    InputTextModule,
    CommonModule,
    MultiSelectModule,
    BranchingRulesComponent,
    DragDropModule,
    CdkDragDropModule,
    FacilityChooserComponent
  ],
  templateUrl: './stage-creation.component.html',
  styleUrl: './stage-creation.component.scss',
})
export class StageCreationComponent {
  public ref!: DynamicDialogRef;
  public selectedStageId: string = '';
  public parameterValidationErrors: Map<string, string | null> = new Map();
  public activeBranchingMessages: Map<string, string | null> = new Map();
  public allBranchingRules: BranchingRulesAll[] = [];

  public processCreationData: ProcessCreation = {
    data: {
      process_name: '',
      format_number: '',
      reference_document: '',
      sop_id: '',
      stages: [],
    },
  };

  public isEditMode = false;

  public holdCurrentStageId = '';

  public stageWiseTaskList!: SingleStageTaskLIST;

  @Input() public processId = '';

  selectedFacility: AllFacilityList | null = null;

  constructor(
    private ngZone: NgZone,
    public facilityService: FacilityService,
    public dialogService: DialogService,
    public processExecutionService: ProcessExecutionService,
    public router: Router,
    public toasterService: ToasterService
  ) {}
  activeTab: string = 'processCreation';
  setTab(tab: string) {
    this.activeTab = tab;
  }

  ngOnInit() {
    this.isEditMode = !!this.processId;

    if (this.isEditMode) {
      this.processExecutionService
        .getSingleProcessExecution(this.processId)
        .subscribe((response) => {
          this.processCreationData = response;
          // Select first stage by default if stages exist
          const stages = this.processCreationData?.data?.stages;
          if (stages && stages.length > 0) {
            const firstStage = stages[0];
            if (firstStage?.stage_id) {
              this.showSingleStageInfo(firstStage.stage_id);
            }
          }
          // Fetch branching rules after process data is loaded
          this.processExecutionService
            .getAllProcessBranchingRules(this.processId)
            .subscribe((branchingRulesResponse) => {
              this.allBranchingRules = branchingRulesResponse.data;
              this.checkAndDisplayBranchingMessages(); // Initial check
            });
        });
    }
  }

  showSingleStageInfo(stageId: any) {
    this.selectedStageId = stageId;
    this.holdCurrentStageId = stageId;
    this.processExecutionService
      .getTaskInfoRestoStage(stageId)
      .subscribe((response) => {
        this.stageWiseTaskList = response;
      });
  }

  moveToBranchingRules() {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/branching-rules', this.processId])
    );
    window.open(url, '_blank');
  }

  addNewStage() {
    const stages = this.processCreationData?.data?.stages ?? [];
    const newStageId = stages.length + 1;

    if (newStageId) {
      const newStage = { 
        process_id: this.processId,
        stage_name: `Stage ${newStageId}`,
        // stageDescription: `Description for Stage ${newStageId}`,
        // tasks: [], // optional, based on your interface
      };

      // Ensure the stages array exists
      if (!this.processCreationData.data.stages) {
        this.processCreationData.data.stages = [];
      }

      // Send only the newly created stage to the API
      this.processExecutionService
        .createStage(newStage)
        .subscribe((response) => {
          if (response.stat === 200) {
            this.toasterService.successToast('Stage Created');
            this.processExecutionService
              .getSingleProcessExecution(this.processId)
              .subscribe((response) => {
                this.processCreationData = response;
              });
          }
        });
    }
  }

  removeStage(stageId: any) {
    const stages = this.processCreationData.data.stages;
    if (stages?.length)
      this.processCreationData.data.stages = stages.filter(
        (stage) => stage.stage_id !== stageId
      );
  }

  addNewTask() {
    const taskCount = this.stageWiseTaskList.data.length;

    const newTask = {
      stage_id: this.holdCurrentStageId,
      task_name: `New Task ${taskCount + 1}`, // or anything dynamic you want
      // other properties if needed
    };

    this.processExecutionService
      .createTask(newTask)
      .subscribe((response: any) => {
        if (response.stat === 200) {
          this.showSingleStageInfo(this.holdCurrentStageId); // Only refresh this stage's task list
          this.toasterService.successToast('Task Created Successfully');
        }
      });
  }

  removeTask(taskIndex: number) {
    if (this.stageWiseTaskList?.data?.length > taskIndex) {
      this.stageWiseTaskList.data.splice(taskIndex, 1);
      this.toasterService.successToast('Task Removed');
    }
  }

  removeForm(taskIndex: number, formIndex: number) {
    const task = this.stageWiseTaskList?.data[taskIndex];
    if (task?.parameters && task.parameters.length > formIndex) {
      task.parameters.splice(formIndex, 1);
      this.toasterService.successToast('Parameter Removed');
    }
  }

  addParameters(taskIndex: number, taskId: any) {
    this.ref = this.dialogService.open(AddParametersToStageComponent, {
      header: 'Add Parameters',
      width: '40%',
      data: {
        stage_id: this.holdCurrentStageId,
        task_id: taskId,
      },
    });
    this.ref?.onClose.subscribe((formData: Parameter) => {
      if (formData) {
        if (this.stageWiseTaskList && this.stageWiseTaskList.data[taskIndex] && !this.stageWiseTaskList.data[taskIndex].parameters) {
          this.stageWiseTaskList.data[taskIndex].parameters = [];
        }
        this.stageWiseTaskList.data[taskIndex].parameters?.push(formData);
        this.toasterService.successToast('Parameter added successfully');
      }
    });
  }

  validateParameterInput(parameter: Parameter, inputValue: any): string | null {
    // Clear previous validation errors for this parameter
    if (parameter.parameter_id) {
      this.parameterValidationErrors.delete(parameter.parameter_id);
    }

    const applicableValidationRules = this.allBranchingRules.filter(rule => 
      rule.action_type === BranchingActionType.APPLY_VALIDATION && 
      rule.parameter_id === parameter.parameter_id
    );

    for (const rule of applicableValidationRules) {
      if (rule.validation_min_value !== undefined && typeof inputValue === 'number' && inputValue < rule.validation_min_value) {
        return rule.validation_message_for_rule || `Value must be at least ${rule.validation_min_value}.`;
      }
      if (rule.validation_max_value !== undefined && typeof inputValue === 'number' && inputValue > rule.validation_max_value) {
        return rule.validation_message_for_rule || `Value must be at most ${rule.validation_max_value}.`;
      }
      if (rule.validation_regex_pattern) {
        const regex = new RegExp(rule.validation_regex_pattern);
        if (!regex.test(String(inputValue))) {
          return rule.validation_message_for_rule || `Input does not match the required pattern.`;
        }
      }
    }

    return null;
  }

  onParameterInputChange(parameter: Parameter, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value === '' ? undefined : (parameter.parameter_type_id === '4' ? Number(inputElement.value) : inputElement.value);

    const error = this.validateParameterInput(parameter, inputValue);
    if (parameter.parameter_id) {
      this.parameterValidationErrors.set(parameter.parameter_id, error);
    }

    this.checkAndDisplayBranchingMessages(); // Re-check branching rules on parameter change
  }

  trackByStageId(index: number, stage: any): string {
    return stage.stage_id;
  }

  onParameterDrop(event: CdkDragDrop<Parameter[]>, taskIndex: number) {
    if (this.stageWiseTaskList?.data[taskIndex]?.parameters) {
      moveItemInArray(
        this.stageWiseTaskList.data[taskIndex].parameters,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  onStageNameChange(stage: any) {
    if (stage.stage_id && stage.stage_name) {
      this.processExecutionService.updateStage(stage.stage_id, stage.stage_name)
        .subscribe((response) => {
          if (response.stat === 200) {
            this.toasterService.successToast('Stage name updated successfully');
          }
        });
    }
  }

  onTaskNameChange(task: any) {
    if (task.task_id && task.task_name) {
      this.processExecutionService.updateTask(task.task_id, task.task_name)
        .subscribe((response) => {
          if (response.stat === 200) {
            this.toasterService.successToast('Task name updated successfully');
          }
        });
    }
  }

  checkAndDisplayBranchingMessages() {
    this.activeBranchingMessages.clear(); // Clear previous messages

    if (!this.allBranchingRules || this.allBranchingRules.length === 0 || !this.stageWiseTaskList) {
      return;
    }

    this.allBranchingRules.forEach(rule => {
      if (rule.action_type === BranchingActionType.DISPLAY_MESSAGE && rule.display_message_content) {
        this.stageWiseTaskList.data.forEach(task => {
          task.parameters?.forEach(param => {
            if (param.parameter_id === rule.parameter_id) {
              let conditionMet = false;
              const userValue = param.parameter_description;
              const ruleValue = rule.parameter_value;

              switch (rule.operator) {
                case BranchingConditionOperator.EQUAL:
                  conditionMet = (userValue === ruleValue);
                  break;
                case BranchingConditionOperator.GREATER_THAN:
                  // Attempt to convert to number for numerical comparison
                  conditionMet = (Number(userValue) > Number(ruleValue));
                  break;
                case BranchingConditionOperator.LESS_THAN:
                  // Attempt to convert to number for numerical comparison
                  conditionMet = (Number(userValue) < Number(ruleValue));
                  break;
                default:
                  // Default to EQUAL if no operator is specified or recognized
                  conditionMet = (userValue === ruleValue);
                  break;
              }

              if (conditionMet) {
                this.activeBranchingMessages.set(rule.branching_rules_id, rule.display_message_content || null);
              }
            }
          });
        });
      }
      // Add logic for HIDE_PARAMETER here if needed to update visibility
      // For now, focusing on DISPLAY_MESSAGE
    });
  }

  submitProcess() {
    let isValid = true;
    if (this.processCreationData.data.stages) {
      this.processCreationData.data.stages.forEach(stage => {
        this.processExecutionService
          .getTaskInfoRestoStage(stage.stage_id!)
          .subscribe((response) => {
            response.data.forEach(task => {
              task.parameters?.forEach(param => {
                if (param.parameter_id && this.parameterValidationErrors.get(param.parameter_id)) {
                  isValid = false;
                }
              });
            });
          });
      });
    }

    if (isValid) {
      // Proceed with submission
      console.log('Process data is valid, submitting...', this.processCreationData);
      this.toasterService.successToast('Process submitted successfully!');
    } else {
      this.toasterService.errorToast('Please correct the validation errors before submitting.');
    }
  }
}
