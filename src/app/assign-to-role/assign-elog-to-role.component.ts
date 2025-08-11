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
import { ElogbookService } from '../shared/services/elog-execution.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-assign-elog-to-role',
  standalone: true,
  imports: [ButtonModule, FormsModule, CommonModule, DropdownModule],
  templateUrl: './assign-elog-to-role.component.html',
  styleUrl: './assign-elog-to-role.component.scss',
})
export class AssignElogToRoleComponent {
  public allRoleData: Role = {
    stat: 0,
    msg: '',
    list_count: 0,
    all_list: [],
  };

  public allListAssignedToWorkFlow: AllListAssignedToWorkFlow = {
    stat: 0,
    msg: '',
    list_count: 0,
    all_list: [],
  };

  // Track newly added roles only
  public newRoles: ListOfRoles[] = [];

  // Store users for each role
  public roleUsers: { [roleId: string]: any[] } = {};

  constructor(
    public roleHttpClientService: RoleHttpClientService,
    public dialogService: DialogService,
    public elogbookService: ElogbookService,
    public toasterService: ToasterService,
    public readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig
  ) {}

  public ngOnInit() {
    const elogId = this.config.data.processId; // Using processId for elogId

    // Load all available roles
    this.roleHttpClientService.getAllRoles().subscribe({
      next: (response) => {
        this.allRoleData = response;
        console.log('✅ Roles loaded for E-Logbook assignment:', this.allRoleData);

        // Load users for each role
        this.loadUsersForRoles();
      },
      error: (error) => {
        console.error('❌ Error loading roles:', error);
        this.toasterService.errorToast('Failed to load roles');
      }
    });

    // Load already assigned roles for elog
    this.loadAssignedElogRoles(elogId);
  }

  private loadUsersForRoles() {
    // Load users for each role (excluding Role 8)
    const reviewerRoles = [9, 10, 11, 12]; // Reviewer roles

    reviewerRoles.forEach(roleId => {
      console.log(`🔄 Loading users for role ${roleId}...`);
      this.elogbookService.getUsersByRole(roleId.toString()).subscribe({
        next: (response) => {
          console.log(`📡 Response for role ${roleId}:`, response);
          if (response.stat === 200 && response.data) {
            this.roleUsers[roleId] = response.data;
            console.log(`✅ Users loaded for role ${roleId}:`, response.data);
          } else {
            console.warn(`⚠️ No users found for role ${roleId}:`, response);
          }
        },
        error: (error) => {
          console.error(`❌ Error loading users for role ${roleId}:`, error);
        }
      });
    });
  }

  private loadAssignedElogRoles(elogId: string) {
    // Load already assigned roles for elog
    this.elogbookService.getAllAlreadyAssignedElogRoles(elogId).subscribe({
      next: (response) => {
        console.log('✅ Assigned E-Logbook roles loaded:', response);
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
      },
      error: (error) => {
        console.error('❌ Error loading assigned E-Logbook roles:', error);
        // If error, start with empty list
        this.addAnotherRole();
      }
    });
  }

  public addAnotherRole() {
    const elogId = this.config.data.processId;

    const newRole: any = {
      assign_process_to_role_id: '',
      process_id: elogId, // This will be elog_id
      role_id: '',
      assigned_user_id: '', // Add assigned user ID field
      del_status: '0',
    };

    this.allListAssignedToWorkFlow.all_list.push(newRole);
    this.newRoles.push(newRole);
  }

  public removeRole(index: number) {
    const removed = this.allListAssignedToWorkFlow.all_list.splice(index, 1)[0];

    // If it's one of the newly added roles, remove it from that list too
    const newIndex = this.newRoles.indexOf(removed);
    if (newIndex > -1) {
      this.newRoles.splice(newIndex, 1);
    }
  }

  public onRoleChange(index: number, roleId: string) {
    console.log(`🔄 Role changed for step ${index + 1} to role ${roleId}`);

    // Clear the assigned user when role changes
    this.allListAssignedToWorkFlow.all_list[index].assigned_user_id = '';

    // Load users for this role if not already loaded
    if (!this.roleUsers[roleId]) {
      console.log(`🔄 Loading users for role ${roleId}...`);
      this.elogbookService.getUsersByRole(roleId).subscribe({
        next: (response) => {
          console.log(`📡 Response for role ${roleId}:`, response);
          if (response.stat === 200 && response.data) {
            this.roleUsers[roleId] = response.data;
            console.log(`✅ Users loaded for role ${roleId}:`, response.data);
          } else {
            console.warn(`⚠️ No users found for role ${roleId}:`, response);
          }
        },
        error: (error) => {
          console.error(`❌ Error loading users for role ${roleId}:`, error);
        }
      });
    } else {
      console.log(`✅ Users already loaded for role ${roleId}:`, this.roleUsers[roleId]);
    }
  }

  public submitAllRoles() {
    if (this.allListAssignedToWorkFlow.all_list.length === 0) {
      this.toasterService.successToast('No roles to assign');
      return;
    }

    // Process all roles for elog assignment
    const requests = this.allListAssignedToWorkFlow.all_list.map((role, index) => {
      const payload = {
        elogs_id: role.process_id, // This is actually elog_id
        role_id: role.role_id,
        assigned_user_id: role.assigned_user_id, // Add assigned user ID
        step_order: (index + 1).toString()
      };
      return this.elogbookService.assignElogToRole(payload);
    });

    forkJoin(requests).subscribe({
      next: () => {
        this.toasterService.successToast('Elog workflow roles assigned successfully');
        this.ref.close();
      },
      error: (err) => {
        this.toasterService.errorToast('Some roles failed to assign');
        console.error(err);
      },
    });
  }
}
