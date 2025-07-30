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
    MultiSelectModule
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
    console.log('=== COMPONENT INITIALIZED ===');
    console.log('Process ID from input:', this.processId);

    this.loadProcessData();
    this.loadDropdownData();
    this.startTimerUpdates();
  }

  ngOnDestroy() {
    this.stopTimerUpdates();
  }

    loadProcessData() {
    this.processExecutionService
    .getSingleProcessExecution(this.processId)
    .subscribe((response) => {
      this.processData = response.data;
        console.log('Process data loaded:', this.processData);

        // Debug: Check for duplicate tasks and parameters
        if (this.processData && this.processData.stages) {
          this.processData.stages.forEach((stage: any, stageIndex: number) => {
            console.log(`Stage ${stageIndex}: ${stage.stage_name}`);
            if (stage.tasks) {
              const taskIds = stage.tasks.map((task: any) => task.task_id);
              const uniqueTaskIds = [...new Set(taskIds)];
              if (taskIds.length !== uniqueTaskIds.length) {
                console.warn(`Duplicate tasks found in stage ${stage.stage_name}:`, taskIds);
                // Remove duplicates
                const seen = new Set();
                stage.tasks = stage.tasks.filter((task: any) => {
                  const duplicate = seen.has(task.task_id);
                  seen.add(task.task_id);
                  return !duplicate;
                });
              }
              stage.tasks.forEach((task: any, taskIndex: number) => {
                console.log(`  Task ${taskIndex}: ${task.task_name} (ID: ${task.task_id})`);
                if (task.parameters) {
                  const paramIds = task.parameters.map((param: any) => param.parameter_id);
                  const uniqueParamIds = [...new Set(paramIds)];
                  if (paramIds.length !== uniqueParamIds.length) {
                    console.warn(`    Duplicate parameters found in task ${task.task_name}:`, paramIds);
                    // Remove duplicates
                    const seen = new Set();
                    task.parameters = task.parameters.filter((param: any) => {
                      const duplicate = seen.has(param.parameter_id);
                      seen.add(param.parameter_id);
                      return !duplicate;
                    });
                  }
                }
              });
            }
          });
                }
      });
  }

  loadDropdownData() {
    let dropdownsLoaded = 0;
    const totalDropdowns = 4; // facilities, departments, rooms, materials

    const checkAllDropdownsLoaded = () => {
      dropdownsLoaded++;
      console.log(`Dropdown loaded: ${dropdownsLoaded}/${totalDropdowns}`);
      if (dropdownsLoaded === totalDropdowns) {
        console.log('All dropdowns loaded, now loading form data...');
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
    console.log('=== LOADING PORTABLE RESOURCES ===');
    this.portableResourceService.getAllPortableResources().subscribe((response) => {
      console.log('=== PORTABLE RESOURCES DEBUG ===');
      console.log('Portable Resources API Response:', response);
      console.log('Response status:', response.stat);
      console.log('Response message:', response.msg);
      console.log('Response all_list:', response.all_list);
      console.log('Response all_list type:', typeof response.all_list);
      console.log('Response all_list length:', response.all_list?.length);

      if (response.stat === 200) {
        this.allPortableResources = response.all_list;
        this.initializePortableResourceActivities();
        console.log('Loaded Portable Resources:', this.allPortableResources);
        console.log('Portable Resources Count:', this.allPortableResources.length);
        console.log('allPortableResources array:', this.allPortableResources);
      } else {
        console.error('Failed to load portable resources:', response.msg);
        console.error('Response status:', response.stat);
      }
      console.log('=== END PORTABLE RESOURCES DEBUG ===');
    }, (error) => {
      console.error('=== PORTABLE RESOURCES ERROR ===');
      console.error('Error loading portable resources:', error);
      console.error('Error details:', error.message);
      console.error('Error status:', error.status);
      console.error('Error response:', error.error);
      console.error('=== END PORTABLE RESOURCES ERROR ===');
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
    console.log('=== SUBMITTING FORM ===');
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

    console.log('Submitting form data:', submissionData);
    console.log('Parameter values to save:', parameterValues);

    this.processExecutionService.submitFormData(submissionData).subscribe({
      next: (response) => {
        if (response.stat === 200) {
          this.toasterService.successToast('Form submitted successfully');
          // Optionally navigate to a success page or reset form
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

          // Always resume from the accumulated time, regardless of timer state
          timer.startTime = Date.now();
          timer.isRunning = true;
          timer.isPaused = false;

          console.log(`Resuming timer for ${resourceKey} from accumulated time: ${timer.accumulatedTime}ms`);

          // Update resource time data
          if (this.resourceTimeData[resourceKey]) {
            this.resourceTimeData[resourceKey].activity_type = 'resume';
            this.resourceTimeData[resourceKey].timestamp = new Date().toISOString();
            this.resourceTimeData[resourceKey].resource_type = this.isPortableResource(resource) ? 'portable' : 'fixed';
          }
        }
        break;
    }

    // Update digital clock display
    this.updateDigitalClock(resourceKey);

    console.log('Activity updated:', activity, 'for resource:', resourceKey);
    console.log('Is portable resource:', this.isPortableResource(resource));
    console.log('Resource type:', this.isPortableResource(resource) ? 'portable' : 'fixed');
    console.log('Timer state:', timer);
    console.log('Resource time data:', this.resourceTimeData);
  }

  // Update digital clock display
  updateDigitalClock(resourceKey: string) {
    const timer = this.clockTimers[resourceKey];
    if (!timer) return;

    let totalTime = 0;

    if (timer.isRunning) {
      // Timer is currently running - add current elapsed to accumulated time
      const currentElapsed = Date.now() - timer.startTime;
      totalTime = timer.accumulatedTime + currentElapsed;
    } else if (timer.isPaused) {
      // Timer is paused, show accumulated time
      totalTime = timer.accumulatedTime;
    } else if (timer.totalElapsed > 0) {
      // Timer has been stopped, show final time
      totalTime = timer.totalElapsed;
    }

    this.digitalClocks[resourceKey] = this.formatTime(totalTime);

    // Debug logging for resume functionality
    if (timer.isRunning) {
      console.log(`Digital clock update for ${resourceKey}: running, accumulated=${timer.accumulatedTime}ms, current=${Date.now() - timer.startTime}ms, total=${totalTime}ms`);
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
      console.log('No process ID available for loading parameter values');
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

    console.log('Checking existing submissions with payload:', payload);
    this.processExecutionService.getFormSubmissions(payload).subscribe({
      next: (response: any) => {
        console.log('Form submissions response:', response);
        if (response.stat === 200 && response.all_list && response.all_list.length > 0) {
          console.log('Found existing submissions, loading parameter values...');
          this.loadSavedParameterValues();
        } else {
          console.log('No existing submissions found for this process');
        }
      },
      error: (error: any) => {
        console.error('Error checking existing submissions:', error);
      }
    });
  }

        // Load saved parameter values from the database
  loadSavedParameterValues() {
    console.log('=== LOADING SAVED PARAMETER VALUES ===');
    console.log('Process ID:', this.processId);
    console.log('Process ID type:', typeof this.processId);

    this.processExecutionService.getCompleteFormData(this.processId).subscribe({
      next: (response) => {
        console.log('=== RESPONSE RECEIVED ===');
        console.log('Response:', response);

        if (response.stat === 200 && response.data) {
          console.log('Loaded complete form data:', response.data);

          // Load static fields
          if (response.data.static_fields) {
            const staticFields = response.data.static_fields;
            console.log('Loading static fields:', staticFields);
            console.log('Available facilities count:', this.facilities.length);
            console.log('Available departments count:', this.departments.length);
            console.log('Available rooms count:', this.rooms.length);
            console.log('Available materials count:', this.materials.length);

            // Set facility
            if (staticFields.facility_id) {
              console.log('Looking for facility_id:', staticFields.facility_id);
              console.log('Available facilities:', this.facilities);
              console.log('Facility IDs available:', this.facilities.map(f => f.facility_id));
                            this.selectedFacility = this.facilities.find(f =>
                String(f.facility_id) === String(staticFields.facility_id)
              ) || null;
              console.log('Set facility:', this.selectedFacility);

              if (!this.selectedFacility) {
                console.warn('⚠️ Facility not found! Looking for ID:', staticFields.facility_id);
                console.warn('Available facility IDs:', this.facilities.map(f => f.facility_id));
              }
            }

            // Set department
            if (staticFields.department_id) {
              console.log('Looking for department_id:', staticFields.department_id);
              console.log('Available departments:', this.departments);
              console.log('Department IDs available:', this.departments.map(d => d.department_id));
              this.selectedDepartment = this.departments.find(d =>
                String(d.department_id) === String(staticFields.department_id)
              ) || null;
              console.log('Set department:', this.selectedDepartment);

              if (!this.selectedDepartment) {
                console.warn('⚠️ Department not found! Looking for ID:', staticFields.department_id);
                console.warn('Available department IDs:', this.departments.map(d => d.department_id));
              }
            }

            // Set room
            if (staticFields.room_id) {
              console.log('Looking for room_id:', staticFields.room_id);
              console.log('Available rooms:', this.rooms);
              console.log('Room IDs available:', this.rooms.map(r => r.room_id));
              this.selectedRoom = this.rooms.find(r =>
                String(r.room_id) === String(staticFields.room_id)
              ) || null;
              console.log('Set room:', this.selectedRoom);

              if (!this.selectedRoom) {
                console.warn('⚠️ Room not found! Looking for ID:', staticFields.room_id);
                console.warn('Available room IDs:', this.rooms.map(r => r.room_id));
              }
            }

            // Set material
            if (staticFields.material_id) {
              console.log('Looking for material_id:', staticFields.material_id);
              console.log('Available materials:', this.materials);
              console.log('Material IDs available:', this.materials.map(m => m.product_id));
              this.selectedMaterial = this.materials.find(m =>
                String(m.product_id) === String(staticFields.material_id)
              ) || null;
              console.log('Set material:', this.selectedMaterial);

              if (!this.selectedMaterial) {
                console.warn('⚠️ Material not found! Looking for ID:', staticFields.material_id);
                console.warn('Available material IDs:', this.materials.map(m => m.product_id));
              }
            }

            // Set material description
            if (staticFields.material_description) {
              this.materialDescription = staticFields.material_description;
              console.log('Set material description:', this.materialDescription);
            }

            // Load fixed resources
            if (staticFields.fixed_resources && Array.isArray(staticFields.fixed_resources)) {
              this.roomFixedResources = staticFields.fixed_resources;
              console.log('Set fixed resources:', this.roomFixedResources);
            }

            // Load portable resources
            if (staticFields.portable_resources && Array.isArray(staticFields.portable_resources)) {
              this.selectedPortableResources = staticFields.portable_resources;
              console.log('Set portable resources:', this.selectedPortableResources);
            }

            // Summary of static fields loaded
            console.log('=== STATIC FIELDS LOADED ===');
            console.log('Facility:', this.selectedFacility?.location_name || 'Not found');
            console.log('Department:', this.selectedDepartment?.department_name || 'Not found');
            console.log('Room:', this.selectedRoom?.room_name || 'Not found');
            console.log('Material:', this.selectedMaterial?.product_name || 'Not found');
            console.log('Material Description:', this.materialDescription);
          }

                    // Load parameter values
          if (response.data.parameter_values) {
            console.log('Loading parameter values:', response.data.parameter_values);

            // Populate formData with saved values
            for (const parameterId in response.data.parameter_values) {
              if (response.data.parameter_values.hasOwnProperty(parameterId)) {
                this.formData[parameterId] = response.data.parameter_values[parameterId];
                console.log(`Setting formData[${parameterId}] = ${response.data.parameter_values[parameterId]}`);
              }
            }
          } else {
            console.warn('⚠️ No parameter_values found in response');
          }

          // Also check form_data from the submission
          if (response.data.form_data) {
            console.log('Loading form_data from submission:', response.data.form_data);

            // Populate formData with saved values from form_data
            for (const parameterId in response.data.form_data) {
              if (response.data.form_data.hasOwnProperty(parameterId)) {
                this.formData[parameterId] = response.data.form_data[parameterId];
                console.log(`Setting formData[${parameterId}] from form_data = ${response.data.form_data[parameterId]}`);
              }
            }
          } else {
            console.warn('⚠️ No form_data found in response');
          }

          console.log('Form data populated with saved values:', this.formData);
          console.log('Current formData keys:', Object.keys(this.formData));

          // Load resource time data
          if (response.data.resource_time_data && Array.isArray(response.data.resource_time_data)) {
            this.loadSavedResourceTimeData(response.data.resource_time_data);
          } else {
            console.warn('⚠️ No resource time data found in response');
          }

          // Check if the form fields are properly bound
          if (this.processData && this.processData.stages) {
            console.log('=== CHECKING FORM FIELD BINDING ===');
            this.processData.stages.forEach((stage: any) => {
              if (stage.tasks) {
                stage.tasks.forEach((task: any) => {
                  if (task.parameters) {
                    task.parameters.forEach((param: any) => {
                      console.log(`Parameter ${param.parameter_id}: ${param.parameter_name} = ${this.formData[param.parameter_id]}`);
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
            console.log('Form should now be updated with loaded values');
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
    console.log('=== LOADING SAVED RESOURCE TIME DATA ===');
    console.log('Resource time data:', resourceTimeData);

    if (!resourceTimeData || resourceTimeData.length === 0) {
      console.warn('No resource time data to load');
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

    console.log('Resource groups:', resourceGroups);

    // Process each resource's time data
    Object.keys(resourceGroups).forEach(resourceKey => {
      const timeEntries = resourceGroups[resourceKey];
      console.log(`Processing resource: ${resourceKey}`);
      console.log('Time entries:', timeEntries);

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
        console.warn(`Resource not found: ${resourceKey}`);
        return;
      }

      console.log(`Found resource:`, resource);

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
      console.log(`Last activity for ${resourceKey}:`, lastActivity);

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
      console.log(`Elapsed time for ${resourceKey}: ${lastActivity.elapsed_time} -> ${elapsedTimeMs}ms`);

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

      console.log(`Timer state for ${resourceKey}:`, timer);
      console.log(`Digital clock for ${resourceKey}:`, this.digitalClocks[resourceKey]);
      console.log(`Resource time data for ${resourceKey}:`, this.resourceTimeData[resourceKey]);
    });

    console.log('=== RESOURCE TIME DATA LOADED ===');

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
      console.log('Starting timer updates for running resources');
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
    }, 100); // Update every 100ms
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

    // Portable resources
    this.selectedPortableResources.forEach((resource: any) => {
      const resourceKey = `${resource.resource_id}_${resource.resource_name}`;
      this.updateDigitalClock(resourceKey);
    });
  }
}
