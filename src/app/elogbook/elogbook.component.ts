import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ButtonModule } from 'primeng/button';
import { GenericTableComponent } from '../shared/components/generic-table/generic-table.component';
import { TableColumn } from '../user/interface/table-column.interface';
import { CommonModule } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ElogbookFormBuilderComponent } from './elogbook-form-builder.component';
import { ElogbookService } from '../shared/services/elog-execution.service';
import { ElogbookListData } from '../manage-process/interface/manage-process-interface';
import { Router } from '@angular/router';
import { EntityIdMapping } from '../shared/enum/entity-is-mapping.enum';
import { ParameterManagementComponent } from '../shared/components/parameter-management/parameter-management/parameter-management.component';
import { FilterMatchMode } from 'primeng/api';
import { ToasterService } from '../shared/services/toaster.service';
import { AssignToRoleComponent } from '../assign-to-role/assign-to-role.component';
import { AssignElogToRoleComponent } from '../assign-to-role/assign-elog-to-role.component';

@Component({
  selector: 'app-elogbook',
  standalone: true,
  imports: [
    SidebarComponent,
    HeaderComponent,
    ButtonModule,
    GenericTableComponent,
    CommonModule,
    ElogbookFormBuilderComponent,
    ParameterManagementComponent,
    AssignToRoleComponent,
    AssignElogToRoleComponent
  ],
  providers: [DialogService],
  templateUrl: './elogbook.component.html',
  styleUrl: './elogbook.component.scss'
})
export class ElogbookComponent {
  public genericTableColumns: TableColumn[] = [];

  private ref: DynamicDialogRef | undefined;

  public allElogbookListData!: ElogbookListData;

  public entityIdMapping = EntityIdMapping;

  // Role-based button visibility properties
  public isAdmin: boolean = false;
  public showAddButton: boolean = false;
  public showDeleteButton: boolean = false;
  public showAssignButton: boolean = false;
  public showEditButton: boolean = true; // Always show edit button

  constructor(private dialogService: DialogService, private elogbookService: ElogbookService, public router: Router, public toasterService: ToasterService,) {
    this.checkUserRole();
    this.getElogbookList();
    this.setGenericTableColumns();
  }

  // Check user role and set button visibility
  private checkUserRole() {
    const userData = localStorage.getItem('userData');
    const user = userData ? JSON.parse(userData) : {};
    const roleId = user.role_id;

    // Support multiple admin role IDs
    const adminRoleIds = ['admin', '1']; // Add all admin role IDs here
    this.isAdmin = adminRoleIds.includes(roleId);

    // Set button visibility based on role
    this.showAddButton = this.isAdmin;
    this.showDeleteButton = this.isAdmin;
    this.showAssignButton = this.isAdmin;
    this.showEditButton = true; // Always show edit button for all users

    console.log('🔐 User role check:', {
      roleId: roleId,
      isAdmin: this.isAdmin,
      showAddButton: this.showAddButton,
      showDeleteButton: this.showDeleteButton,
      showAssignButton: this.showAssignButton,
      showEditButton: this.showEditButton
    });
  }

  assignElogbook(elogId: string) {
    // Security check - only admin can assign E-Logbook
    if (!this.isAdmin) {
      this.toasterService.errorToast('Access denied. Only administrators can assign E-Logbook entries.');
      return;
    }
    // Open elog-specific assignment dialog
    this.dialogService.open(AssignElogToRoleComponent, {
      data: { processId: elogId }, // Using processId for elogId
      header: 'Assign E-Logbook to Roles',
      width: '40%',
    });
  }
  ngOnInit() {
    // Optionally load from backend here
    const userData = localStorage.getItem('userData');
    const roleId = userData ? JSON.parse(userData).role_id : undefined;
    this.elogbookService.refreshElogbook$.subscribe((data) => {
    this.elogbookService.getAllElogBook(roleId).subscribe((response) => {
      console.log(response);
      this.allElogbookListData = response;
    }
  );
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
      this.router.navigate(['/elogs-creation'], { queryParams: { id: editId } });
      return;
    }

    // For regular users, navigate to make-elog-entry (form entry)
    this.router.navigate(['/make-elog-entry/' + editId]);
  }

  openAddElogbookPage() {
    // Security check - only admin can add E-Logbook
    if (!this.isAdmin) {
      this.toasterService.errorToast('Access denied. Only administrators can add E-Logbook entries.');
      return;
    }
    this.router.navigate(['/elogs-creation']);
  }

  setGenericTableColumns() {
    this.genericTableColumns = [
      {
        field: 'elogs_name',
        header: 'E-Logbook Name',
        hasFilter: true,
        hasSorting: true,
        translationColumnKey: 'E-Logbook Name',
        mappedProperty: 'elogs_name',
        matchModeOptions: [
          { label: 'Contains', value: FilterMatchMode.CONTAINS },
        ],
      },
      {
        field: 'sop_id',
        header: 'E-Logbook ID',
        hasFilter: true,
        hasSorting: true,
        translationColumnKey: 'E-Logbook ID',
        mappedProperty: 'sop_id',
        matchModeOptions: [
          { label: 'Contains', value: FilterMatchMode.CONTAINS },
        ],
      },
      /*{
        field: 'created_by',
        header: 'Created By',
        hasFilter: true,
        hasSorting: true,
        translationColumnKey: 'Created By',
        mappedProperty: 'created_by',
        matchModeOptions: [
          { label: 'Contains', value: FilterMatchMode.CONTAINS },
        ],
      },*/
      {
        field: 'added_date',
        header: 'Created Date',
        hasFilter: true,
        hasSorting: true,
        translationColumnKey: 'Created Date',
        mappedProperty: 'added_date',
        matchModeOptions: [
          { label: 'Contains', value: FilterMatchMode.CONTAINS },
        ],
      },
    ];
  }

  getElogbookList() {
    // Get user data to pass role ID for filtering
    const userData = localStorage.getItem('userData');
    const user = userData ? JSON.parse(userData) : {};
    const roleId = user.role_id || '1'; // Default to admin role if not found

    this.elogbookService.getAllElogBook(roleId).subscribe({
      next: (response: any) => {
        this.allElogbookListData = response;
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  public deleteParticularData(deleteId: string) {
    // Security check - only admin can delete E-Logbook
    if (!this.isAdmin) {
      this.toasterService.errorToast('Access denied. Only administrators can delete E-Logbook entries.');
      return;
    }

    console.log('Delete ID:', deleteId);
    this.elogbookService.deleteElogbook(deleteId).subscribe((response) => {
      console.log(response);
      if (response.stat === 200) {
        this.toasterService.successToast('Deleted Successfully');
        this.elogbookService.refreshTableData(true);
        this.getElogbookList();
      } /*else {
          alert('Failed to delete E-Logbook');
        }*/
      }
      /*error: () => {
        alert('Error deleting E-Logbook');
      }*/

  );

  }


}
