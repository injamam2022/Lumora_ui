import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { ButtonModule } from 'primeng/button';
import { GenericTableComponent } from '../shared/components/generic-table/generic-table.component';
import { TableColumn } from '../user/interface/table-column.interface';
import { FilterMatchMode } from 'primeng/api';
import { ProcessExecutionService } from '../shared/services/process-execution.service';
import {
  ProcessAllList,
  ProcessListData,
} from './interface/manage-process-interface';
import { EntityIdMapping } from '../shared/enum/entity-is-mapping.enum';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AssignToRoleComponent } from '../assign-to-role/assign-to-role.component';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ToasterService } from '../shared/services/toaster.service';
import { ParameterManagementComponent } from '../shared/components/parameter-management/parameter-management/parameter-management.component';

@Component({
  selector: 'app-manage-process',
  standalone: true,
  imports: [
    SidebarComponent,
    HeaderComponent,
    ButtonGroupModule,
    ButtonModule,
    GenericTableComponent,
    CommonModule,
    DynamicDialogModule,
    ParameterManagementComponent
  ],
  providers: [DialogService],
  templateUrl: './manage-process.component.html',
  styleUrl: './manage-process.component.scss',
})
export class ManageProcessComponent {
  public genericTableColumns: TableColumn[] = [
    {
      field: 'process_name',
      header: 'Process Name',
      hasFilter: true,
      hasSorting: true,
      matchModeOptions: [
        {
          label: 'Contains',
          value: FilterMatchMode.CONTAINS,
        },
      ],
      translationColumnKey: 'Process Name',
      mappedProperty: 'process_name',
    },
    {
      field: 'reference_document',
      header: 'Reference Document',
      hasFilter: true,
      hasSorting: true,
      matchModeOptions: [
        {
          label: 'Contains',
          value: FilterMatchMode.CONTAINS,
        },
      ],
      translationColumnKey: 'Reference Document',
      mappedProperty: 'reference_document',
    },
    {
      field: 'sop_id',
      header: 'Sop Id',
      hasFilter: true,
      hasSorting: true,
      matchModeOptions: [
        {
          label: 'Contains',
          value: FilterMatchMode.CONTAINS,
        },
      ],
      translationColumnKey: 'Sop Id',
      mappedProperty: 'sop_id',
    },
    {
      field: 'creation_status',
      header: 'Status',
      hasFilter: true,
      hasSorting: true,
      matchModeOptions: [
        {
          label: 'Contains',
          value: FilterMatchMode.CONTAINS,
        },
      ],
      translationColumnKey: 'Status',
      mappedProperty: 'creation_status',
    },
    {
      field: 'added_date',
      header: 'Created At',
      hasFilter: true,
      hasSorting: true,
      matchModeOptions: [
        {
          label: 'Contains',
          value: FilterMatchMode.CONTAINS,
        },
      ],
      translationColumnKey: 'Created At',
      mappedProperty: 'added_date',
    },
  ];

  public allProcessListData!: ProcessListData;

  public entityIdMapping = EntityIdMapping;

  // Button status properties
  public deleteButtonStatus: boolean = false;
  public editButtonStatus: boolean = true;
  public assignButtonStatus: boolean = false;
  public isAdmin: boolean = false;

  public constructor(
    public processExecutionService: ProcessExecutionService,
    public dialogService: DialogService,
    public router: Router,
    public toasterService: ToasterService
  ) {}

    ngOnInit() {
    console.log('=== MANAGE PROCESS INIT ===');

    // Check if user is admin
    const userData = localStorage.getItem('userData');
    const user = userData ? JSON.parse(userData) : {};
    const roleId = user.role_id;

    // Support multiple admin role IDs
    const adminRoleIds = ['admin', '1']; // Add all admin role IDs here
    this.isAdmin = adminRoleIds.includes(roleId);

    // Set button status based on admin role
    this.deleteButtonStatus = this.isAdmin;
    this.assignButtonStatus = this.isAdmin;

    console.log('User role ID:', roleId);
    console.log('Is admin:', this.isAdmin);
    console.log('Delete button status:', this.deleteButtonStatus);
    console.log('Edit button status:', this.editButtonStatus);
    console.log('Assign button status:', this.assignButtonStatus);

    this.processExecutionService.getAllProcess(roleId).subscribe((response) => {
      console.log('=== PROCESS LIST DATA ===');
      console.log('Response:', response);
      console.log('All list:', response?.all_list);
      if (response?.all_list && response.all_list.length > 0) {
        console.log('First process:', response.all_list[0]);
        console.log('Process ID field:', response.all_list[0].process_id);
      }
      this.allProcessListData = response;
    });
  }

  public editParticularData(editId: string) {
    const userData = localStorage.getItem('userData');
    const user = userData ? JSON.parse(userData) : {};
    const roleId = user.role_id;
    const userId = user.admin_id;

    // Support multiple admin role IDs
    const adminRoleIds = ['admin', '1']; // Add all admin role IDs here
    if (adminRoleIds.includes(roleId)) {
      this.router.navigate(['/stage-creation/' + editId]);
      return;
    }

    // 1. Check current assignment
    this.processExecutionService.checkProcessStatus(editId, roleId).subscribe({
      next: (response) => {
        const assignedUserId = response?.assigned_user_id;
        if (!assignedUserId || assignedUserId === userId) {
          // 2. Assign process directly without confirmation
          this.processExecutionService.assignProcessToUser(editId, roleId, userId).subscribe({
            next: (assignResponse) => {
              if (assignResponse && assignResponse.stat === 200) {
                this.router.navigate(['/make-forms-entry/' + editId]);
              } else {
                this.toasterService.errorToast(assignResponse?.msg || 'Could not assign process.');
              }
            },
            error: () => {
              this.toasterService.errorToast('Error assigning process.');
            }
          });
        } else {
          // 3. Show error if another user is editing
          this.toasterService.errorToast('Process is already assigned to another user.');
        }
      },
      error: () => {
        this.toasterService.errorToast('Error checking process status.');
      }
    });
  }

  public assignProcessData(assignProcessId: string) {
    this.dialogService.open(AssignToRoleComponent, {
      data: { processId: assignProcessId },
      header: 'Assign Work Flow',
      width: '40%',
    });
  }

  public deleteParticularData(deleteId: string) {
    console.log('=== DELETE PROCESS CALLED ===');
    console.log('Delete process with ID:', deleteId);
    console.log('Delete ID type:', typeof deleteId);
    console.log('Delete ID value:', deleteId);

    // Call the delete API directly without confirmation
    this.processExecutionService.deleteProcess(deleteId).subscribe({
      next: (response) => {
        console.log('Delete API response:', response);
        if (response && response.stat === 200) {
          this.toasterService.successToast('Process deleted successfully!');
          // Refresh the process list
          this.loadProcessList();
        } else {
          this.toasterService.errorToast(response?.msg || 'Failed to delete process.');
        }
      },
      error: (error) => {
        console.error('Error deleting process:', error);
        this.toasterService.errorToast('Error deleting process. Please try again.');
      }
    });
  }

  public openAddProcessPage() {
    this.router.navigateByUrl('/process-creation');
  }

  private loadProcessList() {
    const userData = localStorage.getItem('userData');
    const roleId = userData ? JSON.parse(userData).role_id : undefined;
    this.processExecutionService.getAllProcess(roleId).subscribe((response) => {
      console.log(response);
      this.allProcessListData = response;
    });
  }

  public testDeleteFunction() {
    console.log('=== TEST DELETE FUNCTION ===');
    if (this.allProcessListData?.all_list && this.allProcessListData.all_list.length > 0) {
      const firstProcess = this.allProcessListData.all_list[0];
      console.log('Testing delete with first process:', firstProcess);
      this.deleteParticularData(firstProcess.process_id);
    } else {
      console.log('No processes available for testing');
    }
  }


}
