import { Component } from '@angular/core';
import { RoleHttpClientService } from '../role/service/role-http-client.service';
import {
  AllListAssignedToWorkFlow,
  ListOfRoles,
  Role,
} from '../role/interface/role.interface';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { ToasterService } from '../shared/services/toaster.service';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AssignProcessToRole } from '../stage-creation/interface/process-creation.interface';
import { ProcessExecutionService } from '../shared/services/process-execution.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-assign-to-role',
  standalone: true,
  imports: [ButtonModule, FormsModule, CommonModule, DropdownModule],
  templateUrl: './assign-to-role.component.html',
  styleUrl: './assign-to-role.component.scss',
})
export class AssignToRoleComponent {
  public allRoleData!: Role;

  public allListAssignedToWorkFlow: AllListAssignedToWorkFlow = {
    stat: 0,
    msg: '',
    list_count: 0,
    all_list: [],
  };

  // Track newly added roles only
  public newRoles: ListOfRoles[] = [];

  constructor(
    public roleHttpClientService: RoleHttpClientService,
    public dialogService: DialogService,
    public processExecutionService: ProcessExecutionService,
    public toasterService: ToasterService,
    private readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig
  ) {}

  public ngOnInit() {
    const processId = this.config.data.processId;

    // Load all available roles
    this.roleHttpClientService.getAllRoles().subscribe((response) => {
      this.allRoleData = response;
    });

    // Load already assigned roles
    this.roleHttpClientService
      .getAllAlreadyAssignedWorkFlowRoles(processId)
      .subscribe((response) => {
        if (
          response &&
          Array.isArray(response.all_list) &&
          response.all_list.length > 0
        ) {
          this.allListAssignedToWorkFlow = response;
        } else {
          // If no existing roles, add an initial empty one
          this.addAnotherRole();
        }
      });
  }

  public addAnotherRole() {
    const processId = this.config.data.processId;

    const newRole: ListOfRoles = {
      assign_process_to_role_id: '',
      process_id: processId,
      role_id: '',
      del_status: '0',
    };

    this.allListAssignedToWorkFlow.all_list.push(newRole);
    this.newRoles.push(newRole); // Only track new ones
  }

  public removeRole(index: number) {
    const removed = this.allListAssignedToWorkFlow.all_list.splice(index, 1)[0];

    // If it's one of the newly added roles, remove it from that list too
    const newIndex = this.newRoles.indexOf(removed);
    if (newIndex > -1) {
      this.newRoles.splice(newIndex, 1);
    }
  }

  public submitAllRoles() {
    if (this.newRoles.length === 0) {
      this.toasterService.successToast('No new roles to assign');
      return;
    }

    const requests = this.newRoles.map((role) => {
      const payload: AssignProcessToRole = {
        process_id: role.process_id,
        role_id: role.role_id,
      };
      return this.processExecutionService.assIgnProcessToRole(payload);
    });

    forkJoin(requests).subscribe({
      next: () => {
        this.toasterService.successToast('New roles assigned successfully');
        this.ref.close();
      },
      error: (err) => {
        this.toasterService.errorToast('Some roles failed to assign');
        console.error(err);
      },
    });
  }
}
