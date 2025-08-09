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
import { CurrentReviewerInfo, ReviewAssignment, ReviewerStatus } from '../shared/interface/workflow.interface';

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
  workflowData: any = null;
  isFormEditable: boolean = false;
  canSubmit: boolean = false;
  canReview: boolean = false;
  currentStatus: string = '';
  userRole: number = 1;
  comments: any[] = [];
  newComment: string = '';
  hasBeenRejected: boolean = false;

  // Multi-user workflow properties
  currentReviewerInfo: any = null;
  reviewAssignments: any[] = [];
  reviewerStatus: string = '';
  // Current user's review status and guard flags
  myReviewStatus: 'none' | 'pending' | 'in_progress' | 'approved' | 'rejected' = 'none';
  hasReviewed: boolean = false;
  isCurrentReviewer: boolean = false;
  isAssignedReviewer: boolean = false;
  shouldBeCurrentReviewer: boolean = false;
  reviewSequence: number = 1;
  totalReviewers: number = 0;

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

          // Get user role from localStorage for proper role detection
          const userData = localStorage.getItem('userData');
          const localStorageRole = userData ? JSON.parse(userData).role_id : 1;
          this.userRole = parseInt(localStorageRole.toString());

          console.log('📥 Workflow data loaded:');
          console.log('  - Backend status:', response.status);
          console.log('  - Normalized status:', this.currentStatus);
          console.log('  - Editable:', this.isFormEditable);
          console.log('  - Can submit:', this.canSubmit);
          console.log('  - Can review:', this.canReview);
          console.log('  - User role:', this.userRole);
          console.log('  - Has been rejected:', this.hasBeenRejected);

          // Set portable resources from workflow data if available
          if (response.data && response.data.portable_resources) {
            try {
              const portableData = JSON.parse(response.data.portable_resources);
              this.selectedPortableResources = portableData || [];
            } catch (e) {
              this.selectedPortableResources = [];
            }
          }

          // Initialize portable resource activities
          if (this.selectedPortableResources.length > 0) {
            this.initializePortableResourceActivities();
          }

          // Reload portable resources if room is selected and form is editable
          if (this.selectedRoom && this.isFormEditable) {
            this.loadPortableResources();
          }

          // Load current reviewer information for multi-user workflow
          this.loadDynamicCurrentReviewerInfo();

          // Load submission reviewers
          this.loadSubmissionReviewers();

          // Ensure first reviewer is set as current if needed
          this.ensureFirstReviewerIsCurrent();

          // Check and start timer updates if needed
          this.checkAndStartTimerUpdates();

          // Remove automatic synchronization to prevent infinite loops
          // Force refresh after a delay to ensure status synchronization
          // setTimeout(() => {
          //   this.synchronizeWorkflowStatus();
          // }, 1000);
        } else {
          console.log('Response stat:', response.stat);
          console.log('Response msg:', response.msg);
        }
      },
      error: (error) => {
        console.error('❌ Error loading workflow data:', error);
      }
    });
  }

  // Synchronize workflow status with backend
  synchronizeWorkflowStatus() {
    if (!this.processId) return;

    console.log('🔄 Synchronizing workflow status...');

    this.processExecutionService.getFormSubmissionWithWorkflow(this.processId).subscribe({
      next: (response: any) => {
        if (response.stat === 200) {
          const backendStatus = response.status ? response.status.trim().toLowerCase() : '';
          console.log('🔍 Backend status:', backendStatus);
          console.log('🔍 Current frontend status:', this.currentStatus);

          if (backendStatus !== this.currentStatus) {
            console.log('⚠️ Status mismatch detected! Updating...');
            this.currentStatus = backendStatus;
            this.workflowData = response;
            this.isFormEditable = response.editable;
            this.canSubmit = response.can_submit;
            this.canReview = response.can_review;
            this.hasBeenRejected = (response as any).has_been_rejected || false;

            // Don't automatically reload to prevent infinite loops
            // Reload reviewer info and assignments after status update
            // this.loadDynamicCurrentReviewerInfo();
            // this.loadSubmissionReviewers();
          } else {
            console.log('✅ Status is synchronized');
          }
        }
      },
      error: (error) => {
        console.error('❌ Error synchronizing workflow status:', error);
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

        // Don't automatically reload to prevent infinite loops
        // Reload workflow data to update permissions
        // this.loadWorkflowData();
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

  // Submit form for review with automatic reviewer assignment
  submitForReview() {
    if (!this.workflowData?.data?.submission_id) {
      this.toasterService.errorToast('No submission found');
      return;
    }

    // First save the form
    this.submitForm();

    // Then update workflow status to submitted
    this.processExecutionService.updateWorkflowStatus(
      this.workflowData.data.submission_id.toString(),
      'submitted',
      'Form submitted for review by operator'
    ).subscribe({
      next: (response) => {
        if (response.stat === 200) {
          this.toasterService.successToast('Form submitted for review successfully!');

          // Reload workflow data after a short delay to get updated reviewer info
          setTimeout(() => {
            this.loadWorkflowData();
          }, 1000);
        } else {
          this.toasterService.errorToast(response.msg || 'Failed to submit form for review');
        }
      },
      error: (error) => {
        console.error('❌ Error submitting form for review:', error);
        this.toasterService.errorToast('Failed to submit form for review');
      }
    });
  }

  // Automatically assign reviewers based on user roles
  autoAssignReviewers() {
    if (!this.workflowData?.data?.submission_id) return;

    // Get user data from localStorage
    const userData = localStorage.getItem('userData');
    const currentUserId = userData ? JSON.parse(userData).admin_id : 1;
    const currentUserRole = userData ? JSON.parse(userData).role_id : 1;

    // Define default reviewer IDs (roles 9, 10, 11, 12)
    let reviewerIds = [9, 10, 11, 12];

    // If current user is not role 8, add them to the reviewer list
    if (currentUserRole !== 8) {
      if (!reviewerIds.includes(currentUserId)) {
        reviewerIds.unshift(currentUserId); // Add current user as first reviewer
      }
    }

                    // Remove duplicates
    reviewerIds = [...new Set(reviewerIds)];

    const payload = {
      submission_id: this.workflowData.data.submission_id.toString(),
      reviewer_ids: reviewerIds,
      user_id: currentUserId,
      user_role: currentUserRole
    };

    this.processExecutionService.assignDynamicReviewers(payload).subscribe({
      next: (response: any) => {
        if (response.stat === 200) {
          this.toasterService.successToast(`Assigned ${reviewerIds.length} reviewers automatically`);
          // Reload workflow data to reflect changes
          setTimeout(() => {
            this.loadWorkflowData();
          }, 500);
        } else {
          this.toasterService.errorToast(response.msg || 'Error assigning reviewers');
        }
      },
      error: (error: any) => {
        console.error('Error assigning reviewers:', error);
        this.toasterService.errorToast('Error assigning reviewers');
      }
    });
  }

  // Submit form with workflow
  submitFormWithWorkflow() {
    if (!this.isFormEditable) {
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
    if (!this.isCurrentReviewer) {
      this.toasterService.errorToast('You are not the current reviewer');
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
          this.toasterService.successToast('Form rejected and sent back to operator for resubmission.');

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

  // Load current reviewer information for dynamic workflow
  loadDynamicCurrentReviewerInfo() {
    if (!this.workflowData?.data?.submission_id) return;

    // Get user data from localStorage
    const userData = localStorage.getItem('userData');
    const userId = userData ? JSON.parse(userData).admin_id : 1;

    const payload = {
      submission_id: this.workflowData.data.submission_id.toString(),
      user_id: userId
    };

    console.log('🔍 Loading current reviewer info for user:', userId);
    console.log('🔍 Current workflow status:', this.currentStatus);
    console.log('🔍 User role:', this.userRole);

    this.processExecutionService.getDynamicCurrentReviewer(payload).subscribe({
      next: (response: any) => {
        if (response.stat === 200) {
          const data = response.data;
          this.isAssignedReviewer = data.is_assigned_reviewer;
          this.isCurrentReviewer = data.is_current_reviewer;
          this.shouldBeCurrentReviewer = data.should_be_current_reviewer;
          this.reviewSequence = data.review_sequence || 1;
          this.totalReviewers = data.total_reviewers || 0;

          console.log('✅ Reviewer info loaded:');
          console.log('  - Is assigned reviewer:', this.isAssignedReviewer);
          console.log('  - Is current reviewer:', this.isCurrentReviewer);
          console.log('  - Should be current reviewer:', this.shouldBeCurrentReviewer);
          console.log('  - Review sequence:', this.reviewSequence);
          console.log('  - Total reviewers:', this.totalReviewers);
          console.log('  - Current reviewer ID:', data.current_reviewer_id);
          console.log('  - User ID:', userId);
          console.log('  - Current status:', this.currentStatus);
          console.log('  - User role:', this.userRole);

          // If user should be current reviewer but isn't set as current, set them as current
          if (this.shouldBeCurrentReviewer && !this.isCurrentReviewer) {
            console.log('🔧 User should be current reviewer but isn\'t set - setting as current');
            // Remove automatic setting to prevent infinite loops
            // this.setCurrentReviewer(userId);
            // return; // Exit early, will reload after setting current reviewer
          }

          // Special handling for first reviewer - always show buttons if they are assigned
          if (this.reviewSequence === 1 && this.isAssignedReviewer && this.currentStatus === 'under_review') {
            console.log('🔧 First reviewer detected - forcing shouldBeCurrentReviewer to true');
            this.shouldBeCurrentReviewer = true;
          }

          // Handle form editability based on user role
          if (this.userRole === 8) {
            // Role 8 (operator) can always edit the form if it's editable from backend
            console.log('✅ Role 8 user - form editability determined by backend response');
            // Don't override isFormEditable - keep what was set by loadWorkflowData

            // Role 8 users are NOT reviewers - they should never see approve/reject buttons
            this.isAssignedReviewer = false;
            this.isCurrentReviewer = false;
            this.shouldBeCurrentReviewer = false;
            console.log('✅ Role 8 user - not a reviewer, hiding approve/reject buttons');
          } else {
            // For reviewers (roles 9, 10, 11, 12), handle current reviewer logic
            if (this.isAssignedReviewer) {
              console.log('🔍 User is assigned reviewer');
              console.log('🔍 Current reviewer ID from DB:', data.current_reviewer_id);
              console.log('🔍 User ID:', userId);
              console.log('🔍 Current status:', this.currentStatus);
              console.log('🔍 Review sequence:', this.reviewSequence);

              // Check if user is first reviewer in sequence
              const isFirstReviewer = this.reviewSequence === 1;
              console.log('🔍 Is first reviewer in sequence:', isFirstReviewer);

              // Don't automatically set current reviewer to prevent infinite loops
              // SIMPLE OVERRIDE: If user is assigned reviewer and form is under review, make them current
              // if (this.currentStatus === 'under_review' && isFirstReviewer) {
              //   console.log('🔧 SIMPLE OVERRIDE: Making first assigned reviewer current');
              //   this.isCurrentReviewer = true;
              //   this.setCurrentReviewer(userId);
              // } else
              if (data.current_reviewer_id == userId) {
                console.log('✅ User is the current reviewer');
                this.isCurrentReviewer = true;
              } else {
                console.log('❌ User is not the current reviewer');
                this.isCurrentReviewer = false;
              }

              // Enable form editing for current reviewer
              if (this.isCurrentReviewer) {
                this.isFormEditable = true;
                console.log('✅ Current reviewer - enabling form editing');
              } else {
                this.isFormEditable = false;
                console.log('❌ Not current reviewer - disabling form editing');
              }
            } else {
              console.log('❌ User is not an assigned reviewer');
              this.isFormEditable = false;
              console.log('❌ Not assigned reviewer - disabling form editing');
            }
          }

          console.log('🎯 Final state after loading reviewer info:');
          console.log('  - isCurrentReviewer:', this.isCurrentReviewer);
          console.log('  - isAssignedReviewer:', this.isAssignedReviewer);
          console.log('  - reviewSequence:', this.reviewSequence);
          console.log('  - currentStatus:', this.currentStatus);
          console.log('  - isFormEditable:', this.isFormEditable);
          console.log('  - userRole:', this.userRole);

          // Don't automatically force set to prevent infinite loops
          // If still not current reviewer but should be, force set
          // if (!this.isCurrentReviewer && this.isAssignedReviewer && this.currentStatus === 'under_review') {
          //   console.log('🔧 FORCE SET: User should be current reviewer');
          //   this.forceSetCurrentReviewer(userId);
          // }
        } else {
          console.error('❌ Error loading current reviewer info:', response.msg);
        }
      },
      error: (error) => {
        console.error('❌ Error loading current reviewer info:', error);
      }
    });
  }

  // Ensure first reviewer is set as current when form is submitted
  ensureFirstReviewerIsCurrent() {
    if (!this.workflowData?.data?.submission_id || this.currentStatus !== 'under_review') return;

    const userData = localStorage.getItem('userData');
    const userId = userData ? JSON.parse(userData).admin_id : 1;

    // Only for reviewers, not operators
    if (this.userRole === 8) return;

    console.log('🔧 ensureFirstReviewerIsCurrent called');
    console.log('  - Submission ID:', this.workflowData.data.submission_id);
    console.log('  - User ID:', userId);
    console.log('  - User Role:', this.userRole);
    console.log('  - Current Status:', this.currentStatus);

    const payload = {
      submission_id: this.workflowData.data.submission_id.toString(),
      user_id: userId
    };

    this.processExecutionService.getDynamicCurrentReviewer(payload).subscribe({
      next: (response: any) => {
        if (response.stat === 200) {
          const data = response.data;
          console.log('🔍 ensureFirstReviewerIsCurrent response:', data);

          // If no current reviewer is set and this user is an assigned reviewer, set them as current
          if (!data.current_reviewer_id && data.is_assigned_reviewer) {
            console.log('🔧 No current reviewer set - setting first assigned reviewer as current');
            this.setCurrentReviewer(userId);

            // Force reload the reviewer info after setting current reviewer
            setTimeout(() => {
              this.loadDynamicCurrentReviewerInfo();
            }, 500);
          } else if (data.current_reviewer_id) {
            console.log('✅ Current reviewer already set:', data.current_reviewer_id);
          } else {
            console.log('❌ User is not an assigned reviewer');
          }
        } else {
          console.error('❌ Error in ensureFirstReviewerIsCurrent:', response.msg);
        }
      },
      error: (error) => {
        console.error('❌ Error ensuring first reviewer:', error);
      }
    });
  }

  // Load submission reviewers
  loadSubmissionReviewers() {
    if (!this.workflowData?.data?.submission_id) return;

    const payload = {
      submission_id: this.workflowData.data.submission_id.toString()
    };

    this.processExecutionService.getSubmissionReviewers(payload).subscribe({
      next: (response: any) => {
        if (response.stat === 200) {
          this.reviewAssignments = response.data || [];
          console.log('✅ Reviewer assignments loaded:', this.reviewAssignments);

          // Update current user's review status
          try {
            const currentUserId = this.getUserId();
            const mine = (this.reviewAssignments || []).find((a: any) => String(a.reviewer_id) === String(currentUserId));
            this.myReviewStatus = (mine?.review_status as any) || 'none';
            this.hasReviewed = this.myReviewStatus === 'approved' || this.myReviewStatus === 'rejected';
            console.log('👤 My review status:', this.myReviewStatus, 'hasReviewed:', this.hasReviewed);
          } catch (e) {
            console.warn('Could not determine my review status:', e);
            this.myReviewStatus = 'none';
            this.hasReviewed = false;
          }

          // Don't automatically force set to prevent infinite loops
          // Force set first reviewer as current if needed
          // if (this.currentStatus === 'under_review') {
          //   setTimeout(() => {
          //     this.forceSetFirstReviewerAsCurrent();
          //   }, 1000);
          // }
        } else {
          console.error('Error loading submission reviewers:', response.msg);
          this.reviewAssignments = [];
        }
      },
      error: (error) => {
        console.error('Error loading submission reviewers:', error);
        this.reviewAssignments = [];
      }
    });
  }

  // Process dynamic review with proper sequential workflow
  processDynamicReview(action: 'approve' | 'reject') {
    if (!this.workflowData?.data?.submission_id) {
      this.toasterService.errorToast('No submission found');
      return;
    }

    if (!this.newComment.trim()) {
      this.toasterService.errorToast('Please add a comment before approving or rejecting');
      return;
    }

    // Get user data from localStorage
    const userData = localStorage.getItem('userData');
    const userId = userData ? JSON.parse(userData).admin_id : 1;
    const userRole = userData ? JSON.parse(userData).role_id : 1;

    console.log('🔍 User data from localStorage:', userData);
    console.log('🔍 Parsed userId:', userId);
    console.log('🔍 Parsed userRole:', userRole);

    // Ensure user is set as current reviewer before proceeding
    if (this.isAssignedReviewer) {
      console.log('🔧 User is assigned reviewer, ensuring they are current reviewer...');
      this.ensureCurrentReviewerAndProcess(userId, action);
    } else {
      console.log('❌ User is not an assigned reviewer');
      this.toasterService.errorToast('You are not an assigned reviewer for this form.');
    }
  }

  // Helper method to ensure user is current reviewer and then process
  private ensureCurrentReviewerAndProcess(userId: number, action: 'approve' | 'reject') {
    if (!this.workflowData?.data?.submission_id) {
      console.warn('⚠️ Cannot set current reviewer: submission_id is missing.');
      return;
    }

    console.log('🔧 Ensuring user is current reviewer...');
    console.log('  - Submission ID:', this.workflowData.data.submission_id);
    console.log('  - User ID:', userId);

    const payload = {
      submission_id: this.workflowData.data.submission_id.toString(),
      user_id: userId
    };

    console.log('📤 Sending setCurrentReviewer payload:', payload);

    this.processExecutionService.setDynamicCurrentReviewer(payload).subscribe({
      next: (response: any) => {
        console.log('📥 setCurrentReviewer response received:', response);
        if (response.stat === 200) {
          this.isCurrentReviewer = true;
          console.log('✅ Current reviewer set successfully, now processing review...');

          // Now process the review action
          setTimeout(() => {
            this.processReviewAction(action, userId);
          }, 500);
        } else {
          console.warn('⚠️ setCurrentReviewer failed, but trying to process review anyway...');
          this.toasterService.errorToast(response.msg || 'Failed to set current reviewer.');

          // Try to process the review anyway (fallback)
          setTimeout(() => {
            this.processReviewAction(action, userId);
          }, 500);
        }
      },
      error: (error: any) => {
        console.error('❌ Error setting current reviewer:', error);
        this.toasterService.errorToast('Failed to set current reviewer.');

        // Try to process the review anyway (fallback)
        console.warn('⚠️ setCurrentReviewer error, but trying to process review anyway...');
        setTimeout(() => {
          this.processReviewAction(action, userId);
        }, 500);
      }
    });
  }

  // Helper method to process the actual review action
  private processReviewAction(action: 'approve' | 'reject', userId: number, userRole?: number) {
    const payload = {
      submission_id: this.workflowData!.data.submission_id.toString(),
      action: action,
      comment: this.newComment.trim(),
      user_id: userId,
      user_role: userRole || this.userRole
    };

    console.log('📤 Sending processDynamicReview payload:', payload);
    console.log('🔍 Current state - isCurrentReviewer:', this.isCurrentReviewer);
    console.log('🔍 Current state - isAssignedReviewer:', this.isAssignedReviewer);
    console.log('🔍 Current state - reviewSequence:', this.reviewSequence);

    this.processExecutionService.processDynamicReview(payload).subscribe({
      next: (response: any) => {
        console.log('📥 processDynamicReview response received:', response);

        if (response.stat === 200) {
          // Mark this reviewer as done so UI disables inputs immediately
          this.hasReviewed = true;
          this.myReviewStatus = action === 'approve' ? 'approved' : 'rejected';

          if (action === 'approve') {
            if (response.next_reviewer) {
              this.toasterService.successToast(`Approved! Form forwarded to next reviewer: ${response.next_reviewer}`);
            } else {
              this.toasterService.successToast('Form approved! All reviewers have approved.');
            }
          } else {
            this.toasterService.successToast('Form rejected and kept with current reviewer for resubmission.');
          }

          // Clear comment
          this.newComment = '';

          // Reload workflow data to reflect changes
          setTimeout(() => {
            this.loadWorkflowData();
            this.loadSubmissionReviewers();
          }, 1000);
        } else if (response.stat === 403) {
          console.error('❌ 403 Error - Backend validation failed');
          console.error('❌ This suggests the backend needs to be updated');
          this.toasterService.errorToast('Backend validation failed. Please contact administrator.');
        } else {
          console.error('❌ processDynamicReview failed:', response);
          this.toasterService.errorToast(response.msg || `Error processing ${action}`);
        }
      },
      error: (error: any) => {
        console.error(`❌ Error processing ${action}:`, error);
        this.toasterService.errorToast(`Error processing ${action}`);
      }
    });
  }

  // Approve and forward to next reviewer
  approveAndForwardDynamic() {
    this.processDynamicReview('approve');
  }

  // Reject and send back to operator
  rejectAndSendBackDynamic() {
    this.processDynamicReview('reject');
  }

  // Set the current reviewer for a dynamic workflow
  setCurrentReviewer(userId: number) {
    if (!this.workflowData?.data?.submission_id) {
      console.warn('⚠️ Cannot set current reviewer: submission_id is missing.');
      return;
    }

    console.log('🔧 Setting current reviewer...');
    console.log('  - Submission ID:', this.workflowData.data.submission_id);
    console.log('  - User ID:', userId);
    console.log('  - Current workflow status:', this.currentStatus);

    const payload = {
      submission_id: this.workflowData.data.submission_id.toString(),
      user_id: userId
    };

    console.log('📤 Sending payload:', payload);

    this.processExecutionService.setDynamicCurrentReviewer(payload).subscribe({
      next: (response: any) => {
        console.log('📥 Response received:', response);
        if (response.stat === 200) {
          this.isCurrentReviewer = true;
          this.toasterService.successToast(`You are now the current reviewer for this form.`);
          console.log('✅ Current reviewer set successfully');

          // Don't automatically reload to prevent infinite loops
          // Reload workflow data to get updated info
          // setTimeout(() => {
          //   this.loadWorkflowData();
          //   this.loadDynamicCurrentReviewerInfo();
          // }, 500);
        } else {
          this.toasterService.errorToast(response.msg || 'Failed to set current reviewer.');
          console.error('❌ Error setting current reviewer:', response.msg);
        }
      },
      error: (error: any) => {
        console.error('❌ Error setting current reviewer:', error);
        this.toasterService.errorToast('Failed to set current reviewer.');
      }
    });
  }

  // Force set first reviewer as current if none is set
  forceSetFirstReviewerAsCurrent() {
    if (!this.workflowData?.data?.submission_id || this.currentStatus !== 'under_review') return;

    const userData = localStorage.getItem('userData');
    const userId = userData ? JSON.parse(userData).admin_id : 1;

    // Only for reviewers, not operators
    if (this.userRole === 8) return;

    console.log('🔧 forceSetFirstReviewerAsCurrent called');
    console.log('  - User ID:', userId);
    console.log('  - User Role:', this.userRole);

    // Get the first reviewer from the reviewer assignments
    if (this.reviewAssignments && this.reviewAssignments.length > 0) {
      const firstReviewer = this.reviewAssignments[0];
      console.log('🔍 First reviewer from assignments:', firstReviewer);

      if (firstReviewer.reviewer_id == userId) {
        console.log('🔧 User is first reviewer - setting as current');
        this.setCurrentReviewer(userId);

        // Force reload the reviewer info after setting current reviewer
        setTimeout(() => {
          this.loadDynamicCurrentReviewerInfo();
        }, 500);
      } else {
        console.log('❌ User is not the first reviewer');
        console.log('  - First reviewer ID:', firstReviewer.reviewer_id);
        console.log('  - User ID:', userId);
      }
    } else {
      console.log('❌ No reviewer assignments found');
    }
  }

  // Force set current reviewer if they are assigned and the status is under_review
  forceSetCurrentReviewer(userId: number) {
    if (!this.workflowData?.data?.submission_id || this.currentStatus !== 'under_review') return;

    console.log('🔧 forceSetCurrentReviewer called');
    console.log('  - Submission ID:', this.workflowData.data.submission_id);
    console.log('  - User ID:', userId);
    console.log('  - Current Status:', this.currentStatus);

    const payload = {
      submission_id: this.workflowData.data.submission_id.toString(),
      user_id: userId
    };

    console.log('📤 Sending payload:', payload);

    this.processExecutionService.setDynamicCurrentReviewer(payload).subscribe({
      next: (response: any) => {
        console.log('📥 Response received:', response);
        if (response.stat === 200) {
          this.isCurrentReviewer = true;
          this.toasterService.successToast(`You are now the current reviewer for this form.`);
          console.log('✅ Current reviewer set successfully');

          // Don't automatically reload to prevent infinite loops
          // Reload workflow data to get updated info
          // setTimeout(() => {
          //   this.loadWorkflowData();
          //   this.loadDynamicCurrentReviewerInfo();
          // }, 500);
        } else {
          this.toasterService.errorToast(response.msg || 'Failed to set current reviewer.');
          console.error('❌ Error setting current reviewer:', response.msg);
        }
      },
      error: (error: any) => {
        console.error('❌ Error setting current reviewer:', error);
        this.toasterService.errorToast('Failed to set current reviewer.');
      }
    });
  }

  // Get current user ID from localStorage
  getUserId(): number {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData).admin_id : 1;
  }

  // Temporary method to fix reviewer assignment for existing submissions
  reassignReviewers() {
    if (!this.workflowData?.data?.submission_id) {
      this.toasterService.errorToast('No submission found');
      return;
    }

    const payload = {
      submission_id: this.workflowData.data.submission_id.toString()
    };

    console.log('🔧 Reassigning reviewers for submission:', payload);

    this.processExecutionService.reassignReviewersForExistingSubmission(payload).subscribe({
      next: (response: any) => {
        if (response.stat === 200) {
          this.toasterService.successToast('Reviewers reassigned successfully!');
          console.log('✅ Reviewers reassigned:', response);

          // Reload workflow data to reflect changes
          setTimeout(() => {
            this.loadWorkflowData();
          }, 1000);
        } else {
          this.toasterService.errorToast(response.msg || 'Failed to reassign reviewers');
          console.error('❌ Failed to reassign reviewers:', response);
        }
      },
      error: (error: any) => {
        console.error('❌ Error reassigning reviewers:', error);
        this.toasterService.errorToast('Error reassigning reviewers');
      }
    });
  }
}
