import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ProcessExecutionService } from '../shared/services/process-execution.service';
import { DialogService } from 'primeng/dynamicdialog';
import { ToasterService } from '../shared/services/toaster.service';
import { ProcessListOfData } from '../stage-creation/interface/process-creation.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FacilityService } from '../facility/service/facility.service';
import { DepartmentService } from '../department/services/department.service';
import { RoomService } from '../room/services/room.service';
import { MaterialService } from '../material/services/material.service';
import { PortableResourceService } from '../portable-resource/services/portable-resource.service';
import { AllFacilityList } from '../facility/interface/facility.interface';
import { Department } from '../department/interface/department.interface';
import { Room } from '../room/interface/room.interface';
import { Material } from '../material/interface/material.interface';
import { PortableResource } from '../portable-resource/interface/portable-resource.interface';
import { WorkflowResponse, FormComment } from '../shared/interface/workflow.interface';

@Component({
  selector: 'app-make-forms-entry',
  standalone: true,
  imports: [
    SidebarComponent,
    HeaderComponent,
    CommonModule,
    FormsModule,
    RouterModule,
    DropdownModule,
    MultiSelectModule,
    ButtonModule,
    InputTextareaModule
  ],
  templateUrl: './make-forms-entry.component.html',
  styleUrl: './make-forms-entry.component.scss'
})
export class MakeFormsEntryComponent implements OnInit, OnDestroy {
  @Input() public processId = '';
  public processData: ProcessListOfData | null = null;

  // Form data for new fields
  public formData: { [key: string]: any } = {};

  // Dropdown options
  public facilities: AllFacilityList[] = [];
  public departments: Department[] = [];
  public rooms: Room[] = [];
  public materials: Material[] = [];
  public fixedResources: any[] = [];

  // Selected values
  public selectedFacility: AllFacilityList | null = null;
  public selectedDepartment: Department | null = null;
  public selectedRoom: Room | null = null;
  public selectedMaterial: Material | null = null;
  public selectedPortableResources: PortableResource[] = [];

  // Display values
  public materialDescription: string = '';
  public roomFixedResources: any[] = [];
  public allPortableResources: PortableResource[] = [];

  // Timer properties
  timers: { [key: string]: any } = {};
  activityTimestamps: { [key: string]: any } = {};
  totalElapsedTime: number = 0;
  private updateTimersInterval: any;

  // Digital clock properties
  digitalClocks: { [key: string]: string } = {};
  clockTimers: { [key: string]: any } = {};

  // Resource time tracking
  resourceTimeData: { [key: string]: any } = {};

  // Workflow properties
  public workflowData: WorkflowResponse | null = null;
  public isFormEditable: boolean = false;
  public canSubmit: boolean = false;
  public canReview: boolean = false;
  public currentStatus: string = '';
  public userRole: number = 1;
  public comments: FormComment[] = [];
  public newComment: string = '';
  public hasBeenRejected: boolean = false;

  public constructor(
    public processExecutionService: ProcessExecutionService,
    public dialogService: DialogService,
    public toasterService: ToasterService,
    public facilityService: FacilityService,
    public departmentService: DepartmentService,
    public roomService: RoomService,
    public materialService: MaterialService,
    public portableResourceService: PortableResourceService
  ) {}

  ngOnInit() {
    // Load workflow data first
    this.loadWorkflowData();

    // Load process data
    this.loadProcessData();

    // Load dropdown data
    this.loadDropdownData();

    // Load portable resources on initialization
    this.loadPortableResources();
  }

  ngOnDestroy() {
    this.stopTimerUpdates();
  }

  // Load workflow data
  loadWorkflowData() {
    if (!this.processId) return;

    // Get user data from localStorage
    const userData = localStorage.getItem('userData');
    const userRole = userData ? JSON.parse(userData).role_id : 1;
    const userId = userData ? JSON.parse(userData).admin_id : 1;

    this.processExecutionService.getFormSubmissionWithWorkflow(this.processId).subscribe({
      next: (response: WorkflowResponse) => {
        if (response.stat === 200) {
          this.workflowData = response;
          this.isFormEditable = response.editable;
          this.canSubmit = response.can_submit;
          this.canReview = response.can_review;
          this.currentStatus = response.status ? response.status.trim().toLowerCase() : '';
          this.userRole = response.user_role;
          this.comments = response.comments || [];
          this.hasBeenRejected = (response as any).has_been_rejected || false;

          // Set portable resources from workflow data if available
          if (response.data?.portable_resources && Array.isArray(response.data.portable_resources) && response.data.portable_resources.length > 0) {
            this.selectedPortableResources = response.data.portable_resources as PortableResource[];
            this.initializePortableResourceActivities();
          }

          // Get user role from localStorage for proper role detection
          const userData = localStorage.getItem('userData');
          const localStorageRole = userData ? JSON.parse(userData).role_id : 1;
          this.userRole = parseInt(localStorageRole.toString());

          // Reload portable resources if room is selected and form is editable
          if (this.selectedRoom && this.isFormEditable) {
            this.loadPortableResources();
          }

          // Fallback: Always reload portable resources if room is selected
          if (this.selectedRoom && this.allPortableResources.length === 0) {
            this.loadPortableResources();
          }

          // Start timer updates if portable resources are available
          if (this.selectedPortableResources.length > 0 || (this.workflowData?.data?.portable_resources && this.workflowData.data.portable_resources.length > 0)) {
            this.startTimerUpdates();
          }

          // Auto-start work for role 8 users when status is 'assigned'
          if (this.userRole == 8 && this.currentStatus === 'assigned' && this.isFormEditable) {
            this.startWork();
          }

          // Reload portable resources if room is selected
          if (this.selectedRoom) {
            this.loadPortableResources();
          }

          // Check for any running timers and start updates if needed
          this.checkAndStartTimerUpdates();
        } else {
          console.log('❌ No workflow data found for this process');
          console.log('Response stat:', response.stat);
          console.log('Response msg:', response.msg);
        }
      },
      error: (error) => {
        console.error('❌ Error loading workflow data:', error);
      }
    });
  }

  // Check for any running timers and start updates if needed
  checkAndStartTimerUpdates() {
    let hasRunningTimers = false;

    // Check fixed resources
    this.roomFixedResources.forEach((resource: any) => {
      if (resource.activities?.start && !resource.activities?.stop) {
        hasRunningTimers = true;
      }
    });

    // Check portable resources
    this.selectedPortableResources.forEach((resource: any) => {
      if (resource.activities?.start && !resource.activities?.stop) {
        hasRunningTimers = true;
      }
    });

    // Check workflow data portable resources
    if (this.workflowData?.data?.portable_resources && Array.isArray(this.workflowData.data.portable_resources)) {
      this.workflowData.data.portable_resources.forEach((resource: any) => {
        if (resource.activities?.start && !resource.activities?.stop) {
          hasRunningTimers = true;
        }
      });
    }

    if (hasRunningTimers && !this.updateTimersInterval) {
      this.startTimerUpdates();
    }
  }

  // Update workflow status
  updateWorkflowStatus(newStatus: string, comment?: string) {
    if (!this.workflowData?.data.submission_id) {
      this.toasterService.errorToast('No submission found to update');
      return;
    }

    this.processExecutionService.updateWorkflowStatus(
      this.workflowData.data.submission_id.toString(),
      newStatus,
      comment
    ).subscribe({
      next: (response) => {
        if (newStatus === 'submitted') {
          this.toasterService.successToast('Form submitted for review successfully!');
        } else if (newStatus === 'approved') {
          this.toasterService.successToast('Form approved and forwarded!');
        } else if (newStatus === 'rejected') {
          this.toasterService.errorToast('Form rejected and sent back for editing.');
        }

        // Reload workflow data to update permissions
        this.loadWorkflowData();
      },
      error: (error) => {
        console.error('❌ Error updating workflow status:', error);
        this.toasterService.errorToast('Failed to update workflow status');
      }
    });
  }





  // Resubmit for review after fixing rejection issues
  resubmitForReview() {
    // Prevent submission if form is not editable or status is not in_progress
    if (!this.isFormEditable) {
      this.toasterService.errorToast('Form is not editable in its current status');
      return;
    }

    if (this.currentStatus !== 'in_progress') {
      this.toasterService.errorToast('Form can only be submitted when status is in progress');
      return;
    }

    // First save the form data
    this.submitForm();

    // Then update workflow status to submitted
    if (this.workflowData?.data.submission_id) {
      this.updateWorkflowStatus('submitted', 'Form resubmitted for review by operator');
    }
  }

  // Submit for review
  submitForReview() {
    // Prevent submission if form is not editable or status is not in_progress
    if (!this.isFormEditable) {
      this.toasterService.errorToast('Form is not editable in its current status');
      return;
    }

    if (this.currentStatus !== 'in_progress') {
      this.toasterService.errorToast('Form can only be submitted when status is in progress');
      return;
    }

    // First save the form data
    this.submitForm();

    // Then update workflow status to submitted
    if (this.workflowData?.data.submission_id) {
      this.updateWorkflowStatus('submitted', 'Form submitted for review by operator');
    }
  }

  // Submit form with workflow
  submitFormWithWorkflow() {
    if (!this.canSubmit) {
      this.toasterService.errorToast('You are not authorized to submit this form');
      return;
    }

    // First submit the form data
    this.submitForm();

    // Then update workflow status to submitted
    setTimeout(() => {
      this.updateWorkflowStatus('submitted');
    }, 1000);
  }

  // Accept form and forward to next step
  acceptForm() {
    if (!this.workflowData?.data.submission_id) {
      this.toasterService.errorToast('No submission found to accept');
      return;
    }

    const comment = this.newComment || 'Form accepted and forwarded to next step';

    this.processExecutionService.updateWorkflowStatus(
      this.workflowData.data.submission_id.toString(),
      'approved',
      comment
    ).subscribe({
      next: (response) => {
        if (response.stat === 200) {
          this.toasterService.successToast('Form accepted and forwarded successfully');

          // Clear comment
          this.newComment = '';

          // Reload workflow data to reflect the new status
          setTimeout(() => {
            this.loadWorkflowData();
          }, 500);
        } else {
          this.toasterService.errorToast(response.msg || 'Error accepting form');
        }
      },
      error: (error) => {
        console.error('❌ Error accepting form:', error);
        this.toasterService.errorToast('Error accepting form');
      }
    });
  }

  // Approve form (existing method)
  approveForm() {
    if (!this.canReview) {
      this.toasterService.errorToast('You are not authorized to approve this form');
      return;
    }

    this.updateWorkflowStatus('approved', this.newComment);
    this.newComment = '';
  }

  // Reject form and send back to role 8 for editing
  rejectForm() {
    if (!this.workflowData?.data.submission_id) {
      this.toasterService.errorToast('No submission found to reject');
      return;
    }

    if (!this.newComment.trim()) {
      this.toasterService.errorToast('Please provide a comment when rejecting a form');
      return;
    }

    const comment = this.newComment || 'Form rejected - needs revision';

    this.processExecutionService.updateWorkflowStatus(
      this.workflowData.data.submission_id.toString(),
      'rejected',
      comment
    ).subscribe({
      next: (response) => {
        if (response.stat === 200) {
          this.toasterService.successToast('Form rejected and sent back to operator for editing');

          // Clear comment
          this.newComment = '';

          // Reload workflow data to reflect the new status
          setTimeout(() => {
            this.loadWorkflowData();
          }, 500);
        } else {
          this.toasterService.errorToast(response.msg || 'Error rejecting form');
        }
      },
      error: (error) => {
        console.error('❌ Error rejecting form:', error);
        this.toasterService.errorToast('Error rejecting form');
      }
    });
  }

  // Start work (change status to in_progress)
  startWork() {
    this.updateWorkflowStatus('in_progress');

    // Reload workflow data after a short delay to reflect the new status
    setTimeout(() => {
      this.loadWorkflowData();
    }, 1000);
  }

    loadProcessData() {
    this.processExecutionService
    .getSingleProcessExecution(this.processId)
    .subscribe((response) => {
      this.processData = response.data;
        });
  }

  loadDropdownData() {
    let dropdownsLoaded = 0;
    const totalDropdowns = 4; // facilities, departments, rooms, materials

    const checkAllDropdownsLoaded = () => {
      dropdownsLoaded++;
      if (dropdownsLoaded === totalDropdowns) {
        // All dropdowns loaded, now load form data
        this.loadParameterValues();
      }
    };

    // Load facilities
    this.facilityService.getAllFacility().subscribe((response) => {
      if (response.stat === 200) {
        this.facilities = response.all_list;
      }
      checkAllDropdownsLoaded();
    });

    // Load departments
    this.departmentService.getAllDepartment().subscribe((response) => {
      if (response.stat === 200) {
        this.departments = response.all_list;
      }
      checkAllDropdownsLoaded();
    });

    // Load rooms
    this.roomService.getAllRoom().subscribe((response) => {
      if (response.stat === 200) {
        this.rooms = response.all_list;
      }
      checkAllDropdownsLoaded();
    });

    // Load materials
    this.materialService.getAllMaterials().subscribe((response) => {
      if (response.stat === 200) {
        this.materials = response.all_list;
      }
      checkAllDropdownsLoaded();
    });

    // Portable resources will be loaded when room is selected
  }

  onFacilityChange() {
    // Reset dependent fields when facility changes
    this.selectedDepartment = null;
    this.selectedRoom = null;
    this.selectedMaterial = null;
    this.selectedPortableResources = [];
    this.allPortableResources = [];
    this.materialDescription = '';
    this.roomFixedResources = [];
  }

  onDepartmentChange() {
    // Reset dependent fields when department changes
    this.selectedRoom = null;
    this.selectedMaterial = null;
    this.selectedPortableResources = [];
    this.allPortableResources = [];
    this.materialDescription = '';
    this.roomFixedResources = [];
  }

  onRoomChange() {
    if (this.selectedRoom) {

      // Load fixed resources for the selected room
      this.roomService.getRoomWithResourcesSpecific({ room_id: this.selectedRoom.room_id }).subscribe((response: any) => {
        if (response.stat === 200 && response.data) {
          this.roomFixedResources = response.data.fixed_resources || [];
          // Initialize activities property for each resource
          this.roomFixedResources.forEach((resource: any) => {
            if (!resource.activities) {
              resource.activities = {
                start: false,
                stop: false,
                pause: false,
                resume: false
              };
            }
          });

          // Check for running timers after loading fixed resources
          this.checkAndStartTimerUpdates();
        } else {
          this.roomFixedResources = [];
        }
      }, (error) => {
        console.error('Error fetching room resources:', error);
        this.roomFixedResources = [];
      });

      // Load portable resources when room is selected
      this.loadPortableResources();
    } else {
      this.roomFixedResources = [];
      this.allPortableResources = [];
      this.selectedPortableResources = [];
    }
  }

  // Load portable resources
  loadPortableResources() {
    this.portableResourceService.getAllPortableResources().subscribe((response) => {

      if (response.stat === 200) {
        this.allPortableResources = response.all_list || [];
        this.initializePortableResourceActivities();

        // Check for running timers after loading resources
        this.checkAndStartTimerUpdates();
      } else {
        console.error('Failed to load portable resources:', response.msg);
        this.allPortableResources = [];
      }
    }, (error) => {
      console.error('Error loading portable resources:', error);
      this.allPortableResources = [];
    });
  }

  onMaterialChange() {
    if (this.selectedMaterial) {
      this.materialDescription = this.selectedMaterial.product_desc;
    } else {
      this.materialDescription = '';
    }
  }

  // Initialize activities for portable resources
  initializePortableResourceActivities() {
    if (this.allPortableResources && this.allPortableResources.length > 0) {
      this.allPortableResources.forEach((resource: any) => {
        if (!resource.activities) {
          resource.activities = {
            start: false,
            stop: false,
            pause: false,
            resume: false
          };
        }
      });
    }
  }

  // Handle portable resource selection change
  onPortableResourceSelectionChange() {
    // Initialize activities for newly selected resources
    if (this.selectedPortableResources && this.selectedPortableResources.length > 0) {
      this.selectedPortableResources.forEach((resource: any) => {
        if (!resource.activities) {
          resource.activities = {
            start: false,
            stop: false,
            pause: false,
            resume: false
          };
        }
      });
    }
  }

  submitForm() {
    // Prevent submission if form is not editable
    if (!this.isFormEditable) {
      this.toasterService.errorToast('Form is not editable in its current status');
      return;
    }

    // Prevent submission for role 8 if status is submitted or approved
    if (this.userRole === 8 && (this.currentStatus === 'submitted' || this.currentStatus === 'approved' || this.currentStatus === 'under_review')) {
      this.toasterService.errorToast('You cannot submit this form in its current status');
      return;
    }

    console.log('Process ID:', this.processId);
    console.log('Selected facility:', this.selectedFacility);
    console.log('Selected department:', this.selectedDepartment);
    console.log('Selected room:', this.selectedRoom);
    console.log('Selected material:', this.selectedMaterial);
    console.log('Material description:', this.materialDescription);
    console.log('Form data:', this.formData);

    // Validate required fields
    if (!this.selectedFacility || !this.selectedDepartment || !this.selectedRoom || !this.selectedMaterial) {
      this.toasterService.errorToast('Please fill all required fields');
      return;
    }

    // Collect resource time data (one row per resource)
    const resourceTimeData: any[] = [];

    // Process fixed resources
    if (this.roomFixedResources && this.roomFixedResources.length > 0) {
      this.roomFixedResources.forEach((resource: any) => {
        const resourceKey = `${resource.resource_id}_${resource.resource_name}`;
        if (this.resourceTimeData[resourceKey]) {
          resourceTimeData.push(this.resourceTimeData[resourceKey]);
        }
      });
    }

    // Process portable resources
    if (this.selectedPortableResources && this.selectedPortableResources.length > 0) {
      this.selectedPortableResources.forEach((resource: any) => {
        const resourceKey = `${resource.resource_id}_${resource.resource_name}`;
        if (this.resourceTimeData[resourceKey]) {
          resourceTimeData.push(this.resourceTimeData[resourceKey]);
        }
      });
    }

    // Collect parameter values from form data
    const parameterValues: { [key: string]: any } = {};
    for (const key in this.formData) {
      if (this.formData.hasOwnProperty(key) && this.formData[key] !== null && this.formData[key] !== '') {
        parameterValues[key] = this.formData[key];
      }
    }

    const submissionData = {
      process_id: this.processId,
      facility_id: this.selectedFacility.facility_id,
      department_id: this.selectedDepartment.department_id,
      room_id: this.selectedRoom.room_id,
      material_id: this.selectedMaterial.product_id,
      material_description: this.materialDescription,
      fixed_resources: this.roomFixedResources,
      portable_resources: this.selectedPortableResources,
      form_data: this.formData,
      resource_time_data: resourceTimeData,
      parameter_values: parameterValues
    };

    this.processExecutionService.submitFormData(submissionData).subscribe({
      next: (response) => {
        if (response.stat === 200) {
          this.toasterService.successToast('Form submitted successfully');
          // Reload workflow data to reflect changes
          this.loadWorkflowData();
        } else {
          this.toasterService.errorToast(response.msg || 'Failed to submit form');
        }
      },
      error: (error) => {
        console.error('Error submitting form:', error);
        this.toasterService.errorToast('Error submitting form');
      }
    });
  }

  // Toggle activity for a resource
  toggleActivity(resource: any, activity: string) {
    if (!resource.activities) {
      resource.activities = {
        start: false,
        stop: false,
        pause: false,
        resume: false
      };
    }

    const resourceKey = `${resource.resource_id}_${resource.resource_name}`;

    // Initialize timer for this resource if not exists
    if (!this.clockTimers[resourceKey]) {
      this.clockTimers[resourceKey] = {
        startTime: null,
        pausedTime: 0,
        isRunning: false,
        isPaused: false,
        totalElapsed: 0,
        accumulatedTime: 0
      };
    }

    const timer = this.clockTimers[resourceKey];

    // Handle different activities
    switch (activity) {
      case 'start':
        // Start the timer
        resource.activities.start = true;
        resource.activities.stop = false;
        resource.activities.pause = false;
        resource.activities.resume = false;

        timer.startTime = Date.now();
        timer.isRunning = true;
        timer.isPaused = false;
        timer.pausedTime = 0;
        timer.totalElapsed = 0;
        timer.accumulatedTime = 0;

        // Start timer updates immediately when timer starts
        if (!this.updateTimersInterval) {
          this.startTimerUpdates();
        }

        // Initialize resource time data
        this.resourceTimeData[resourceKey] = {
          process_id: this.processId,
          resource_id: resource.resource_id,
          resource_type: this.isPortableResource(resource) ? 'portable' : 'fixed',
          resource_name: resource.resource_name,
          activity_type: 'start',
          timestamp: new Date().toISOString(),
          elapsed_time: '00:00:00',
          user_id: 1
        };
        break;

      case 'stop':
        if (resource.activities.start) {
          // Stop the timer
          resource.activities.start = false;
          resource.activities.stop = true;
          resource.activities.pause = false;
          resource.activities.resume = false;

          if (timer.isRunning) {
            const currentElapsed = Date.now() - timer.startTime;
            timer.totalElapsed = timer.accumulatedTime + currentElapsed;
            timer.isRunning = false;
            timer.isPaused = false;
          } else if (timer.isPaused) {
            timer.totalElapsed = timer.accumulatedTime;
            timer.isRunning = false;
            timer.isPaused = false;
          }

          // Update resource time data
          if (this.resourceTimeData[resourceKey]) {
            this.resourceTimeData[resourceKey].activity_type = 'stop';
            this.resourceTimeData[resourceKey].elapsed_time = this.convertMillisecondsToTimeFormat(timer.totalElapsed);
            this.resourceTimeData[resourceKey].timestamp = new Date().toISOString();
            this.resourceTimeData[resourceKey].resource_type = this.isPortableResource(resource) ? 'portable' : 'fixed';
          }
        }
        break;

      case 'pause':
        if (resource.activities.start && !resource.activities.stop) {
          // Pause the timer
          resource.activities.pause = true;
          resource.activities.resume = false;

          if (timer.isRunning) {
            const currentElapsed = Date.now() - timer.startTime;
            timer.accumulatedTime += currentElapsed;
            timer.isRunning = false;
            timer.isPaused = true;
            timer.startTime = null; // Clear start time when paused
          }

          // Update resource time data
          if (this.resourceTimeData[resourceKey]) {
            this.resourceTimeData[resourceKey].activity_type = 'pause';
            this.resourceTimeData[resourceKey].elapsed_time = this.convertMillisecondsToTimeFormat(timer.accumulatedTime);
            this.resourceTimeData[resourceKey].timestamp = new Date().toISOString();
            this.resourceTimeData[resourceKey].resource_type = this.isPortableResource(resource) ? 'portable' : 'fixed';
          }
        }
        break;

      case 'resume':
        if (resource.activities.pause && !resource.activities.stop) {
          // Resume the timer
          resource.activities.resume = true;
          resource.activities.pause = false;

          // Resume from the accumulated time
          timer.startTime = Date.now();
          timer.isRunning = true;
          timer.isPaused = false;
          // Keep the accumulated time, don't reset it

          // Start timer updates if not already running
          if (!this.updateTimersInterval) {
            this.startTimerUpdates();
          }

          // Update resource time data
          if (this.resourceTimeData[resourceKey]) {
            this.resourceTimeData[resourceKey].activity_type = 'resume';
            this.resourceTimeData[resourceKey].timestamp = new Date().toISOString();
            this.resourceTimeData[resourceKey].resource_type = this.isPortableResource(resource) ? 'portable' : 'fixed';
          }
        }
        break;
    }

    // Update digital clock display immediately
    this.updateDigitalClock(resourceKey);
  }

  // Update digital clock display
  updateDigitalClock(resourceKey: string) {
    if (!this.clockTimers[resourceKey]) {
      this.clockTimers[resourceKey] = {
        startTime: null,
        pausedTime: 0,
        isRunning: false,
        isPaused: false,
        totalElapsed: 0,
        accumulatedTime: 0
      };
    }

    const timer = this.clockTimers[resourceKey];

    if (timer.isRunning) {
      const currentTime = Date.now();
      const currentElapsed = currentTime - timer.startTime;
      const totalElapsed = timer.accumulatedTime + currentElapsed;
      const formattedTime = this.formatTime(totalElapsed);
      this.digitalClocks[resourceKey] = formattedTime;
    } else if (timer.isPaused) {
      // Show accumulated time when paused
      const formattedTime = this.formatTime(timer.accumulatedTime);
      this.digitalClocks[resourceKey] = formattedTime;
    } else if (timer.totalElapsed > 0) {
      const formattedTime = this.formatTime(timer.totalElapsed);
      this.digitalClocks[resourceKey] = formattedTime;
    } else {
      this.digitalClocks[resourceKey] = '00:00:00';
    }
  }

  // Format time for digital clock display
  formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Convert milliseconds to HH:MM:SS format for database storage
  convertMillisecondsToTimeFormat(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Stop other activities when one starts
  stopOtherActivities(resource: any, currentActivity: string) {
    const activities = ['start', 'stop', 'pause', 'resume'];
    activities.forEach(activity => {
      if (activity !== currentActivity) {
        resource.activities[activity] = false;
      }
    });
  }

  // Get elapsed time for a specific activity
  getElapsedTime(resource: any, activity: string): string {
    const resourceKey = `${resource.resource_id}_${resource.resource_name}`;
    const activityKey = `${resourceKey}_${activity}`;
    const timer = this.timers[activityKey];

    if (!timer || !timer.startTime) {
      return '00:00:00';
    }

    let elapsed = 0;
    if (timer.isRunning) {
      elapsed = Date.now() - timer.startTime - timer.pausedTime;
    } else if (timer.isPaused) {
      elapsed = timer.pausedTime;
    }

    return this.formatTime(elapsed);
  }





  addFixedResource() {
    // This would typically open a dialog to select additional fixed resources
    this.toasterService.successToast('Add Fixed Resource functionality will be implemented');
  }

  // Check if a resource is portable
  isPortableResource(resource: any): boolean {
    // Check if the resource exists in the selected portable resources array
    return this.selectedPortableResources.some(portableResource =>
      portableResource.resource_id === resource.resource_id &&
      portableResource.resource_name === resource.resource_name
    );
  }

  addPortableResource() {
    // This would typically open a dialog to select additional portable resources
    this.toasterService.successToast('Add Portable Resource functionality will be implemented');
  }

  // TrackBy functions to prevent duplicate rendering
  trackByTaskId(index: number, task: any): any {
    return task?.task_id || index;
  }

  trackByParameterId(index: number, param: any): any {
    return param?.parameter_id || index;
  }

    // Load previously saved parameter values
  loadParameterValues() {
    if (!this.processId) {
      return;
    }

    // Check if there are existing form submissions for this process
    this.checkExistingSubmissions();
  }

  // Check for existing form submissions and load values if found
  checkExistingSubmissions() {
    const payload = {
      form_submissions: {
        process_id: this.processId,
        del_status: 0
      }
    };

    this.processExecutionService.getFormSubmissions(payload).subscribe({
      next: (response: any) => {
        if (response.stat === 200 && response.all_list && response.all_list.length > 0) {
          this.loadSavedParameterValues();
        }
      },
      error: (error: any) => {
        console.error('Error checking existing submissions:', error);
      }
    });
  }

        // Load saved parameter values from the database
  loadSavedParameterValues() {
    this.processExecutionService.getCompleteFormData(this.processId).subscribe({
      next: (response) => {

        if (response.stat === 200 && response.data) {

          // Load static fields
          if (response.data.static_fields) {
            const staticFields = response.data.static_fields;

            // Set facility
            if (staticFields.facility_id) {
                            this.selectedFacility = this.facilities.find(f =>
                String(f.facility_id) === String(staticFields.facility_id)
              ) || null;

              if (!this.selectedFacility) {
                console.warn('⚠️ Facility not found! Looking for ID:', staticFields.facility_id);
              }
            }

            // Set department
            if (staticFields.department_id) {
              this.selectedDepartment = this.departments.find(d =>
                String(d.department_id) === String(staticFields.department_id)
              ) || null;

              if (!this.selectedDepartment) {
                console.warn('⚠️ Department not found! Looking for ID:', staticFields.department_id);
              }
            }

            // Set room
            if (staticFields.room_id) {
              this.selectedRoom = this.rooms.find(r =>
                String(r.room_id) === String(staticFields.room_id)
              ) || null;

              if (!this.selectedRoom) {
                console.warn('⚠️ Room not found! Looking for ID:', staticFields.room_id);
              }
            }

            // Set material
            if (staticFields.material_id) {
              this.selectedMaterial = this.materials.find(m =>
                String(m.product_id) === String(staticFields.material_id)
              ) || null;

              if (!this.selectedMaterial) {
                console.warn('⚠️ Material not found! Looking for ID:', staticFields.material_id);
              }
            }

            // Set material description
            if (staticFields.material_description) {
              this.materialDescription = staticFields.material_description;
            }

            // Load fixed resources
            if (staticFields.fixed_resources && Array.isArray(staticFields.fixed_resources)) {
              this.roomFixedResources = staticFields.fixed_resources;
            }

            // Load portable resources
            if (staticFields.portable_resources && Array.isArray(staticFields.portable_resources)) {
              this.selectedPortableResources = staticFields.portable_resources;
            }

          }

                    // Load parameter values
          if (response.data.parameter_values) {

            // Populate formData with saved values
            for (const parameterId in response.data.parameter_values) {
              if (response.data.parameter_values.hasOwnProperty(parameterId)) {
                this.formData[parameterId] = response.data.parameter_values[parameterId];
              }
            }
          }

          // Also check form_data from the submission
          if (response.data.form_data) {

            // Populate formData with saved values from form_data
            for (const parameterId in response.data.form_data) {
              if (response.data.form_data.hasOwnProperty(parameterId)) {
                this.formData[parameterId] = response.data.form_data[parameterId];
              }
            }
          }

          // Load resource time data
          if (response.data.resource_time_data && Array.isArray(response.data.resource_time_data)) {
            this.loadSavedResourceTimeData(response.data.resource_time_data);
          }

          // Check if the form fields are properly bound
          if (this.processData && this.processData.stages) {
            this.processData.stages.forEach((stage: any) => {
              if (stage.tasks) {
                stage.tasks.forEach((task: any) => {
                  if (task.parameters) {
                    task.parameters.forEach((param: any) => {
                      if (!this.formData[param.parameter_id]) {
                        console.warn(`⚠️ Parameter ${param.parameter_id} (${param.parameter_name}) has no value in formData`);
                      }
                    });
                  }
                });
              }
            });
          }

          // Force change detection to update the form
          setTimeout(() => {
          }, 100);

          this.toasterService.successToast('Previous form values loaded successfully!');

          // Start timer updates if any resources are running
          this.startTimerUpdatesIfNeeded();
        } else {
          console.log('No saved form data found or error:', response.msg);
          this.toasterService.errorToast('No previous form data found for this process');
        }
              },
        error: (error) => {
          console.error('Error loading complete form data:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            url: error.url
          });
        }
      });
    }

  // Load saved resource time data and restore timer states
  loadSavedResourceTimeData(resourceTimeData: any[]) {
    if (!resourceTimeData || resourceTimeData.length === 0) {
      return;
    }

    // Group time data by resource
    const resourceGroups: { [key: string]: any[] } = {};

    resourceTimeData.forEach((timeEntry: any) => {
      const resourceKey = `${timeEntry.resource_id}_${timeEntry.resource_name}`;
      if (!resourceGroups[resourceKey]) {
        resourceGroups[resourceKey] = [];
      }
      resourceGroups[resourceKey].push(timeEntry);
    });

    // Process each resource's time data
    Object.keys(resourceGroups).forEach(resourceKey => {
      const timeEntries = resourceGroups[resourceKey];

      // Find the resource in our lists
      let resource: any = null;

      // Check fixed resources
      resource = this.roomFixedResources.find((r: any) =>
        `${r.resource_id}_${r.resource_name}` === resourceKey
      );

      // If not found in fixed resources, check portable resources
      if (!resource) {
        resource = this.selectedPortableResources.find((r: any) =>
          `${r.resource_id}_${r.resource_name}` === resourceKey
        );
      }

      if (!resource) {
        return;
      }

      // Initialize timer for this resource
      if (!this.clockTimers[resourceKey]) {
        this.clockTimers[resourceKey] = {
          startTime: null,
          pausedTime: 0,
          isRunning: false,
          isPaused: false,
          totalElapsed: 0,
          accumulatedTime: 0
        };
      }

      // Find the last activity to determine current state
      const lastActivity = timeEntries[timeEntries.length - 1];

      // Initialize resource activities
      if (!resource.activities) {
        resource.activities = {
          start: false,
          stop: false,
          pause: false,
          resume: false
        };
      }

      // Set activity states based on last activity
      switch (lastActivity.activity_type) {
        case 'start':
          resource.activities.start = true;
          resource.activities.stop = false;
          resource.activities.pause = false;
          resource.activities.resume = false;
          break;
        case 'stop':
          resource.activities.start = false;
          resource.activities.stop = true;
          resource.activities.pause = false;
          resource.activities.resume = false;
          break;
        case 'pause':
          resource.activities.start = true;
          resource.activities.stop = false;
          resource.activities.pause = true;
          resource.activities.resume = false;
          break;
        case 'resume':
          resource.activities.start = true;
          resource.activities.stop = false;
          resource.activities.pause = false;
          resource.activities.resume = true;
          break;
      }

      // Convert elapsed time from HH:MM:SS format back to milliseconds for display
      const elapsedTimeMs = this.convertTimeFormatToMilliseconds(lastActivity.elapsed_time);

      // Set timer state
      const timer = this.clockTimers[resourceKey];
      timer.totalElapsed = elapsedTimeMs;
      timer.accumulatedTime = elapsedTimeMs;

      // If the resource is paused, we need to set it up so resume will work
      if (resource.activities.pause) {
        timer.isPaused = true;
        timer.isRunning = false;
        timer.startTime = null; // Clear start time when paused
        timer.pausedTime = 0; // Reset paused time since we're loading from saved state
      } else if (resource.activities.start && !resource.activities.stop) {
        // If it was running, we need to restart the timer
        timer.isRunning = true;
        timer.isPaused = false;
        timer.startTime = Date.now(); // Start from current time
        timer.pausedTime = 0;
      } else if (resource.activities.stop) {
        // If it was stopped, keep it stopped
        timer.isRunning = false;
        timer.isPaused = false;
        timer.startTime = null;
        timer.pausedTime = 0;
      }

            // Update digital clock display
      this.digitalClocks[resourceKey] = this.formatTime(elapsedTimeMs);

      // Initialize resourceTimeData for this resource so resume can update it
      this.resourceTimeData[resourceKey] = {
        process_id: this.processId,
        resource_id: resource.resource_id,
        resource_type: this.isPortableResource(resource) ? 'portable' : 'fixed',
        resource_name: resource.resource_name,
        activity_type: lastActivity.activity_type,
        timestamp: lastActivity.timestamp,
        elapsed_time: lastActivity.elapsed_time,
        user_id: lastActivity.user_id || 1
      };
    });

    // Start timer updates if any resources are running
    this.startTimerUpdatesIfNeeded();
  }

  // Start timer updates if any resources are running
  startTimerUpdatesIfNeeded() {
    let hasRunningTimers = false;

    // Check fixed resources
    this.roomFixedResources.forEach((resource: any) => {
      if (resource.activities?.start && !resource.activities?.stop) {
        hasRunningTimers = true;
      }
    });

    // Check portable resources
    this.selectedPortableResources.forEach((resource: any) => {
      if (resource.activities?.start && !resource.activities?.stop) {
        hasRunningTimers = true;
      }
    });

    if (hasRunningTimers) {
      this.startTimerUpdates();
    }
  }

  // Convert HH:MM:SS format back to milliseconds
  convertTimeFormatToMilliseconds(timeFormat: string): number {
    if (!timeFormat || timeFormat === '00:00:00') {
      return 0;
    }

    const parts = timeFormat.split(':');
    if (parts.length !== 3) {
      console.warn(`Invalid time format: ${timeFormat}`);
      return 0;
    }

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    return totalSeconds * 1000; // Convert to milliseconds
  }

  private startTimerUpdates() {
    this.updateTimersInterval = setInterval(() => {
      this.updateTimerDisplay();
    }, 1000); // Update every 1 second for better performance and responsiveness
  }

  private stopTimerUpdates() {
    if (this.updateTimersInterval) {
      clearInterval(this.updateTimersInterval);
      this.updateTimersInterval = null;
    }
  }

  private updateTimerDisplay() {
    const currentTime = Date.now();

    // Update regular timers
    Object.keys(this.timers).forEach(key => {
      const timer = this.timers[key];
      if (timer.isRunning) {
        const elapsed = currentTime - timer.startTime - timer.pausedTime;
        this.totalElapsedTime = elapsed; // Update the total elapsed time
      }
    });

    // Update digital clocks for all resources
    // Fixed resources
    this.roomFixedResources.forEach((resource: any) => {
      const resourceKey = `${resource.resource_id}_${resource.resource_name}`;
      this.updateDigitalClock(resourceKey);
    });

    // Portable resources - check both selectedPortableResources and workflow data
    const allPortableResources = [
      ...this.selectedPortableResources,
      ...(this.workflowData?.data?.portable_resources || [])
    ];

    allPortableResources.forEach((resource: any) => {
      const resourceKey = `${resource.resource_id}_${resource.resource_name}`;
      this.updateDigitalClock(resourceKey);
    });
  }


}
