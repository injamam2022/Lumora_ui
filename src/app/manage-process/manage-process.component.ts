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

  public constructor(
    public processExecutionService: ProcessExecutionService,
    public dialogService: DialogService,
    public router: Router,
    public toasterService: ToasterService
  ) {}

  ngOnInit() {
    const userData = localStorage.getItem('userData');
    const roleId = userData ? JSON.parse(userData).role_id : undefined;
    this.processExecutionService.getAllProcess(roleId).subscribe((response) => {
      console.log(response);
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
          // 2. Show confirmation dialog and assign if confirmed
          if (confirm('Do you want to edit this process?')) {
            this.processExecutionService.assignProcessToUser(editId, roleId, userId).subscribe({
              next: (assignResponse) => {
                if (assignResponse && assignResponse.stat === 200) {
                  this.router.navigate(['/stage-creation/' + editId]);
                } else {
                  this.toasterService.errorToast(assignResponse?.msg || 'Could not assign process.');
                }
              },
              error: () => {
                this.toasterService.errorToast('Error assigning process.');
              }
            });
          }
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

  public openAddProcessPage() {
    this.router.navigateByUrl('/process-creation');
  }
}
